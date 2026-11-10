import { screen, within } from "@testing-library/react";
import axios from "axios";
import { Route } from "react-router-dom";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { RutaProtegida } from "@/Presentation/Routes/RutaProtegida.jsx";
import { BienvenidaPage } from "@/Presentation/Pages/ingreso/BienvenidaPage.jsx";
import { AltaColaboradoraPage } from "@/Presentation/Pages/ingreso/AltaColaboradoraPage.jsx";
import { PerfilColaboradoraPage } from "./PerfilColaboradoraPage.jsx";
import { montarRutas } from "@/test/montarRutas.jsx";

const HABILIDADES = [{ codigo: "react", titulo: "React", activo: true }];
const COLABORADORA = {
  id: "co1",
  nombreFantasia: "Pixel",
  cuentaGit: "pixel-dev",
  presentacion: "Hola.",
  pronombres: [],
  redesSociales: [],
  habilidades: [{ codigo: "react", titulo: "React" }],
};
const adaptador = axiosClient.defaults.adapter;
let cuenta;
let transporte;
let respuestaDeBaja;

function responder(config, data, status = 200) {
  return { config, data: structuredClone(data), status, statusText: "", headers: {} };
}

function fallar(config, status, data) {
  throw new axios.AxiosError("Error", "ERR_BAD_RESPONSE", config, null, {
    status,
    data,
  });
}

beforeEach(() => {
  cuenta = {
    id: "1",
    rol: "COLABORADORA",
    perfilId: "co1",
    usuarioId: "u1",
    contextoActual: { id: "k1", tipo: "COLABORADOR", permisos: ["COLABORADOR_BAJA"] },
    contextos: [],
  };
  respuestaDeBaja = null;
  transporte = vi.fn(async (config) => {
    const { method, url } = config;
    if (method === "get" && url === "/habilidades") {
      return responder(config, {
        data: HABILIDADES,
        meta: { page: 1, per_page: 100, total: 1, total_pages: 1 },
      });
    }
    if (method === "get" && url === "/colaboradores/co1")
      return responder(config, COLABORADORA);
    if (method === "get" && url === "/colaboradores/co1/medios-de-contacto")
      return responder(config, []);
    if (method === "post" && url === "/colaboradores/co1/baja") {
      if (respuestaDeBaja) return fallar(config, 409, respuestaDeBaja);
      cuenta = { ...cuenta, rol: null, perfilId: null, contextoActual: null };
      return responder(config, { ...COLABORADORA, fechaBaja: "2026-11-10" });
    }
    if (method === "post" && url === "/colaboradores") {
      const { nombreFantasia } = JSON.parse(config.data);
      const nuevo = { ...COLABORADORA, id: "co2", nombreFantasia };
      const contexto = {
        id: "k2",
        tipo: "COLABORADOR",
        rol: "COLABORADOR",
        colaborador: { id: nuevo.id, nombre: nuevo.nombreFantasia },
        permisos: ["COLABORADOR_BAJA"],
      };
      cuenta = {
        ...cuenta,
        rol: "COLABORADORA",
        perfilId: nuevo.id,
        contextoActual: contexto,
        contextos: [contexto],
      };
      return responder(config, nuevo, 201);
    }
    throw new Error(`Pedido inesperado: ${method} ${url}`);
  });
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptador;
});

function montar(ruta) {
  return montarRutas(
    <>
      <Route element={<RutaProtegida permitirSinPerfil />}>
        <Route path="/bienvenida" element={<BienvenidaPage />} />
        <Route path="/bienvenida/colaboradora" element={<AltaColaboradoraPage />} />
      </Route>
      <Route element={<RutaProtegida roles={["COLABORADORA"]} />}>
        <Route path="/colaboradora/perfil" element={<PerfilColaboradoraPage />} />
      </Route>
      <Route path="/proyectos" element={<h1>Proyectos</h1>} />
    </>,
    { ruta, cuenta, dependencies: { obtenerCuentaActual: async () => cuenta } },
  );
}

async function pedirBaja(user) {
  await user.click(await screen.findByRole("button", { name: "Dar de baja mi perfil" }));
  const dialogo = screen.getByRole("dialog", {
    name: "¿Dar de baja tu perfil de colaboradora?",
  });
  await user.click(
    within(dialogo).getByRole("button", { name: "Dar de baja mi perfil" }),
  );
  return dialogo;
}

test("con actividad en curso explica qué resolver y no da de baja", async () => {
  respuestaDeBaja = {
    codigo: "ACTIVIDAD_EN_CURSO",
    detalle: [
      { proyectoId: "p1", proyecto: "Huerta", colaboracionId: "x1", estado: "PENDIENTE" },
      { proyectoId: "p2", proyecto: "Radio", colaboracionId: "x2", estado: "ACEPTADA" },
    ],
  };
  const { user } = montar("/colaboradora/perfil");
  const dialogo = await pedirBaja(user);
  const aviso = await within(dialogo).findByRole("alert");
  expect(aviso).toHaveTextContent("Huerta: pendiente");
  expect(aviso).toHaveTextContent("Radio: aceptada");
  expect(
    within(dialogo).getByRole("button", { name: "Dar de baja mi perfil" }),
  ).toBeDisabled();
});

test("sin actividad en curso da de baja y vuelve a la bienvenida", async () => {
  const { user } = montar("/colaboradora/perfil");
  await pedirBaja(user);
  expect(
    await screen.findByRole("heading", { name: "¿Cómo vas a usar Código a Voluntad?" }),
  ).toBeVisible();
  expect(screen.getByText("Diste de baja tu perfil de colaboradora.")).toBeVisible();
});

test("sin el permiso de baja no muestra la acción", async () => {
  cuenta.contextoActual.permisos = [];
  montar("/colaboradora/perfil");
  expect(await screen.findByRole("heading", { name: "Habilidades" })).toBeVisible();
  expect(
    screen.queryByRole("button", { name: "Dar de baja mi perfil" }),
  ).not.toBeInTheDocument();
});

test("después de la baja puede dar de alta un perfil distinto con la misma cuenta", async () => {
  const { user } = montar("/colaboradora/perfil");
  const dialogo = await pedirBaja(user);
  expect(dialogo).toHaveTextContent(
    /se creará un perfil nuevo y se conservará el historial del anterior/i,
  );
  expect(dialogo).not.toHaveTextContent(/reactivar/i);
  await user.click(await screen.findByRole("link", { name: /Soy colaboradora/ }));
  await user.click(
    await screen.findByRole("radio", { name: "Con un nombre de fantasía" }),
  );
  await user.type(screen.getByLabelText(/^Nombre de fantasía/), "Nuevo Pixel");
  await user.type(screen.getByRole("searchbox", { name: "Buscar habilidad" }), "rea");
  await user.click(screen.getByRole("checkbox", { name: "React" }));
  expect(screen.queryByRole("button", { name: /reactivar/i })).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Crear perfil" }));

  expect(await screen.findByRole("heading", { name: "Proyectos" })).toBeVisible();
  expect(
    transporte.mock.calls
      .map(([{ method, url }]) => [method, url])
      .filter(([method]) => method === "post"),
  ).toEqual([
    ["post", "/colaboradores/co1/baja"],
    ["post", "/colaboradores"],
  ]);
  expect(cuenta).toMatchObject({
    usuarioId: "u1",
    perfilId: "co2",
    contextoActual: { id: "k2" },
  });
});
