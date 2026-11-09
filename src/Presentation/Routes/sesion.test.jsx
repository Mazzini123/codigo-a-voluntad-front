import { StrictMode } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import { MarcoDeLaApp } from "@/Presentation/Components/App/layout/MarcoDeLaApp.jsx";
import { AuthProvider } from "@/Presentation/Context/AuthProvider.jsx";
import { ProveedorDeAvisos } from "@/Presentation/Components/App/avisos/ProveedorDeAvisos.jsx";
import { crearAuthDependencies } from "@/Presentation/Dependencies/authDependencies.js";
import { crearSesionFalsa } from "@/Presentation/Dependencies/identidadDependencies.js";
import { crearAuthHttpClientSimulado } from "@/Infrastructure/Auth/sesionSimulada.js";
import { crearSesionSimulada } from "@/Infrastructure/Auth/simulada/crearSesionSimulada.js";
import { SinConfigurarCallback } from "@/Infrastructure/Auth/SinConfigurarCallback.jsx";
import { useSesionSinConfigurar } from "@/Infrastructure/Auth/sinConfigurar.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";
import { BienvenidaPage } from "@/Presentation/Pages/ingreso/BienvenidaPage.jsx";
import { CallbackPage } from "@/Presentation/Pages/ingreso/CallbackPage.jsx";
import { LoginPage } from "@/Presentation/Pages/ingreso/LoginPage.jsx";
import { SinPermisoPage } from "@/Presentation/Pages/sistema/SinPermisoPage.jsx";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { RutaProtegida } from "./RutaProtegida.jsx";

const COLECTIVO = { id: "cuenta-1", rol: "COLECTIVO", perfilId: "colectivo-1" };
const COLABORADORA = { id: "cuenta-2", rol: "COLABORADORA", perfilId: "colaboradora-1" };
const SIN_PERFIL = { id: "cuenta-3", rol: null, perfilId: null };

const dependenciasDelBack = crearAuthDependencies(axiosClient);
const adaptadorOriginal = axiosClient.defaults.adapter;
let cuenta;
let transporte;

function respuesta(config, data, status = 200) {
  return { config, data, status, statusText: "", headers: {} };
}

function falla(config, status, data = {}) {
  throw new axios.AxiosError(
    "Error",
    "ERR_BAD_RESPONSE",
    config,
    null,
    respuesta(config, data, status),
  );
}

const cargarPrivado = (signal) =>
  axiosClient.get("/privado", { signal, requiereSesion: true });

function PaginaPrivada() {
  useConsulta(cargarPrivado);
  return <h1 tabIndex={-1}>Panel del colectivo</h1>;
}

function Aplicacion({ ruta, sesion, dependencies }) {
  return (
    <MemoryRouter initialEntries={[ruta]}>
      <ProveedorDeAvisos>
        <AuthProvider
          usarSesion={sesion.usarSesion}
          CallbackComponent={sesion.CallbackComponent}
          dependencies={dependencies ?? dependenciasDelBack}
        >
          <Routes>
            <Route element={<MarcoDeLaApp />}>
              <Route path="/" element={<Navigate to="/habilidades" replace />} />
              <Route path="/habilidades" element={<h1 tabIndex={-1}>Inicio</h1>} />
              <Route path="/colectivo/resumen" element={<h1 tabIndex={-1}>Inicio</h1>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<LoginPage registro />} />
              <Route path="/auth/callback" element={<CallbackPage />} />
              <Route path="/sin-permiso" element={<SinPermisoPage />} />
              <Route element={<RutaProtegida permitirSinPerfil />}>
                <Route path="/bienvenida" element={<BienvenidaPage />} />
              </Route>
              <Route element={<RutaProtegida roles={["COLECTIVO"]} />}>
                <Route path="/colectivo/privada" element={<PaginaPrivada />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </ProveedorDeAvisos>
    </MemoryRouter>
  );
}

function montar(
  ruta,
  { autenticado = Boolean(cuenta), sesion, dependencies, estricto = false } = {},
) {
  const sesionUsada = sesion ?? crearSesionFalsa({ autenticado });
  const arbol = (
    <Aplicacion ruta={ruta} sesion={sesionUsada} dependencies={dependencies} />
  );
  const vista = render(estricto ? <StrictMode>{arbol}</StrictMode> : arbol);
  return { user: userEvent.setup(), sesion: sesionUsada, ...vista };
}

beforeEach(() => {
  sessionStorage.clear();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  cuenta = COLECTIVO;
  transporte = vi.fn(async (config) => {
    if (config.url === "/auth/me") return respuesta(config, cuenta);
    return respuesta(config, {});
  });
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptadorOriginal;
});

function titulo(nombre) {
  return screen.findByRole("heading", { level: 1, name: nombre });
}

test("muestra Verificando sesión mientras espera la cuenta", async () => {
  let responder;
  transporte.mockImplementationOnce(
    (config) =>
      new Promise((resolve) => (responder = () => resolve(respuesta(config, cuenta)))),
  );
  montar("/colectivo/privada");
  expect(await screen.findByText("Verificando sesión…")).toHaveAttribute(
    "role",
    "status",
  );
  expect(
    screen.queryByRole("heading", { name: "Panel del colectivo" }),
  ).not.toBeInTheDocument();
  responder();
  expect(await titulo("Panel del colectivo")).toBeInTheDocument();
});

test("el pedido de la cuenta lleva el token de la sesión", async () => {
  montar("/colectivo/privada");
  await titulo("Panel del colectivo");
  const pedido = transporte.mock.calls.find(([config]) => config.url === "/auth/me")[0];
  expect(pedido.headers.Authorization).toBe("Bearer token-de-prueba");
});

test("sin sesión lleva a /login y, después de ingresar, vuelve a la ruta pedida", async () => {
  cuenta = null;
  const { user, sesion, unmount } = montar("/colectivo/privada");
  await titulo("Iniciar sesión");
  expect(transporte).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Ingresar" }));
  expect(sesion.inicios).toEqual([{ registro: false }]);
  unmount();

  cuenta = COLECTIVO;
  montar("/auth/callback", { sesion });
  expect(await titulo("Panel del colectivo")).toBeInTheDocument();
});

test("Crear una cuenta abre el registro de Logto", async () => {
  cuenta = null;
  const { user, sesion } = montar("/login");
  await user.click(await screen.findByRole("button", { name: "Crear una cuenta" }));
  expect(sesion.inicios).toEqual([{ registro: true }]);
});

test("con un rol no permitido muestra Sin permiso sin cerrar la sesión", async () => {
  cuenta = COLABORADORA;
  montar("/colectivo/privada");
  expect(await titulo("No tenés permiso para ver esta página")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Mi cuenta" })).toBeInTheDocument();
  expect(
    screen.getByText("Esta sección es para otro tipo de cuenta."),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Volver/ })).toHaveAttribute(
    "href",
    "/proyectos",
  );
});

test("una cuenta sin perfil va a elegir el tipo de cuenta", async () => {
  cuenta = SIN_PERFIL;
  montar("/colectivo/privada");
  expect(await titulo("¿Cómo vas a usar Código a Voluntad?")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Soy un colectivo/ })).toHaveAttribute(
    "href",
    "/bienvenida/colectivo",
  );
});

test("si no se puede verificar la sesión ofrece Reintentar", async () => {
  transporte.mockImplementationOnce(async (config) => falla(config, 500));
  const { user } = montar("/colectivo/privada");
  expect(await titulo("No pudimos verificar tu sesión")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(await titulo("Panel del colectivo")).toBeInTheDocument();
});

test("ante un 401 avisa una sola vez, olvida la sesión y lleva a /login", async () => {
  transporte.mockImplementation(async (config) => {
    if (config.url === "/auth/me") return respuesta(config, cuenta);
    return falla(config, 401);
  });
  const { sesion } = montar("/colectivo/privada");
  expect(await titulo("Iniciar sesión")).toBeInTheDocument();
  expect(screen.getAllByText("Tu sesión venció. Iniciá sesión de nuevo.")).toHaveLength(
    1,
  );
  await waitFor(() => expect(sesion.autenticado).toBe(false));
  await waitFor(() =>
    expect(screen.getAllByRole("button", { name: "Ingresar" })).toHaveLength(1),
  );
});

test("un 401 lleva al ingreso aunque falle la limpieza de la identidad", async () => {
  transporte.mockImplementation(async (config) => {
    if (config.url === "/auth/me") return respuesta(config, cuenta);
    return falla(config, 401);
  });
  const informar = vi.spyOn(console, "error").mockImplementation(() => {});
  const sesion = crearSesionFalsa({ autenticado: true });
  const { promise, reject } = Promise.withResolvers();
  const olvidar = vi.spyOn(sesion, "limpiar").mockReturnValue(promise);
  montar("/colectivo/privada", { sesion });

  expect(await titulo("Iniciar sesión")).toBeInTheDocument();
  expect(olvidar).toHaveBeenCalledTimes(1);
  const causa = new Error("No se pudo limpiar la identidad");
  reject(causa);
  await waitFor(() =>
    expect(informar).toHaveBeenCalledWith("No pudimos limpiar la sesión vencida:", causa),
  );
  expect(
    transporte.mock.calls.filter(([config]) => config.url === "/auth/me"),
  ).toHaveLength(1);
});

test("con sesión, /login lleva al inicio", async () => {
  montar("/login");
  expect(await titulo("Inicio")).toBeInTheDocument();
});

test("la vuelta de Logto se completa una sola vez aunque StrictMode monte dos veces", async () => {
  const sesion = crearSesionFalsa();
  const completar = vi.spyOn(sesion, "completarIngreso");
  montar("/auth/callback", { sesion, estricto: true });
  expect(await titulo("Inicio")).toBeInTheDocument();
  expect(completar).toHaveBeenCalledTimes(1);
});

test("si la vuelta de Logto falla, explica y ofrece volver a ingresar", async () => {
  const sesion = crearSesionFalsa();
  sesion.completarIngreso = async () => {
    throw new Error("state inválido");
  };
  montar("/auth/callback", { sesion });
  expect(await titulo("No pudimos iniciar sesión")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Volver a ingresar" })).toHaveAttribute(
    "href",
    "/login",
  );
});

describe("cabecera", () => {
  test("sin sesión muestra Ingresar", async () => {
    cuenta = null;
    montar("/habilidades");
    const cabecera = screen.getByRole("banner");
    expect(
      await within(cabecera).findByRole("button", { name: "Ingresar" }),
    ).toBeEnabled();
  });

  test("Cerrar sesión pide confirmación y vuelve a mostrar Ingresar", async () => {
    const { user, sesion } = montar("/habilidades");
    const miCuenta = await screen.findByRole("button", { name: "Mi cuenta" });
    await user.click(miCuenta);
    expect(miCuenta).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    const dialogo = screen.getByRole("dialog", { name: "¿Cerrar sesión?" });
    expect(dialogo).not.toHaveTextContent("Esta acción no se puede deshacer.");
    await user.click(within(dialogo).getByRole("button", { name: "Cerrar sesión" }));
    expect(sesion.salidas).toBe(1);
    expect(await screen.findByRole("button", { name: "Ingresar" })).toBeInTheDocument();
  });

  test("si falla el cierre de sesión lo avisa, conserva la sesión e informa la causa", async () => {
    const informar = vi.spyOn(console, "error").mockImplementation(() => {});
    const { user, sesion } = montar("/habilidades");
    const causa = new Error("Logto no respondió");
    vi.spyOn(sesion, "cerrar").mockRejectedValue(causa);
    await user.click(await screen.findByRole("button", { name: "Mi cuenta" }));
    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    const dialogo = screen.getByRole("dialog", { name: "¿Cerrar sesión?" });
    await user.click(within(dialogo).getByRole("button", { name: "Cerrar sesión" }));
    expect(
      await screen.findByText("No pudimos cerrar tu sesión. Probá de nuevo."),
    ).toBeInTheDocument();
    expect(informar).toHaveBeenCalledWith("No pudimos cerrar la sesión:", causa);
    expect(screen.getByRole("button", { name: "Mi cuenta" })).toBeInTheDocument();
  });

  test("Esc cierra el menú de cuenta y devuelve el foco", async () => {
    const { user } = montar("/habilidades");
    const miCuenta = await screen.findByRole("button", { name: "Mi cuenta" });
    await user.click(miCuenta);
    await user.keyboard("{Escape}");
    expect(miCuenta).toHaveAttribute("aria-expanded", "false");
    expect(miCuenta).toHaveFocus();
  });
});

describe("sesión simulada", () => {
  function simulada(tipo) {
    const ubicacion = { assign: vi.fn() };
    return {
      ubicacion,
      sesion: crearSesionSimulada(tipo, ubicacion),
      dependencies: crearAuthDependencies(axiosClient, crearAuthHttpClientSimulado(tipo)),
    };
  }

  async function ingresarDesde(ruta, tipo) {
    const { ubicacion, sesion, dependencies } = simulada(tipo);
    const { user, unmount } = montar(ruta, { sesion, dependencies });
    await titulo("Iniciar sesión");
    await user.click(await screen.findByRole("button", { name: "Ingresar" }));
    expect(ubicacion.assign).toHaveBeenCalledWith("/auth/callback");
    unmount();
    return montar("/auth/callback", { sesion, dependencies });
  }

  test("SIN_PERFIL termina eligiendo el tipo de cuenta", async () => {
    await ingresarDesde("/colectivo/privada", "SIN_PERFIL");
    expect(await titulo("¿Cómo vas a usar Código a Voluntad?")).toBeInTheDocument();
    expect(transporte).not.toHaveBeenCalled();
  });

  test("COLABORADORA ve Sin permiso en una ruta de colectivo", async () => {
    await ingresarDesde("/colectivo/privada", "COLABORADORA");
    expect(await titulo("No tenés permiso para ver esta página")).toBeInTheDocument();
  });

  test("COLECTIVO vuelve a la ruta pedida y el menú avisa que es simulada", async () => {
    const { user } = await ingresarDesde("/colectivo/privada", "COLECTIVO");
    expect(await titulo("Panel del colectivo")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Mi cuenta" }));
    expect(screen.getByText("Sesión simulada · Colectivo")).toBeInTheDocument();
  });
});

test.each([
  ["Ingresar", "Iniciar sesión"],
  ["Crear una cuenta", "Crear una cuenta"],
])(
  "sin Logto, %s abre la pantalla local sin pedir credenciales",
  async (accion, encabezado) => {
    cuenta = null;
    const sinConfigurar = {
      usarSesion: useSesionSinConfigurar,
      CallbackComponent: SinConfigurarCallback,
    };
    const iniciar = vi.spyOn(useSesionSinConfigurar(), "iniciar");
    const { user } = montar("/habilidades", { sesion: sinConfigurar });
    await user.click(
      await within(screen.getByRole("banner")).findByRole("link", { name: accion }),
    );
    expect(await titulo(encabezado)).toBeVisible();
    expect(screen.queryByLabelText("Correo electrónico")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Contraseña")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: accion })).not.toBeInTheDocument();
    expect(
      screen.getByText(/El ingreso y el registro todavía no están habilitados/),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Explorar proyectos" })).toHaveAttribute(
      "href",
      "/proyectos",
    );
    expect(iniciar).not.toHaveBeenCalled();
    expect(transporte).not.toHaveBeenCalled();
  },
);
