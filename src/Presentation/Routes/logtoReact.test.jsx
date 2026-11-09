import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import axios from "axios";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { Raiz } from "@/Presentation/Components/App/layout/Raiz.jsx";
import { rutas } from "./RutasDeLaApp.jsx";

const sdk = vi.hoisted(() => ({
  isAuthenticated: vi.fn(),
  isSignInRedirected: vi.fn(),
  handleSignInCallback: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getAccessToken: vi.fn(),
  clearAllTokens: vi.fn(),
  getRefreshToken: vi.fn(),
  getAccessTokenClaims: vi.fn(),
  getOrganizationToken: vi.fn(),
  getOrganizationTokenClaims: vi.fn(),
  getIdToken: vi.fn(),
  getIdTokenClaims: vi.fn(),
  fetchUserInfo: vi.fn(),
  clearAccessToken: vi.fn(),
}));
const cliente = vi.hoisted(() =>
  vi.fn(function ClienteDePrueba() {
    return sdk;
  }),
);

vi.mock("@logto/react", async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    LogtoProvider: (props) => (
      <original.LogtoProvider {...props} LogtoClientClass={cliente} />
    ),
  };
});

vi.mock(
  "@/Presentation/Dependencies/identidadDependencies.js",
  async (importOriginal) => {
    const original = await importOriginal();
    return {
      ...original,
      proveedorDeIdentidad: { tipo: original.PROVEEDOR_DE_IDENTIDAD.LOGTO },
      configuracionLogto: {
        endpoint: "https://tenant.logto.app",
        appId: "app-123",
        resources: ["https://api.codigo-a-voluntad"],
      },
    };
  },
);

const adaptadorOriginal = axiosClient.defaults.adapter;
let transporte;

beforeEach(() => {
  sessionStorage.clear();
  vi.spyOn(console, "error").mockImplementation(() => {});
  Object.values(sdk).forEach((metodo) => metodo.mockReset());
  sdk.isAuthenticated.mockResolvedValue(false);
  sdk.isSignInRedirected.mockResolvedValueOnce(true).mockResolvedValue(false);
  sdk.handleSignInCallback.mockResolvedValue(undefined);
  sdk.signIn.mockResolvedValue(undefined);
  sdk.signOut.mockResolvedValue(undefined);
  sdk.clearAllTokens.mockResolvedValue(undefined);
  sdk.getAccessToken.mockResolvedValue("jwt-react");
  transporte = vi.fn(async (config) => ({
    config,
    status: 200,
    statusText: "OK",
    headers: {},
    data:
      config.url === "/auth/me"
        ? { id: "cuenta-1", rol: null, perfilId: null }
        : { data: [], meta: { page: 1, per_page: 12, total: 0, total_pages: 0 } },
  }));
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptadorOriginal;
  window.history.replaceState(null, "", "/");
});

function montar(ruta = "/", estricto = false) {
  window.history.replaceState(null, "", ruta);
  const router = createMemoryRouter([{ ...rutas[0], element: <Raiz /> }], {
    initialEntries: [ruta],
  });
  const app = <RouterProvider router={router} />;
  render(estricto ? <StrictMode>{app}</StrictMode> : app);
  return { router, user: userEvent.setup() };
}

test.each([
  ["Ingresar", "signIn"],
  ["Crear una cuenta", "register"],
])(
  "%s usa el SDK de React con la pantalla y el callback correspondientes",
  async (nombre, firstScreen) => {
    const { user } = montar();
    await user.click(await screen.findByRole("button", { name: nombre }));
    expect(sdk.signIn).toHaveBeenCalledWith({
      redirectUri: `${window.location.origin}/callback`,
      firstScreen,
    });
    expect(cliente).toHaveBeenCalledWith(
      {
        endpoint: "https://tenant.logto.app",
        appId: "app-123",
        resources: ["https://api.codigo-a-voluntad"],
      },
      false,
    );
    expect(transporte).not.toHaveBeenCalled();
  },
);

test("espera al SDK al recargar antes de consultar la cuenta y enviar el token del recurso", async () => {
  let terminar;
  sdk.isAuthenticated.mockReturnValue(
    new Promise((resolve) => {
      terminar = resolve;
    }),
  );
  montar("/bienvenida");
  expect(await screen.findByText("Verificando sesión…")).toBeVisible();
  expect(transporte).not.toHaveBeenCalled();
  await act(async () => terminar(true));
  expect(
    await screen.findByRole("heading", { name: "¿Cómo vas a usar Código a Voluntad?" }),
  ).toBeVisible();
  const cuenta = transporte.mock.calls.find(([config]) => config.url === "/auth/me")[0];
  expect(cuenta.headers.Authorization).toBe("Bearer jwt-react");
  expect(sdk.getAccessToken).toHaveBeenCalledWith("https://api.codigo-a-voluntad");
  expect(
    transporte.mock.calls.filter(([config]) => config.url === "/auth/me"),
  ).toHaveLength(1);
});

test("el callback espera la autenticación antes de pedir la cuenta y conserva el destino", async () => {
  sdk.isAuthenticated.mockResolvedValue(true);
  let terminar;
  sdk.handleSignInCallback.mockReturnValue(
    new Promise((resolve) => {
      terminar = resolve;
    }),
  );
  sessionStorage.setItem("codigo-a-voluntad:volver-a", "/bienvenida");
  const { router } = montar("/callback?code=abc&state=xyz");
  expect(await screen.findByText("Iniciando sesión…")).toBeVisible();
  await waitFor(() => expect(sdk.handleSignInCallback).toHaveBeenCalled());
  expect(transporte).not.toHaveBeenCalled();
  await act(async () => terminar());
  expect(
    await screen.findByRole("heading", { name: "¿Cómo vas a usar Código a Voluntad?" }),
  ).toBeVisible();
  expect(router.state.location.pathname).toBe("/bienvenida");
  expect(sessionStorage.getItem("codigo-a-voluntad:volver-a")).toBeNull();
});

test("si falla la cuenta durante el callback, reintenta la consulta y conserva el destino", async () => {
  sdk.isAuthenticated.mockResolvedValue(true);
  sessionStorage.setItem(
    "codigo-a-voluntad:volver-a",
    "/proyectos?vista=todos&etiqueta=web#resultados",
  );
  const responder = transporte.getMockImplementation();
  let recuperarCuenta;
  transporte
    .mockRejectedValueOnce(
      new axios.AxiosError("error", "ERR_BAD_RESPONSE", {}, null, {
        status: 500,
        data: {},
      }),
    )
    .mockImplementationOnce(
      (config) =>
        new Promise((resolve) => {
          recuperarCuenta = () => resolve(responder(config));
        }),
    );
  const { user, router } = montar("/callback?code=abc&state=xyz");

  expect(
    await screen.findByRole("heading", { name: "No pudimos verificar tu sesión" }),
  ).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(await screen.findByRole("button", { name: "Reintentando…" })).toBeDisabled();
  expect(transporte.mock.calls.map(([config]) => config.url)).toEqual([
    "/auth/me",
    "/auth/me",
  ]);
  expect(sdk.handleSignInCallback).toHaveBeenCalledTimes(1);

  await act(async () => recuperarCuenta());
  expect(
    await screen.findByRole("heading", { name: "Proyectos de colectivos sociales" }),
  ).toBeVisible();
  expect(router.state.location).toMatchObject({
    pathname: "/proyectos",
    search: "?vista=todos&etiqueta=web",
    hash: "#resultados",
  });
  expect(sdk.handleSignInCallback).toHaveBeenCalledTimes(1);
  expect(sdk.signIn).not.toHaveBeenCalled();
});

test("el error capturado por el SDK avisa y permite reintentar desde la cabecera", async () => {
  sdk.signIn.mockRejectedValueOnce(new Error("detalle del proveedor"));
  const { user } = montar();
  await user.click(await screen.findByRole("button", { name: "Ingresar" }));
  expect(
    await screen.findByText("No pudimos abrir la pantalla de ingreso. Probá de nuevo."),
  ).toBeVisible();
  expect(screen.queryByText("detalle del proveedor")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Ingresar" }));
  expect(sdk.signIn).toHaveBeenCalledTimes(2);
});

test.each([false, true])(
  "un callback fallido o incompleto ofrece volver a ingresar (incompleto: %s)",
  async (incompleto) => {
    if (incompleto) sdk.isSignInRedirected.mockReset().mockResolvedValue(false);
    else sdk.handleSignInCallback.mockRejectedValue(new Error("callback inválido"));
    montar(incompleto ? "/callback" : "/callback?code=abc&state=xyz");
    expect(
      await screen.findByRole("heading", { name: "No pudimos iniciar sesión" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Volver a ingresar" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(transporte).not.toHaveBeenCalled();
  },
);

test("cerrar sesión usa la salida del SDK y vuelve a la portada", async () => {
  sdk.isAuthenticated.mockResolvedValue(true);
  const { user, router } = montar("/bienvenida");
  await user.click(await screen.findByRole("button", { name: "Mi cuenta" }));
  await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
  const dialogo = screen.getByRole("dialog");
  await user.click(within(dialogo).getByRole("button", { name: "Cerrar sesión" }));
  expect(sdk.signOut).toHaveBeenCalledWith(`${window.location.origin}/`);
  expect(router.state.location.pathname).toBe("/");
});

test("un enlace de callback sin intento de ingreso activo ofrece volver", async () => {
  sdk.isSignInRedirected.mockReset().mockResolvedValue(false);
  montar("/callback?code=viejo&state=viejo");
  expect(
    await screen.findByRole("link", { name: "Volver a ingresar" }, { timeout: 2000 }),
  ).toBeVisible();
  expect(transporte).not.toHaveBeenCalled();
});

test("el callback del SDK funciona dentro de StrictMode", async () => {
  montar("/callback?code=abc&state=xyz", true);
  expect(
    await screen.findByRole("heading", { name: "¿Cómo vas a usar Código a Voluntad?" }),
  ).toBeVisible();
  expect(sdk.handleSignInCallback).toHaveBeenCalled();
});

test("si falla la cuenta del backend permite reintentar sin perder la identidad de Logto", async () => {
  sdk.isAuthenticated.mockResolvedValue(true);
  transporte.mockRejectedValueOnce(
    new axios.AxiosError("error", "ERR_BAD_RESPONSE", {}, null, {
      status: 500,
      data: {},
    }),
  );
  const { user, router } = montar("/bienvenida");
  expect(
    await screen.findByRole("heading", { name: "No pudimos verificar tu sesión" }),
  ).toBeVisible();
  expect(router.state.location.pathname).toBe("/bienvenida");
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(
    await screen.findByRole("heading", { name: "¿Cómo vas a usar Código a Voluntad?" }),
  ).toBeVisible();
  expect(sdk.clearAllTokens).not.toHaveBeenCalled();
});

test("un 401 del backend limpia la sesión del SDK y permite ingresar de nuevo", async () => {
  sdk.isAuthenticated.mockResolvedValue(true);
  transporte.mockImplementationOnce(async (config) => {
    throw new axios.AxiosError("error", "ERR_BAD_RESPONSE", config, null, {
      status: 401,
      data: {},
    });
  });
  const { user, router } = montar("/bienvenida");
  expect(await screen.findByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
  expect(
    await screen.findByText("Tu sesión venció. Iniciá sesión de nuevo."),
  ).toBeVisible();
  expect(sdk.clearAllTokens).toHaveBeenCalledTimes(1);
  expect(router.state.location.pathname).toBe("/login");
  expect(router.state.location.state?.desde?.pathname).toBe("/bienvenida");
  await user.click(screen.getByRole("button", { name: "Ingresar" }));
  expect(sdk.signIn).toHaveBeenCalled();
});

test("un token que no está disponible permite reintentar la verificación de la cuenta", async () => {
  sdk.isAuthenticated.mockResolvedValue(true);
  sdk.getAccessToken.mockResolvedValueOnce(undefined);
  const { user } = montar("/bienvenida");

  expect(
    await screen.findByRole("heading", { name: "No pudimos verificar tu sesión" }),
  ).toBeVisible();
  expect(transporte.mock.calls.some(([config]) => config.url === "/auth/me")).toBe(false);
  expect(sdk.clearAllTokens).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(
    await screen.findByRole("heading", { name: "¿Cómo vas a usar Código a Voluntad?" }),
  ).toBeVisible();
});
