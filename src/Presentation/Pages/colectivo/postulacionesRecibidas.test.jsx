import { screen, within } from "@testing-library/react";
import axios from "axios";
import { Route } from "react-router-dom";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { montarRutas } from "@/test/montarRutas.jsx";
import { RutaDelDueno } from "@/Presentation/Routes/RutaDelDueno.jsx";
import { RutaProtegida } from "@/Presentation/Routes/RutaProtegida.jsx";
import PostulacionesRecibidasPage from "./PostulacionesRecibidasPage.jsx";

const cuenta = { id: "1", rol: "COLECTIVO", perfilId: "c1" };
const adaptador = axiosClient.defaults.adapter;
const base = "/proyectos/p1/colaboraciones";
let proyecto;
let filas;
let transporte;
let dueño;
let falloDeConsulta;
let falloDeAccion;

function fila(id, estado, campos = {}) {
  return {
    id,
    estado,
    perfil: "pe1",
    esPublica: true,
    colaborador: { id, nombre: id },
    ...campos,
  };
}

beforeEach(() => {
  proyecto = {
    titulo: "Turnos del barrio",
    estado: "ABIERTO",
    perfiles: [{ id: "pe1", descripcion: "Interfaz", limiteColaboraciones: 1 }],
  };
  filas = [fila("Ada", "PENDIENTE")];
  dueño = true;
  falloDeConsulta = false;
  falloDeAccion = null;
  transporte = vi.fn(async (config) => {
    const { url, method } = config;
    const responder = (data) => ({
      config,
      status: 200,
      statusText: "OK",
      headers: {},
      data: structuredClone(data),
    });
    const fallar = (status) => {
      throw new axios.AxiosError("error", "ERR_BAD_RESPONSE", config, null, {
        status,
        data: {},
      });
    };
    if (url === "/colectivos/c1")
      return responder({ proyectos: dueño ? [{ id: "p1" }] : [] });
    if (url === "/proyectos/p1") return responder(proyecto);
    if (url === base) return falloDeConsulta ? fallar(500) : responder(filas);
    if (method === "post" && url.startsWith(base)) {
      const [, id, accion] = url.slice(base.length).split("/");
      const registro = filas.find((item) => item.id === id);
      const estado = {
        aceptacion: "ACEPTADA",
        rechazo: "RECHAZADA",
        desvinculacion: "DESVINCULADA",
      }[accion];
      registro.estado = estado;
      if (falloDeAccion) fallar(falloDeAccion);
      return responder(registro);
    }
    throw new Error(`Pedido inesperado: ${method} ${url}`);
  });
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptador;
});

function montar(query = "", usuario = cuenta) {
  return montarRutas(
    <>
      <Route element={<RutaProtegida roles={["COLECTIVO"]} />}>
        <Route
          element={
            <RutaDelDueno sinPermiso="Solo el colectivo dueño puede gestionar estas postulaciones." />
          }
        >
          <Route
            path="/proyectos/:id/postulaciones"
            element={<PostulacionesRecibidasPage />}
          />
        </Route>
      </Route>
      <Route path="/login" element={<h1>Ingresar</h1>} />
      <Route path="/sin-permiso" element={<h1>Sin permiso</h1>} />
    </>,
    { ruta: `/proyectos/p1/postulaciones${query}`, cuenta: usuario },
  );
}

const mutaciones = () =>
  transporte.mock.calls.filter(([config]) => config.method === "post");

test("el filtro va a la URL y el cupo se calcula con las filas fuera del filtro", async () => {
  filas.push(
    fila("Grace", "ACEPTADA"),
    fila("Histórica", "FINALIZADA", { perfil: "pe0" }),
  );
  const { user, router } = montar();
  expect(await screen.findByRole("heading", { name: "Perfil eliminado" })).toBeVisible();
  await user.selectOptions(screen.getByRole("combobox"), "PENDIENTE");
  expect(router.state.location.search).toBe("?estado=PENDIENTE");
  expect(screen.queryByText("Grace")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Aceptar" })).toBeDisabled();
  expect(screen.getByText("Límite alcanzado.")).toBeVisible();
});

test.each([
  ["Aceptar", "PENDIENTE", "Se aceptó la postulación.", "aceptacion"],
  ["Rechazar", "PENDIENTE", "Se rechazó la postulación.", "rechazo"],
  ["Desvincular", "ACEPTADA", "Se desvinculó la colaboración.", "desvinculacion"],
])(
  "%s confirma, actualiza el filtro y enfoca el título",
  async (accion, estado, aviso, ruta) => {
    filas = [
      fila("Ada", estado, {
        esPublica: false,
        colaborador: {
          id: "privado",
          nombre: "Ada secreta",
          habilidades: [{ titulo: "Secreta" }],
        },
      }),
    ];
    const { user } = montar(`?estado=${estado}`);
    expect(await screen.findByText("Postulación anónima")).toBeVisible();
    expect(screen.queryByText(/secreta/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Ada/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: accion }));
    let dialogo = screen.getByRole("dialog");
    expect(within(dialogo).getByRole("button", { name: "Cancelar" })).toHaveFocus();
    await user.click(within(dialogo).getByRole("button", { name: "Cancelar" }));
    expect(mutaciones()).toHaveLength(0);
    await user.click(screen.getByRole("button", { name: accion }));
    dialogo = screen.getByRole("dialog");
    await user.click(within(dialogo).getByRole("button", { name: accion }));
    expect(await screen.findByText(aviso)).toBeVisible();
    expect(screen.getByText("No hay postulaciones con este estado.")).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Postulaciones recibidas" }),
    ).toHaveFocus();
    expect(mutaciones()[0][0].url).toBe(`${base}/Ada/${ruta}`);
  },
);

test("una acción aplicada con fallo de recarga permite reintentar solo la consulta", async () => {
  const { user } = montar();
  await user.click(await screen.findByRole("button", { name: "Aceptar" }));
  falloDeConsulta = true;
  await user.click(
    within(screen.getByRole("dialog")).getByRole("button", { name: "Aceptar" }),
  );
  expect(await screen.findByText("Se aceptó la postulación.")).toBeVisible();
  expect(screen.getByText("No pudimos actualizar las postulaciones")).toBeVisible();
  falloDeConsulta = false;
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(await screen.findByText("Aceptada")).toBeVisible();
  expect(mutaciones()).toHaveLength(1);
});

test("un conflicto actualiza el estado desde el backend", async () => {
  falloDeAccion = 409;
  const { user } = montar();
  await user.click(await screen.findByRole("button", { name: "Aceptar" }));
  await user.click(
    within(screen.getByRole("dialog")).getByRole("button", { name: "Aceptar" }),
  );
  expect(await screen.findByText(/La postulación cambió/)).toBeVisible();
  expect(screen.getByText("Aceptada")).toBeVisible();
});

test.each([
  [cuenta, "No tenés permiso para ver esta página"],
  [{ ...cuenta, rol: "COLABORADORA" }, "Sin permiso"],
  [null, "Ingresar"],
])("una cuenta sin acceso no consulta el listado", async (usuario, titulo) => {
  dueño = false;
  montar("", usuario);
  expect(await screen.findByRole("heading", { name: titulo })).toBeVisible();
  expect(transporte.mock.calls.some(([config]) => config.url === base)).toBe(false);
});

test("un proyecto finalizado muestra el historial en modo de consulta", async () => {
  proyecto.estado = "FINALIZADO";
  filas = [fila("Ada", "ACEPTADA")];
  montar();
  expect(await screen.findByText("Aceptada")).toBeVisible();
  expect(screen.queryByRole("button", { name: "Desvincular" })).not.toBeInTheDocument();
});
