import { screen, within } from "@testing-library/react";
import axios from "axios";
import { Route } from "react-router-dom";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { montarRutas } from "@/test/montarRutas.jsx";
import { RutaProtegida } from "@/Presentation/Routes/RutaProtegida.jsx";
import { ColectivoPage } from "@/Presentation/Pages/publicas/ColectivoPage.jsx";
import MisSolicitudesPage from "./MisSolicitudesPage.jsx";

const adaptador = axiosClient.defaults.adapter;
let transporte;
let solicitudes;
let falloAlSolicitar;

const persona = {
  id: "1",
  rol: null,
  perfilId: null,
  usuarioId: "u1",
  nombre: "Ana",
  contextos: [],
  contextoActual: null,
};

beforeEach(() => {
  falloAlSolicitar = null;
  solicitudes = [
    { id: "s1", colectivoId: "c1", estado: "RECHAZADA", fechaSolicitud: "2026-11-01" },
    { id: "s2", colectivoId: "c2", estado: "PENDIENTE", fechaSolicitud: "2026-11-02" },
  ];
  transporte = vi.fn(async (config) => {
    const { url, method } = config;
    const responder = (data, status = 200) => ({
      config,
      status,
      statusText: "OK",
      headers: {},
      data: structuredClone(data),
    });
    if (method === "get" && url === "/colectivos/c1")
      return responder({ id: "c1", nombre: "Huerta Sur", proyectos: [] });
    if (method === "get" && url === "/colectivos/c2")
      return responder({ id: "c2", nombre: "Radio Barrial", proyectos: [] });
    if (method === "post" && url === "/colectivos/c1/solicitudes-ingreso") {
      if (falloAlSolicitar) {
        throw new axios.AxiosError("error", "ERR_BAD_RESPONSE", config, null, {
          status: 409,
          data: { codigo: falloAlSolicitar },
        });
      }
      return responder({ id: "s9", estado: "PENDIENTE" }, 201);
    }
    if (method === "get" && url === "/auth/solicitudes-ingreso")
      return responder(solicitudes);
    if (
      method === "post" &&
      url === "/colectivos/c2/solicitudes-ingreso/s2/cancelacion"
    ) {
      solicitudes[1].estado = "CANCELADA";
      return responder(solicitudes[1]);
    }
    throw new Error(`Pedido inesperado: ${method} ${url}`);
  });
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptador;
});

function montar(ruta, cuenta = persona) {
  return montarRutas(
    <>
      <Route path="/colectivos/:id" element={<ColectivoPage />} />
      <Route element={<RutaProtegida permitirSinPerfil />}>
        <Route path="/cuenta/solicitudes" element={<MisSolicitudesPage />} />
      </Route>
    </>,
    { ruta, cuenta },
  );
}

test("desde el perfil del colectivo se pide el ingreso", async () => {
  const { user } = montar("/colectivos/c1");
  await user.click(await screen.findByRole("button", { name: "Pedir sumarme" }));
  expect(await screen.findByText(/Enviamos tu solicitud/)).toBeVisible();
  expect(screen.getByRole("link", { name: "Mis solicitudes" })).toHaveAttribute(
    "href",
    "/cuenta/solicitudes",
  );
});

test("una solicitud repetida se explica en lenguaje claro", async () => {
  falloAlSolicitar = "SOLICITUD_PENDIENTE";
  const { user } = montar("/colectivos/c1");
  await user.click(await screen.findByRole("button", { name: "Pedir sumarme" }));
  expect(
    await screen.findByText("Ya tenés una solicitud pendiente para este colectivo."),
  ).toBeVisible();
});

test.each([
  ["sin sesión", null],
  ["como colaboradora", { ...persona, contextos: [{ id: "x", tipo: "COLABORADOR" }] }],
  [
    "si ya es parte",
    { ...persona, contextos: [{ id: "x", tipo: "COLECTIVO", colectivo: { id: "c1" } }] },
  ],
])("no ofrece pedir el ingreso %s", async (_caso, cuenta) => {
  montar("/colectivos/c1", cuenta);
  expect(
    await screen.findByRole("heading", { name: "Huerta Sur", level: 1 }),
  ).toBeVisible();
  expect(screen.queryByRole("button", { name: "Pedir sumarme" })).not.toBeInTheDocument();
});

test("mis solicitudes muestra primero las pendientes y permite cancelarlas", async () => {
  const { user } = montar("/cuenta/solicitudes");
  const lista = await screen.findByRole("list", { name: "Tus solicitudes de ingreso" });
  const filas = within(lista).getAllByRole("listitem");
  expect(filas[0]).toHaveTextContent("Radio Barrial");
  expect(filas[0]).toHaveTextContent("Pendiente");
  expect(filas[1]).toHaveTextContent("Huerta Sur");
  await user.click(
    screen.getByRole("button", { name: "Cancelar la solicitud a Radio Barrial" }),
  );
  const dialogo = screen.getByRole("dialog", { name: "¿Cancelar la solicitud?" });
  await user.click(
    within(dialogo).getByRole("button", { name: "Cancelar la solicitud" }),
  );
  expect(await screen.findByText("Cancelaste la solicitud.")).toBeVisible();
  expect(
    screen.queryByRole("button", { name: /Cancelar la solicitud a/ }),
  ).not.toBeInTheDocument();
});

test("sin solicitudes invita a explorar", async () => {
  solicitudes = [];
  montar("/cuenta/solicitudes");
  expect(
    await screen.findByText("Todavía no pediste sumarte a ningún colectivo"),
  ).toBeVisible();
  expect(screen.getByRole("link", { name: "Explorar proyectos" })).toBeVisible();
});
