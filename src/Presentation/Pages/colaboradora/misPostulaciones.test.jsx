import { screen, waitFor, within } from "@testing-library/react";
import axios from "axios";
import { Route } from "react-router-dom";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { montarRutas } from "@/test/montarRutas.jsx";
import { RutaProtegida } from "@/Presentation/Routes/RutaProtegida.jsx";
import { MisPostulacionesPage } from "./MisPostulacionesPage.jsx";

const cuenta = { id: "1", rol: "COLABORADORA", perfilId: "co1" };
const adaptador = axiosClient.defaults.adapter;
let colaboraciones;
let proyectos;
let transporte;
let falloDeLista;
let falloDeBaja;
let falloDeRetiro;

function registro(proyectoId, id, estado, campos = {}) {
  return {
    proyectoId,
    colaboracion: {
      id,
      perfil: "pe1",
      estado,
      esPublica: true,
      fecha: "2026-05-10T12:00:00.000Z",
      ...campos,
    },
  };
}

beforeEach(() => {
  colaboraciones = [
    registro("p1", "c1", "ACEPTADA", { fecha: "2026-05-10T12:00:00.000Z" }),
    registro("p2", "c2", "PENDIENTE", { fecha: "2026-06-10T12:00:00.000Z" }),
    registro("p3", "c3", "FINALIZADA", {
      fecha: "2026-01-10T12:00:00.000Z",
      fechaFin: "2026-04-10T12:00:00.000Z",
    }),
  ];
  proyectos = {
    p1: {
      id: "p1",
      titulo: "Turnos del barrio",
      perfiles: [
        { id: "pe0", descripcion: "Otro" },
        { id: "pe1", descripcion: "Interfaz web" },
      ],
    },
    p2: {
      id: "p2",
      titulo: "Huerta compartida",
      perfiles: [{ id: "pe1", descripcion: "Mapas" }],
    },
    p3: {
      id: "p3",
      titulo: "Radio vecinal",
      perfiles: [{ id: "pe1", descripcion: "Audio" }],
    },
  };
  falloDeLista = false;
  falloDeBaja = null;
  falloDeRetiro = null;
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
    if (url === "/colaboradores/co1/colaboraciones")
      return falloDeLista ? fallar(500) : responder(colaboraciones);
    const proyecto = url.match(/^\/proyectos\/(\w+)$/);
    if (proyecto && method === "get") {
      if (!proyectos[proyecto[1]]) return fallar(500);
      return responder(proyectos[proyecto[1]]);
    }
    const baja = url.match(/^\/proyectos\/(\w+)\/colaboraciones\/(\w+)\/desvinculacion$/);
    if (baja && method === "post") {
      if (falloDeBaja) {
        if (falloDeBaja === 409)
          colaboraciones.find((r) => r.colaboracion.id === baja[2]).colaboracion.estado =
            "DESVINCULADA";
        return fallar(falloDeBaja);
      }
      colaboraciones.find((r) => r.colaboracion.id === baja[2]).colaboracion.estado =
        "DESVINCULADA";
      return responder({});
    }
    const retiro = url.match(/^\/proyectos\/(\w+)\/colaboraciones\/(\w+)\/retiro$/);
    if (retiro && method === "post") {
      const fila = colaboraciones.find((r) => r.colaboracion.id === retiro[2]);
      if (falloDeRetiro) {
        if (falloDeRetiro === 409) fila.colaboracion.estado = "ACEPTADA";
        return fallar(falloDeRetiro);
      }
      fila.colaboracion.estado = "RETIRADA";
      return responder({});
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
      <Route element={<RutaProtegida roles={["COLABORADORA"]} />}>
        <Route path="/colaboradora/postulaciones" element={<MisPostulacionesPage />} />
      </Route>
      <Route path="/proyectos" element={<h1>Proyectos</h1>} />
      <Route path="/proyectos/:id" element={<h1>Detalle</h1>} />
      <Route path="/login" element={<h1>Ingresar</h1>} />
      <Route path="/sin-permiso" element={<h1>Sin permiso</h1>} />
    </>,
    { ruta: `/colaboradora/postulaciones${query}`, cuenta: usuario },
  );
}

const bajas = () => transporte.mock.calls.filter(([config]) => config.method === "post");

test("lista las postulaciones de la más reciente a la más antigua con estado, perfil y contribución", async () => {
  montar();
  await screen.findByRole("heading", { level: 1, name: "Mis postulaciones" });
  const titulos = (await screen.findAllByRole("heading", { level: 2 })).map(
    (titulo) => titulo.textContent,
  );
  expect(titulos).toEqual(["Huerta compartida", "Turnos del barrio", "Radio vecinal"]);
  const filas = screen.getAllByRole("listitem");
  expect(within(filas[1]).getByText("Aceptada")).toBeVisible();
  expect(within(filas[1]).getByText("Perfil 2")).toBeVisible();
  expect(within(filas[1]).getByText("Interfaz web")).toBeVisible();
  expect(within(filas[1]).getByText("Contribución pública")).toBeVisible();
  expect(within(filas[1]).getByText(/Te postulaste el/)).toBeVisible();
  expect(within(filas[2]).getByText(/Terminó el/)).toBeVisible();
  expect(
    screen.queryByText("Las postulaciones anónimas todavía no aparecen en esta lista."),
  ).not.toBeInTheDocument();
});

test("las anónimas dicen Contribución anónima", async () => {
  colaboraciones = [registro("p1", "c1", "PENDIENTE", { esPublica: false })];
  montar();
  expect(await screen.findByText("Contribución anónima")).toBeVisible();
});

test("el filtro va a la URL y se aplica al cargar con ?estado=", async () => {
  const { user, router } = montar();
  await screen.findByText("Huerta compartida");
  await user.selectOptions(screen.getByLabelText("Estado de la postulación"), "ACEPTADA");
  expect(router.state.location.search).toBe("?estado=ACEPTADA");
  expect(screen.getAllByRole("listitem")).toHaveLength(1);
  expect(screen.queryByText("Huerta compartida")).not.toBeInTheDocument();
});

test("con ?estado= en la URL la lista ya llega filtrada y un valor desconocido muestra todas", async () => {
  const primera = montar("?estado=PENDIENTE");
  await screen.findByText("Huerta compartida");
  expect(screen.getAllByRole("listitem")).toHaveLength(1);
  primera.unmount();
  montar("?estado=INVENTADO");
  await screen.findByText("Huerta compartida");
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
});

test("un filtro sin coincidencias ofrece Ver todas", async () => {
  const { user, router } = montar("?estado=RECHAZADA");
  expect(
    await screen.findByText("No tenés postulaciones con este estado."),
  ).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Ver todas" }));
  expect(router.state.location.search).toBe("");
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
});

test("sin postulaciones muestra el vacío con el enlace a buscar proyectos", async () => {
  colaboraciones = [];
  const { user, router } = montar();
  expect(
    await screen.findByText("Todavía no te postulaste a ningún proyecto"),
  ).toBeVisible();
  await user.click(screen.getByRole("link", { name: "Buscar proyectos" }));
  expect(router.state.location.pathname).toBe("/proyectos");
});

test("un proyecto que no carga deja la fila con su estado y el enlace", async () => {
  delete proyectos.p2;
  montar();
  expect(
    await screen.findByText("No pudimos cargar los datos de este proyecto."),
  ).toBeVisible();
  const fila = screen.getAllByRole("listitem")[0];
  expect(within(fila).getByText("Pendiente")).toBeVisible();
  expect(within(fila).getByRole("link", { name: "Ver el proyecto" })).toHaveAttribute(
    "href",
    "/proyectos/p2",
  );
});

test("el error de la lista ofrece Reintentar", async () => {
  falloDeLista = true;
  const { user } = montar();
  expect(await screen.findByText("No pudimos cargar tus postulaciones")).toBeVisible();
  falloDeLista = false;
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(await screen.findByText("Huerta compartida")).toBeVisible();
});

test("solo las aceptadas tienen Darme de baja", async () => {
  montar();
  await screen.findByText("Huerta compartida");
  expect(screen.getAllByRole("button", { name: "Darme de baja" })).toHaveLength(1);
});

test("darse de baja pide confirmación, desvincula y avisa", async () => {
  const { user } = montar();
  await user.click(await screen.findByRole("button", { name: "Darme de baja" }));
  const dialogo = screen.getByRole("dialog", {
    name: "¿Darte de baja de este proyecto?",
  });
  expect(
    within(dialogo).getByText(/Dejás de participar en «Turnos del barrio»/),
  ).toBeVisible();
  expect(within(dialogo).getByText(/en el perfil «Interfaz web»/)).toBeVisible();
  expect(within(dialogo).getByText(/Va a figurar como desvinculada/)).toBeVisible();
  expect(within(dialogo).getByText("Esta acción no se puede deshacer.")).toBeVisible();
  expect(bajas()).toHaveLength(0);
  await user.click(within(dialogo).getByRole("button", { name: "Darme de baja" }));
  expect(
    await screen.findByText("Te diste de baja del proyecto «Turnos del barrio»."),
  ).toBeVisible();
  expect(bajas()).toHaveLength(1);
  expect(bajas()[0][0].url).toBe("/proyectos/p1/colaboraciones/c1/desvinculacion");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Darme de baja" })).not.toBeInTheDocument();
  expect(screen.getByText("Desvinculada")).toBeVisible();
  expect(screen.getByRole("heading", { level: 1 })).toHaveFocus();
});

test("con contribución anónima el diálogo aclara que no figura en el perfil público", async () => {
  colaboraciones = [registro("p1", "c1", "ACEPTADA", { esPublica: false })];
  const { user } = montar();
  await user.click(await screen.findByRole("button", { name: "Darme de baja" }));
  expect(screen.getByText(/no figura en tu perfil público/)).toBeVisible();
});

test.each([
  [
    "el botón Cancelar",
    async (user, dialogo) =>
      user.click(within(dialogo).getByRole("button", { name: "Cancelar" })),
  ],
  ["Esc", async (user) => user.keyboard("{Escape}")],
])("cancelar con %s no cambia nada y devuelve el foco al botón", async (_n, cancelar) => {
  const { user } = montar();
  const boton = await screen.findByRole("button", { name: "Darme de baja" });
  await user.click(boton);
  await cancelar(user, screen.getByRole("dialog"));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(bajas()).toHaveLength(0);
  expect(boton).toHaveFocus();
});

test("una baja con 409 avisa que ya no estaba activa y deja la lista al día", async () => {
  falloDeBaja = 409;
  const { user } = montar();
  await user.click(await screen.findByRole("button", { name: "Darme de baja" }));
  await user.click(
    within(screen.getByRole("dialog")).getByRole("button", { name: "Darme de baja" }),
  );
  expect(await screen.findByText("Esta colaboración ya no está activa.")).toBeVisible();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByText("Desvinculada")).toBeVisible();
});

test("una persona sin sesión va a ingresar y un colectivo ve sin permiso", async () => {
  const sinSesion = montar("", null);
  expect(await screen.findByRole("heading", { name: "Ingresar" })).toBeVisible();
  sinSesion.unmount();
  montar("", { id: "2", rol: "COLECTIVO", perfilId: "cl1" });
  expect(await screen.findByRole("heading", { name: "Sin permiso" })).toBeVisible();
});

test("solo las pendientes tienen Retirar postulación", async () => {
  montar();
  await screen.findByText("Huerta compartida");
  expect(screen.getAllByRole("button", { name: "Retirar postulación" })).toHaveLength(1);
});

test("retirar una postulación pide confirmación, la retira y avisa", async () => {
  const { user } = montar();
  await user.click(await screen.findByRole("button", { name: "Retirar postulación" }));
  const dialogo = screen.getByRole("dialog", { name: "¿Retirar tu postulación?" });
  expect(
    within(dialogo).getByText(/Retirás tu postulación a «Huerta compartida»/),
  ).toBeVisible();
  expect(
    within(dialogo).queryByText("Esta acción no se puede deshacer."),
  ).not.toBeInTheDocument();
  expect(bajas()).toHaveLength(0);
  await user.click(within(dialogo).getByRole("button", { name: "Retirar" }));
  expect(
    await screen.findByText("Retiraste tu postulación a «Huerta compartida»."),
  ).toBeVisible();
  expect(bajas()[0][0].url).toBe("/proyectos/p2/colaboraciones/c2/retiro");
  expect(screen.getByText("Retirada")).toBeVisible();
  expect(
    screen.queryByRole("button", { name: "Retirar postulación" }),
  ).not.toBeInTheDocument();
});

test("si la postulación ya no está pendiente, avisa sin mostrar el error crudo", async () => {
  falloDeRetiro = 409;
  const { user } = montar();
  await user.click(await screen.findByRole("button", { name: "Retirar postulación" }));
  await user.click(
    within(screen.getByRole("dialog")).getByRole("button", { name: "Retirar" }),
  );
  expect(await screen.findByText("Esta postulación ya no está pendiente.")).toBeVisible();
});

test("usa el proyecto y el perfil que trae la lista, sin pedir cada proyecto", async () => {
  colaboraciones = [
    {
      ...registro("p1", "c1", "ACEPTADA"),
      proyecto: { id: "p1", titulo: "Turnos del barrio", estado: "ABIERTO" },
      perfil: { id: "pe1", titulo: "Diseño web", descripcion: "Interfaz web" },
    },
  ];
  montar();
  expect(await screen.findByRole("heading", { level: 2 })).toHaveTextContent(
    "Turnos del barrio",
  );
  expect(screen.getByText("Diseño web")).toBeVisible();
  expect(
    transporte.mock.calls.filter(([config]) => config.url === "/proyectos/p1"),
  ).toHaveLength(0);
});
