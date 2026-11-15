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
let codigoDeFallo;
let colaboradoras;
let falloDeColaboradora;

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
  codigoDeFallo = undefined;
  colaboradoras = {};
  falloDeColaboradora = null;
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
        data: codigoDeFallo ? { codigo: codigoDeFallo } : {},
      });
    };
    if (url === "/colectivos/c1")
      return responder({ proyectos: dueño ? [{ id: "p1" }] : [] });
    if (url === "/proyectos/p1")
      return responder({
        ...proyecto,
        id: "p1",
        colectivo: { id: dueño ? "c1" : "otro" },
      });
    if (url === base) return falloDeConsulta ? fallar(500) : responder(filas);
    if (url.startsWith("/colaboradores/")) {
      const idColaboradora = url.slice("/colaboradores/".length);
      if (falloDeColaboradora) fallar(falloDeColaboradora);
      return responder(
        colaboradoras[idColaboradora] ?? { id: idColaboradora, habilidades: [] },
      );
    }
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

const cuentaConPerfil = {
  ...cuenta,
  contextos: [{ tipo: "COLABORADOR", colaborador: { id: "Ada" } }],
};

test("una postulación del propio perfil no se puede aceptar ni rechazar y explica el motivo", async () => {
  montar("", cuentaConPerfil);
  const aceptar = await screen.findByRole("button", { name: "Aceptar" });
  expect(aceptar).toBeDisabled();
  expect(screen.getByRole("button", { name: "Rechazar" })).toBeDisabled();
  expect(
    screen.getAllByText(/Esta colaboración es de tu propio perfil/).length,
  ).toBeGreaterThan(0);
});

test("una postulación de otra persona sigue pudiéndose resolver", async () => {
  filas = [fila("Beto", "PENDIENTE")];
  montar("", cuentaConPerfil);
  expect(await screen.findByRole("button", { name: "Aceptar" })).toBeEnabled();
});

test("si el back responde COLABORACION_PROPIA se muestra el motivo en lenguaje de la persona", async () => {
  falloDeAccion = 422;
  codigoDeFallo = "COLABORACION_PROPIA";
  const { user } = montar();
  await user.click(await screen.findByRole("button", { name: "Aceptar" }));
  await user.click(
    within(screen.getByRole("dialog")).getByRole("button", { name: "Aceptar" }),
  );
  expect(
    await screen.findByText(/Esta colaboración es de tu propio perfil/),
  ).toBeVisible();
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

test("«Ver datos de contacto» aparece solo en aceptadas públicas con id y vuelve a las postulaciones", async () => {
  filas = [
    fila("Ada", "ACEPTADA"),
    fila("Grace", "PENDIENTE"),
    fila("Linus", "ACEPTADA", { colaborador: { nombre: "Linus" } }),
    fila("Anónima", "ACEPTADA", {
      esPublica: false,
      colaborador: { id: "privada", nombre: "Privada" },
    }),
  ];
  const { user, router } = montar("?estado=ACEPTADA");
  expect(await screen.findByRole("heading", { name: "Ada" })).toBeVisible();
  const enlaces = screen.getAllByRole("link", { name: "Ver datos de contacto" });
  expect(enlaces).toHaveLength(1);
  expect(enlaces[0]).toHaveAttribute("href", "/proyectos/p1/colaboradoras/Ada/contacto");
  expect(
    screen.getByText("Contribución anónima: no se comparten datos de contacto"),
  ).toBeVisible();
  expect(document.body).not.toHaveTextContent(/Privada/);
  await user.click(enlaces[0]);
  expect(router.state.location.pathname).toBe("/proyectos/p1/colaboradoras/Ada/contacto");
  expect(router.state.location.state).toEqual({
    volverA: "/proyectos/p1/postulaciones?estado=ACEPTADA",
    estadoDeVuelta: null,
    textoVolver: "Volver a las postulaciones",
  });
});

const react = { codigo: "react", titulo: "React" };
const css = { codigo: "css", titulo: "CSS" };
const sql = { codigo: "sql", titulo: "SQL" };

test("compara las habilidades de cada postulante con las requeridas del perfil", async () => {
  proyecto.perfiles[0] = {
    ...proyecto.perfiles[0],
    titulo: "Diseño de la web",
    habilidadesRequeridas: [react, css],
  };
  colaboradoras.Ada = { id: "Ada", habilidades: [react, sql] };
  montar();
  expect(await screen.findByText("Tiene 1 de 2 habilidades requeridas")).toBeVisible();
  const requeridas = screen.getByRole("list", { name: "Lo que pide el perfil" });
  expect(within(requeridas).getByText(/React/)).toHaveTextContent("React. La tiene");
  expect(within(requeridas).getByText(/CSS/)).toHaveTextContent("CSS. No la tiene");
  const otras = screen.getByRole("list", { name: "Otras habilidades" });
  expect(within(otras).getByText("SQL")).toBeVisible();
  expect(screen.getByRole("heading", { name: "Diseño de la web" })).toBeVisible();
});

test("una persona sin habilidades cargadas lo dice en su fila", async () => {
  montar();
  expect(await screen.findByText("Todavía no cargó habilidades.")).toBeVisible();
});

test("si fallan las habilidades se reintenta solo esa fila", async () => {
  falloDeColaboradora = 500;
  const { user } = montar();
  expect(await screen.findByText("No pudimos cargar sus habilidades.")).toBeVisible();
  expect(screen.getByRole("button", { name: "Aceptar" })).toBeEnabled();
  falloDeColaboradora = null;
  colaboradoras.Ada = { id: "Ada", habilidades: [sql] };
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(await screen.findByText("SQL")).toBeVisible();
  expect(transporte.mock.calls.filter(([c]) => c.url === base)).toHaveLength(1);
});

test("si el perfil de la persona ya no existe lo explica", async () => {
  falloDeColaboradora = 404;
  montar();
  expect(
    await screen.findByText("Su perfil de colaboradora ya no está disponible."),
  ).toBeVisible();
});

test("una postulación anónima no pide habilidades", async () => {
  filas = [fila("Ada", "PENDIENTE", { esPublica: false })];
  montar();
  expect(await screen.findByText("Postulación anónima")).toBeVisible();
  expect(transporte.mock.calls.some(([c]) => c.url.startsWith("/colaboradores/"))).toBe(
    false,
  );
});

test("el grupo sin título usa la descripción y el estado va en un sello", async () => {
  filas = [fila("Ada", "PENDIENTE", { fecha: "2026-11-10T12:00:00Z" })];
  montar();
  expect(await screen.findByRole("heading", { name: "Interfaz" })).toBeVisible();
  expect(screen.queryByRole("heading", { name: "Perfil 1" })).not.toBeInTheDocument();
  expect(screen.getByText("Pendiente").closest("span")).toBeVisible();
  expect(screen.getByText(/10 de noviembre de 2026/)).toBeVisible();
});

test("aceptar nombra a la persona y avisa que se comparten los datos de contacto", async () => {
  const { user } = montar();
  await user.click(await screen.findByRole("button", { name: "Aceptar" }));
  const dialogo = screen.getByRole("dialog", { name: "¿Aceptar a Ada?" });
  expect(within(dialogo).getByText(/sus datos de contacto/)).toBeVisible();
});

test("las acciones de una aceptada van en una sola fila", async () => {
  filas = [fila("Ada", "ACEPTADA")];
  montar();
  const contacto = await screen.findByRole("link", { name: "Ver datos de contacto" });
  const acciones = contacto.parentElement;
  expect(
    within(acciones).getByRole("button", { name: "Finalizar colaboración" }),
  ).toBeVisible();
  expect(within(acciones).getByRole("button", { name: "Desvincular" })).toBeVisible();
});
