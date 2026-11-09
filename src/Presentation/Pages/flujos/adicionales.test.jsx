import { useState } from "react";
import { act, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { Route } from "react-router-dom";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { Proveedores } from "@/test/Proveedores.jsx";
import { montarRutas } from "@/test/montarRutas.jsx";
import { crearSesionFalsa } from "@/Presentation/Dependencies/identidadDependencies.js";
import { RutaProtegida } from "@/Presentation/Routes/RutaProtegida.jsx";
import { BienvenidaPage } from "@/Presentation/Pages/ingreso/BienvenidaPage.jsx";
import { EstadisticasGlobales } from "@/Presentation/Components/Estadistica/EstadisticasGlobales.jsx";
import { EstadisticasDelColectivo } from "@/Presentation/Components/Estadistica/EstadisticasDelColectivo.jsx";
import { HistoriaDelColectivo } from "@/Presentation/Components/Colectivo/HistoriaDelColectivo.jsx";
import { BajaDelColectivo } from "@/Presentation/Components/Colectivo/BajaDelColectivo.jsx";
import { ValoracionesRecibidas } from "@/Presentation/Components/Valoracion/ValoracionesRecibidas.jsx";
import { AccionesDeColaboracion } from "@/Presentation/Components/Valoracion/AccionesDeColaboracion.jsx";

const original = axiosClient.defaults.adapter;
const CUENTA = { id: "cuenta", rol: "COLECTIVO", perfilId: "c1" };
const COLECTIVO = { id: "c1", nombre: "Huerta del Sur" };
const FECHA = "2026-11-09T12:00:00Z";
const ESTADISTICAS = {
  colectivos: { total: 2, activos: 1 },
  proyectos: { total: 3, abiertos: 2, finalizados: 1 },
  colaboradores: { total: 1500 },
  colaboraciones: { total: 10, pendientes: 2, aceptadas: 3, finalizadas: 5 },
  visualizaciones: 1234,
  avancePromedio: 33.3,
  logros: 2,
  porProyecto: [
    {
      id: "p1",
      titulo: "Turnos",
      estado: "ABIERTO",
      visualizaciones: 1234,
      porcentajeConcrecion: 33.3,
      logros: 2,
      colaboraciones: 10,
    },
  ],
  habilidadesMasRequeridas: [{ codigo: "react", cantidad: 2 }],
  habilidadesMasOfrecidas: [],
  generadoEn: FECHA,
};
let responder;
let pedidos;

function falla(config, status) {
  throw new axios.AxiosError("Error", "ERR_BAD_RESPONSE", config, null, {
    status,
    data: { message: "Error interno" },
    config,
  });
}

beforeEach(() => {
  pedidos = [];
  responder = async (config) => {
    if (config.url === "/estadisticas" || config.url.endsWith("/estadisticas"))
      return ESTADISTICAS;
    if (config.url === "/habilidades")
      return {
        data: [{ codigo: "react", titulo: "React", activo: true }],
        meta: { page: 1, per_page: 100, total: 1, total_pages: 1 },
      };
    if (config.url.endsWith("/timeline")) return [];
    if (config.url.endsWith("/valoraciones"))
      return { cantidad: 0, promedio: null, valoraciones: [] };
    return falla(config, 404);
  };
  axiosClient.defaults.adapter = async (config) => {
    pedidos.push(config);
    return {
      config,
      status: 200,
      statusText: "OK",
      headers: {},
      data: await responder(config),
    };
  };
});
afterEach(() => {
  axiosClient.defaults.adapter = original;
});

function montar(contenido, cuenta = CUENTA) {
  render(<Proveedores cuenta={cuenta}>{contenido}</Proveedores>);
  return userEvent.setup();
}

test("las cifras globales usan datos reales, suman colaboraciones y resuelven el catálogo", async () => {
  montar(<EstadisticasGlobales />, null);
  expect(await screen.findByText("1.500")).toBeVisible();
  expect(screen.getByText("Colaboraciones").closest("div")).toHaveTextContent("8");
  expect(await screen.findByText("React · 2")).toBeVisible();
  expect(screen.getByText("Habilidades más ofrecidas").parentElement).toHaveTextContent(
    "Todavía no hay habilidades para mostrar.",
  );
  expect(screen.getByText(/Actualizado el/).querySelector("time")).toHaveAttribute(
    "dateTime",
    FECHA,
  );
});

test("un fallo del catálogo permite reintentar sin perder las cifras ni volver a pedir estadísticas", async () => {
  const normal = responder;
  let fallar = true;
  responder = (config) =>
    config.url === "/habilidades" && fallar ? falla(config, 500) : normal(config);
  const user = montar(<EstadisticasGlobales />, null);
  await screen.findByText("No pudimos cargar los nombres de las habilidades");
  expect(screen.getByText("1.500")).toBeVisible();
  fallar = false;
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(await screen.findByText("React · 2")).toBeVisible();
  expect(pedidos.filter((p) => p.url === "/estadisticas")).toHaveLength(1);
});

test("una plataforma vacía oculta las cifras y no consulta el catálogo", async () => {
  responder = () => ({
    colectivos: { total: 0 },
    proyectos: { total: 0 },
    colaboradores: { total: 0 },
    colaboraciones: { total: 0 },
  });
  montar(<EstadisticasGlobales />, null);
  await waitFor(() =>
    expect(screen.queryByText("La plataforma en números")).not.toBeInTheDocument(),
  );
  expect(pedidos.map((p) => p.url)).toEqual(["/estadisticas"]);
});

test("las estadísticas del colectivo conservan unidades, enlaces y total independiente", async () => {
  montar(<EstadisticasDelColectivo id="c1" />);
  const tabla = await screen.findByRole("table");
  expect(within(tabla).getByRole("columnheader", { name: "Avance (%)" })).toBeVisible();
  expect(within(tabla).getByRole("link", { name: "Turnos" })).toHaveAttribute(
    "href",
    "/proyectos/p1",
  );
  expect(within(tabla).getByText("33,3")).toBeVisible();
  expect(screen.getByText(/Las visualizaciones no incluyen/)).toBeVisible();
  expect(pedidos.find((p) => p.url.endsWith("/estadisticas")).requiereSesion).toBe(true);
});

test("un colectivo sin proyectos ofrece publicar y un error no oculta contenido vecino", async () => {
  responder = () => ({ ...ESTADISTICAS, proyectos: { total: 0 } });
  montar(
    <>
      <p>Acciones rápidas</p>
      <EstadisticasDelColectivo id="c1" />
    </>,
  );
  expect(
    await screen.findByRole("link", { name: "Publicar un proyecto" }),
  ).toHaveAttribute("href", "/colectivo/proyectos/nuevo");
  expect(screen.getByText("Acciones rápidas")).toBeVisible();
});

test("la historia invierte el orden, representa los siete eventos, expande y respeta el anonimato", async () => {
  const tipos = [
    "ALTA_DEL_COLECTIVO",
    "PROYECTO_CREADO",
    "LOGRO",
    "AVANCE",
    "COLABORACION_CERRADA",
    "PROYECTO_FINALIZADO",
    "BAJA_DEL_COLECTIVO",
  ];
  responder = () =>
    Array.from({ length: 12 }, (_, i) => ({
      tipo: tipos[i % tipos.length],
      fecha: `2026-11-${String(i + 1).padStart(2, "0")}T12:00:00Z`,
      proyecto: i ? { id: "p1", titulo: "Turnos" } : null,
      logro: { titulo: "Primera entrega" },
      avance: { porcentajeConcrecion: 33.3 },
      colaborador: null,
    }));
  const user = montar(<HistoriaDelColectivo id="c1" />);
  const lista = await screen.findByRole("list");
  expect(within(lista).getAllByRole("listitem")).toHaveLength(10);
  expect(lista.querySelector("time")).toHaveAttribute("dateTime", "2026-11-12T12:00:00Z");
  expect(
    screen.getAllByText("Una persona colaboradora terminó su colaboración."),
  ).toHaveLength(2);
  expect(screen.queryByRole("link", { name: /Ver perfil/ })).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Ver toda la historia" }));
  expect(within(lista).getAllByRole("listitem")).toHaveLength(12);
  expect(
    screen.getByText("El colectivo se dio de baja. Su historia sigue visible."),
  ).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Ver menos historia" }));
  expect(within(lista).getAllByRole("listitem")).toHaveLength(10);
});

test("los errores de historia se pueden reintentar y una historia vacía se oculta", async () => {
  let fallar = true;
  responder = (config) => (fallar ? falla(config, 500) : []);
  const user = montar(
    <>
      <p>Perfil público</p>
      <HistoriaDelColectivo id="c1" />
    </>,
  );
  await screen.findByText("No pudimos cargar la historia");
  expect(screen.getByText("Perfil público")).toBeVisible();
  fallar = false;
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  await waitFor(() => expect(screen.queryByText("Historia")).not.toBeInTheDocument());
});

test.each([true, false])(
  "valoraciones públicas: promedio, comentario y autor disponible (colectivo: %s)",
  async (esColectivo) => {
    responder = () => ({
      cantidad: 1,
      promedio: 4.5,
      valoraciones: [
        {
          puntaje: 5,
          comentario: "Muy buen trabajo",
          fecha: FECHA,
          proyecto: { id: "p1", titulo: "Turnos" },
          ...(esColectivo ? { autor: null } : { colectivo: COLECTIVO }),
        },
      ],
    });
    montar(<ValoracionesRecibidas id="c1" esColectivo={esColectivo} />, null);
    expect(await screen.findByText("4,5 de 5")).toBeVisible();
    expect(screen.getByText("Muy buen trabajo")).toBeVisible();
    if (esColectivo)
      expect(screen.getByText("Persona colaboradora anónima")).toBeVisible();
    else
      expect(screen.getByRole("link", { name: COLECTIVO.nombre })).toHaveAttribute(
        "href",
        "/colectivos/c1",
      );
  },
);

test("sin valoraciones no se inventa un promedio", async () => {
  montar(<ValoracionesRecibidas id="c1" />, null);
  expect(await screen.findByText("Todavía no recibió valoraciones.")).toBeVisible();
  expect(screen.queryByText(/de 5/)).not.toBeInTheDocument();
});

test.each(["COLECTIVO", "COLABORADORA"])(
  "%s puede finalizar y valorar una vez sin comentario",
  async (rol) => {
    let colaboracion = {
      id: "col1",
      estado: "ACEPTADA",
      valoracionDelColectivo: null,
      valoracionDelColaborador: null,
    };
    const campo =
      rol === "COLECTIVO" ? "valoracionDelColectivo" : "valoracionDelColaborador";
    responder = (config) => {
      if (config.url.endsWith("/finalizacion")) {
        colaboracion = { ...colaboracion, estado: "FINALIZADA" };
        return colaboracion;
      }
      colaboracion = { ...colaboracion, [campo]: JSON.parse(config.data) };
      return colaboracion[campo];
    };
    function Fila() {
      const [actual, setActual] = useState(colaboracion);
      return (
        <AccionesDeColaboracion
          proyectoId="p1"
          colaboracion={actual}
          alActualizar={async () => {
            setActual({ ...colaboracion });
            return true;
          }}
        />
      );
    }
    const user = montar(<Fila />, { ...CUENTA, rol });
    await user.click(screen.getByRole("button", { name: "Finalizar colaboración" }));
    const dialogo = screen.getByRole("dialog");
    await user.click(
      within(dialogo).getByRole("button", { name: "Finalizar colaboración" }),
    );
    await user.click(await screen.findByRole("button", { name: "Valorar", exact: true }));
    expect(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Enviar valoración",
      }),
    ).toBeDisabled();
    await user.selectOptions(screen.getByLabelText(/^Puntaje/), "5");
    await user.click(screen.getByRole("button", { name: "Enviar valoración" }));
    expect(await screen.findByText("Tu valoración:")).toHaveTextContent("5 de 5");
    expect(
      screen.queryByRole("button", { name: "Valorar", exact: true }),
    ).not.toBeInTheDocument();
    expect(JSON.parse(pedidos.at(-1).data)).toEqual({
      autor: rol === "COLECTIVO" ? "COLECTIVO" : "COLABORADOR",
      puntaje: 5,
    });
  },
);

test("un 409 al valorar refresca y muestra la valoración que ya existía", async () => {
  responder = (config) => falla(config, 409);
  function Fila() {
    const [actual, setActual] = useState({ id: "col1", estado: "FINALIZADA" });
    return (
      <AccionesDeColaboracion
        proyectoId="p1"
        colaboracion={actual}
        alActualizar={async () => {
          setActual({ ...actual, valoracionDelColectivo: { puntaje: 4 } });
          return true;
        }}
      />
    );
  }
  const user = montar(<Fila />);
  await user.click(screen.getByRole("button", { name: "Valorar", exact: true }));
  await user.selectOptions(screen.getByLabelText(/^Puntaje/), "5");
  await user.click(screen.getByRole("button", { name: "Enviar valoración" }));
  expect(await screen.findByText("Tu valoración:")).toHaveTextContent("4 de 5");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test.each([200, 409])(
  "la baja exige el nombre y quita el perfil aunque falle cerrar sesión (HTTP %s)",
  async (status) => {
    const sesion = crearSesionFalsa({ autenticado: true });
    sesion.cerrar = vi
      .fn()
      .mockRejectedValueOnce(new Error("Sin conexión"))
      .mockImplementation(async () => {
        sesion.autenticado = false;
      });
    let dadaDeBaja = false;
    responder = (config) => {
      dadaDeBaja = true;
      return status === 409 ? falla(config, 409) : COLECTIVO;
    };
    const { user, router } = montarRutas(
      <>
        <Route element={<RutaProtegida roles={["COLECTIVO"]} />}>
          <Route
            path="/colectivo/perfil"
            element={<BajaDelColectivo colectivo={COLECTIVO} />}
          />
        </Route>
        <Route element={<RutaProtegida permitirSinPerfil />}>
          <Route path="/bienvenida" element={<BienvenidaPage />} />
        </Route>
        <Route path="/" element={<h1>Inicio público</h1>} />
      </>,
      {
        ruta: "/colectivo/perfil",
        cuenta: CUENTA,
        sesion,
        dependencies: {
          obtenerCuentaActual: async () =>
            dadaDeBaja ? { ...CUENTA, rol: null, perfilId: null } : CUENTA,
        },
      },
    );
    await user.click(
      await screen.findByRole("button", { name: "Dar de baja el colectivo" }),
    );
    const dialogo = screen.getByRole("dialog");
    const confirmar = within(dialogo).getByRole("button", {
      name: "Dar de baja el colectivo",
    });
    expect(confirmar).toBeDisabled();
    await user.type(screen.getByLabelText("Nombre del colectivo"), "Otro nombre");
    expect(confirmar).toBeDisabled();
    await user.clear(screen.getByLabelText("Nombre del colectivo"));
    await user.type(screen.getByLabelText("Nombre del colectivo"), COLECTIVO.nombre);
    await user.click(confirmar);
    expect(
      await screen.findByRole("heading", { name: "El colectivo ya está dado de baja" }),
    ).toBeVisible();
    expect(router.state.location.pathname).toBe("/bienvenida");
    await user.click(screen.getByRole("button", { name: "Reintentar cierre de sesión" }));
    expect(await screen.findByRole("heading", { name: "Inicio público" })).toBeVisible();
    expect(pedidos.filter((p) => p.url.endsWith("/baja"))).toHaveLength(1);
  },
);

test("la baja no se duplica y el diálogo no se cierra mientras está enviando", async () => {
  let terminar;
  responder = () =>
    new Promise((resolve) => {
      terminar = resolve;
    });
  const user = montar(<BajaDelColectivo colectivo={COLECTIVO} />);
  await user.click(screen.getByRole("button", { name: "Dar de baja el colectivo" }));
  await user.type(screen.getByLabelText("Nombre del colectivo"), COLECTIVO.nombre);
  const dialogo = screen.getByRole("dialog");
  await user.dblClick(
    within(dialogo).getByRole("button", { name: "Dar de baja el colectivo" }),
  );
  expect(within(dialogo).getByRole("button", { name: "Cancelar" })).toBeDisabled();
  expect(within(dialogo).getByRole("button", { name: "Dando de baja…" })).toBeDisabled();
  dialogo.dispatchEvent(new Event("cancel", { cancelable: true }));
  expect(dialogo).toHaveAttribute("open");
  expect(pedidos).toHaveLength(1);
  await act(async () => terminar(COLECTIVO));
});

test("una valoración guardada no se reenvía si falla la recarga", async () => {
  responder = () => ({ puntaje: 5, fecha: FECHA });
  const actualizar = vi.fn().mockResolvedValue(false);
  const user = montar(
    <AccionesDeColaboracion
      proyectoId="p1"
      colaboracion={{ id: "col1", estado: "FINALIZADA" }}
      alActualizar={actualizar}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Valorar", exact: true }));
  expect(screen.getByLabelText("Comentario")).toHaveAttribute("maxlength", "280");
  await user.selectOptions(screen.getByLabelText(/^Puntaje/), "5");
  await user.click(screen.getByRole("button", { name: "Enviar valoración" }));
  expect(
    await screen.findByRole("button", { name: "Valorar", exact: true }),
  ).toBeDisabled();
  await user.click(screen.getByRole("button", { name: "Actualizar colaboración" }));
  expect(pedidos).toHaveLength(1);
  expect(actualizar).toHaveBeenCalledTimes(2);
});
