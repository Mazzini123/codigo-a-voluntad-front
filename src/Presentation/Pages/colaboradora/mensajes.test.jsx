import { screen, waitFor, within } from "@testing-library/react";
import axios from "axios";
import { Route } from "react-router-dom";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { montarRutas } from "@/test/montarRutas.jsx";
import { RutaProtegida } from "@/Presentation/Routes/RutaProtegida.jsx";
import { MensajesPage } from "./MensajesPage.jsx";

const cuenta = { id: "1", rol: "COLABORADORA", perfilId: "co1" };
const adaptador = axiosClient.defaults.adapter;
let mensajes;
let transporte;
let falloDeLista;
let falloDeLectura;

function mensaje(id, campos = {}) {
  return {
    id,
    tipo: "INVITACION",
    asunto: `Asunto ${id}`,
    contenido: `Contenido ${id}\nSegunda línea`,
    fecha: "2026-06-10T12:00:00.000Z",
    esLeida: false,
    referencias: {},
    ...campos,
  };
}

function pagina(numero, porPagina) {
  const inicio = (numero - 1) * porPagina;
  return {
    data: mensajes.slice(inicio, inicio + porPagina),
    meta: {
      page: numero,
      per_page: porPagina,
      total: mensajes.length,
      total_pages: Math.ceil(mensajes.length / porPagina),
    },
  };
}

beforeEach(() => {
  mensajes = [
    mensaje("n1", { referencias: { proyectoId: "p1" } }),
    mensaje("n2", { esLeida: true, fecha: "2026-05-10T12:00:00.000Z" }),
  ];
  falloDeLista = false;
  falloDeLectura = false;
  transporte = vi.fn(async (config) => {
    const { url, method, params } = config;
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
    if (url === "/colaboradores/co1/notificaciones" && method === "get")
      return falloDeLista ? fallar(500) : responder(pagina(params.page, params.limit));
    const lectura = url.match(/^\/colaboradores\/co1\/notificaciones\/(\w+)\/lectura$/);
    if (lectura && method === "post") {
      if (falloDeLectura) return fallar(500);
      const leida = mensajes.find(({ id }) => id === lectura[1]);
      leida.esLeida = true;
      return responder(leida);
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
        <Route path="/mensajes" element={<MensajesPage />} />
      </Route>
      <Route path="/proyectos/:id" element={<h1>Detalle</h1>} />
      <Route path="/login" element={<h1>Ingresar</h1>} />
      <Route path="/sin-permiso" element={<h1>Sin permiso</h1>} />
    </>,
    { ruta: `/mensajes${query}`, cuenta: usuario },
  );
}

const filaDe = (titulo) => screen.getByText(titulo).closest("li");

const lecturas = () =>
  transporte.mock.calls.filter(([config]) => config.method === "post");

test("lista los mensajes con título, fecha, extracto y la marca Sin leer solo en los no leídos", async () => {
  montar();
  expect(
    await screen.findByRole("heading", { level: 1, name: "Mensajes" }),
  ).toBeVisible();
  await screen.findByText("Asunto n1");
  const sinLeer = filaDe("Asunto n1");
  const leido = filaDe("Asunto n2");
  expect(within(sinLeer).getByText("Contenido n1")).toBeVisible();
  expect(within(sinLeer).getByText("Sin leer")).toBeVisible();
  expect(within(sinLeer).getByText(/2026/)).toBeVisible();
  expect(within(leido).queryByText("Sin leer")).not.toBeInTheDocument();
  expect(screen.getAllByText("Sin leer")).toHaveLength(1);
});

test("abrir un mensaje sin leer lo marca como leído y lo anuncia", async () => {
  const { user } = montar();
  const resumen = await screen.findByText("Asunto n1");
  expect(lecturas()).toHaveLength(0);
  await user.click(resumen);
  expect(await screen.findByText("Mensaje marcado como leído.")).toBeVisible();
  expect(lecturas()).toHaveLength(1);
  expect(lecturas()[0][0].url).toBe("/colaboradores/co1/notificaciones/n1/lectura");
  expect(screen.queryByText("Sin leer")).not.toBeInTheDocument();
  expect(within(filaDe("Asunto n1")).getByText(/Segunda línea/)).toBeVisible();
});

test("abrir un mensaje ya leído no pide nada al back", async () => {
  const { user } = montar();
  await user.click(await screen.findByText("Asunto n2"));
  await waitFor(() =>
    expect(within(filaDe("Asunto n2")).getByText(/Segunda línea/)).toBeVisible(),
  );
  expect(lecturas()).toHaveLength(0);
});

test("un mensaje que referencia un proyecto tiene enlace al proyecto", async () => {
  const { user, router } = montar();
  await user.click(await screen.findByText("Asunto n1"));
  await user.click(await screen.findByRole("link", { name: "Ver el proyecto" }));
  expect(router.state.location.pathname).toBe("/proyectos/p1");
  expect(router.state.location.state.textoVolver).toBe("Volver a mis mensajes");
});

test("si falla al marcar como leído se puede leer igual y se avisa sin el error crudo", async () => {
  falloDeLectura = true;
  const { user } = montar();
  await user.click(await screen.findByText("Asunto n1"));
  expect(await screen.findByText("No pudimos marcarlo como leído.")).toBeVisible();
  expect(screen.getByText("Sin leer")).toBeVisible();
  expect(within(filaDe("Asunto n1")).getByText(/Segunda línea/)).toBeVisible();
});

test("sin mensajes muestra No tenés mensajes", async () => {
  mensajes = [];
  montar();
  expect(await screen.findByText("No tenés mensajes")).toBeVisible();
});

test("el error de la lista ofrece Reintentar", async () => {
  falloDeLista = true;
  const { user } = montar();
  expect(await screen.findByText("No pudimos cargar tus mensajes")).toBeVisible();
  falloDeLista = false;
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(await screen.findByText("Asunto n1")).toBeVisible();
});

test("la página va en la URL y se pide al back de a 10", async () => {
  mensajes = Array.from({ length: 12 }, (_, i) => mensaje(`m${i + 1}`));
  const { user, router } = montar();
  await screen.findByText("Asunto m1");
  expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(10);
  await user.click(screen.getByRole("button", { name: "Siguiente" }));
  expect(router.state.location.search).toBe("?pagina=2");
  expect(await screen.findByText("Asunto m11")).toBeVisible();
  expect(screen.queryByText("Asunto m1")).not.toBeInTheDocument();
});

test("con ?pagina= en la URL ya carga esa página", async () => {
  mensajes = Array.from({ length: 12 }, (_, i) => mensaje(`m${i + 1}`));
  montar("?pagina=2");
  expect(await screen.findByText("Asunto m11")).toBeVisible();
});

test("una persona sin sesión va a ingresar y un colectivo ve sin permiso", async () => {
  const sinSesion = montar("", null);
  expect(await screen.findByRole("heading", { name: "Ingresar" })).toBeVisible();
  sinSesion.unmount();
  montar("", { id: "2", rol: "COLECTIVO", perfilId: "cl1" });
  expect(await screen.findByRole("heading", { name: "Sin permiso" })).toBeVisible();
});
