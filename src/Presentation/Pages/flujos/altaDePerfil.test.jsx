import { screen } from "@testing-library/react";
import { Route } from "react-router-dom";
import {
  crearAuthHttpClientSimulado,
  recordarSesion,
} from "@/Infrastructure/Auth/sesionSimulada.js";
import { crearSesionSimulada } from "@/Infrastructure/Auth/simulada/crearSesionSimulada.js";
import { crearSesionFalsa } from "@/Infrastructure/Auth/crearSesionFalsa.js";
import { observarAltasSimuladas } from "@/Infrastructure/Auth/simulada/observarAltasSimuladas.js";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { montarRutas } from "@/test/montarRutas.jsx";
import { MarcoDeLaApp } from "@/Presentation/Components/App/layout/MarcoDeLaApp.jsx";
import { RutaProtegida } from "@/Presentation/Routes/RutaProtegida.jsx";
import { AltaColaboradoraPage } from "@/Presentation/Pages/ingreso/AltaColaboradoraPage.jsx";
import { AltaColectivoPage } from "@/Presentation/Pages/ingreso/AltaColectivoPage.jsx";

const adaptadorOriginal = axiosClient.defaults.adapter;
const TEXTO_PENDIENTE = "Tu perfil se creó. Falta actualizar tu cuenta.";
let dejarDeObservar;

const COLECTIVO = {
  rol: "COLECTIVO",
  perfilId: "c1",
  alta: "/bienvenida/colectivo",
  endpoint: "/colectivos",
  destino: "/colectivo/resumen",
  titulo: "Resumen del colectivo",
  async completar(user) {
    await user.type(await screen.findByLabelText(/^Nombre/), "Asamblea de Fiorito");
    await user.click(screen.getByRole("radio", { name: "Asamblea" }));
    await user.type(screen.getByLabelText(/^Descripción/), "Comedor.");
  },
};

const COLABORADORA = {
  rol: "COLABORADORA",
  perfilId: "co1",
  alta: "/bienvenida/colaboradora",
  endpoint: "/colaboradores",
  destino: "/proyectos",
  titulo: "Proyectos",
  async completar(user) {
    await user.click(
      await screen.findByRole("radio", { name: "Con un nombre de fantasía" }),
    );
    await user.type(screen.getByLabelText(/^Nombre de fantasía/), "Pixel");
    await user.click(await screen.findByRole("checkbox", { name: "React" }));
  },
};

beforeEach(() => sessionStorage.clear());
afterEach(() => {
  dejarDeObservar?.();
  dejarDeObservar = null;
  recordarSesion(false);
  axiosClient.defaults.adapter = adaptadorOriginal;
  vi.restoreAllMocks();
  sessionStorage.clear();
});

async function montar(caso, { simulada = true } = {}) {
  const sesion = simulada
    ? crearSesionSimulada("SIN_PERFIL", { assign: () => {} })
    : crearSesionFalsa({ autenticado: true });
  recordarSesion(true);
  if (simulada) dejarDeObservar = observarAltasSimuladas(axiosClient);
  const cliente = crearAuthHttpClientSimulado("SIN_PERFIL");
  const cuentaSinPerfil = await cliente.obtenerCuentaActual();
  let cuentaDelBackend = cuentaSinPerfil;
  const obtenerCuentaActual = vi.fn(
    simulada ? cliente.obtenerCuentaActual : async () => cuentaDelBackend,
  );
  const transporte = vi.fn(async (config) => {
    if (config.method === "post" && config.url === caso.endpoint) {
      cuentaDelBackend = {
        ...cuentaSinPerfil,
        rol: caso.rol,
        perfilId: caso.perfilId,
      };
      return { config, status: 201, data: { id: caso.perfilId } };
    }
    if (config.url === "/habilidades") {
      return {
        config,
        status: 200,
        data: {
          data: [{ codigo: "react", titulo: "React", activo: true }],
          meta: { total_pages: 1 },
        },
      };
    }
    throw new Error(`Pedido inesperado: ${config.method} ${config.url}`);
  });
  axiosClient.defaults.adapter = transporte;
  const vista = montarRutas(
    <Route element={<MarcoDeLaApp />}>
      <Route element={<RutaProtegida permitirSinPerfil />}>
        <Route path={COLECTIVO.alta} element={<AltaColectivoPage />} />
        <Route path={COLABORADORA.alta} element={<AltaColaboradoraPage />} />
      </Route>
      <Route path={caso.destino} element={<h1>{caso.titulo}</h1>} />
    </Route>,
    { ruta: caso.alta, sesion, dependencies: { obtenerCuentaActual } },
  );
  const pedidosDeAlta = () =>
    transporte.mock.calls.filter(([config]) => config.method === "post");
  return { ...vista, obtenerCuentaActual, cuentaSinPerfil, pedidosDeAlta };
}

test.each([COLECTIVO, COLABORADORA])(
  "el alta de $rol conserva el perfil creado si falla la consulta de cuenta",
  async (caso) => {
    const { user, router, obtenerCuentaActual, pedidosDeAlta } = await montar(caso);
    await caso.completar(user);
    obtenerCuentaActual.mockRejectedValueOnce({ status: 500 });
    await user.click(screen.getByRole("button", { name: "Crear perfil" }));

    expect(await screen.findByText(TEXTO_PENDIENTE)).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "No pudimos verificar tu sesión" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Crear perfil" }),
    ).not.toBeInTheDocument();
    expect(router.state.location.pathname).toBe(caso.alta);

    await user.click(screen.getByRole("button", { name: "Actualizar cuenta" }));

    expect(await screen.findByRole("heading", { name: caso.titulo })).toBeVisible();
    expect(router.state.location.pathname).toBe(caso.destino);
    expect(pedidosDeAlta()).toHaveLength(1);
    expect(obtenerCuentaActual).toHaveBeenCalledTimes(3);
  },
);

test("un fallo de almacenamiento simulado no repite el alta confirmada por el backend", async () => {
  const { user, pedidosDeAlta } = await montar(COLABORADORA);
  await COLABORADORA.completar(user);
  vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
    throw new Error("Almacenamiento no disponible");
  });
  await user.click(screen.getByRole("button", { name: "Crear perfil" }));

  expect(await screen.findByRole("heading", { name: COLABORADORA.titulo })).toBeVisible();
  expect(pedidosDeAlta()).toHaveLength(1);
});

test("la redirección espera el rol y el ID del perfil que se creó", async () => {
  const { user, router, obtenerCuentaActual, cuentaSinPerfil, pedidosDeAlta } =
    await montar(COLECTIVO);
  await COLECTIVO.completar(user);
  obtenerCuentaActual
    .mockResolvedValueOnce(cuentaSinPerfil)
    .mockResolvedValueOnce({ ...cuentaSinPerfil, rol: COLECTIVO.rol, perfilId: "otro" });
  await user.click(screen.getByRole("button", { name: "Crear perfil" }));

  expect(await screen.findByText(TEXTO_PENDIENTE)).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Actualizar cuenta" }));
  expect(await screen.findByRole("button", { name: "Actualizar cuenta" })).toBeEnabled();
  expect(router.state.location.pathname).toBe(COLECTIVO.alta);
  expect(screen.queryByRole("button", { name: "Crear perfil" })).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Actualizar cuenta" }));
  expect(await screen.findByRole("heading", { name: COLECTIVO.titulo })).toBeVisible();
  expect(pedidosDeAlta()).toHaveLength(1);
});

test.each([COLECTIVO, COLABORADORA])(
  "el alta de $rol obtiene el perfil del backend con una sesión que solo autentica",
  async (caso) => {
    const { user, sesion, obtenerCuentaActual, pedidosDeAlta } = await montar(caso, {
      simulada: false,
    });
    await caso.completar(user);
    await user.click(screen.getByRole("button", { name: "Crear perfil" }));

    expect(await screen.findByRole("heading", { name: caso.titulo })).toBeVisible();
    expect(pedidosDeAlta()).toHaveLength(1);
    expect(obtenerCuentaActual).toHaveBeenCalledTimes(2);
    expect(sesion).not.toHaveProperty("asociarPerfil");
  },
);
