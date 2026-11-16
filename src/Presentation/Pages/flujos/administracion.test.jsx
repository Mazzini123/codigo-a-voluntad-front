import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { crearSesionFalsa } from "@/Presentation/Dependencies/identidadDependencies.js";
import { Raiz } from "@/Presentation/Components/App/layout/Raiz.jsx";
import { rutas } from "@/Presentation/Routes/RutasDeLaApp.jsx";

const adaptadorOriginal = axiosClient.defaults.adapter;
let transporte;

const PERMISOS = [
  "PROYECTO_DESTACAR",
  "REVISION_VER",
  "REVISION_RESOLVER",
  "AUDITORIA_VER",
  "ADMIN_GESTIONAR",
];

const CONTEXTO_ADMIN = {
  id: "ctx-admin",
  tipo: "ADMINISTRACION",
  rol: "ADMIN",
  colectivo: null,
  colaborador: null,
  permisos: PERMISOS,
};

const CONTEXTO_COLECTIVO = {
  id: "ctx-colectivo",
  tipo: "COLECTIVO",
  rol: "LIDER",
  colectivo: { id: "c1", nombre: "Fundación Huerta" },
  colaborador: null,
  permisos: [],
};

const CONTEXTO_COLABORADOR = {
  id: "ctx-colaborador",
  tipo: "COLABORADOR",
  rol: "COLABORADOR",
  colectivo: null,
  colaborador: { id: "co1", nombre: "Ana" },
  permisos: [],
};

function cuenta(cambios = {}) {
  return {
    id: "sub-1",
    rol: "ADMINISTRACION",
    perfilId: null,
    usuarioId: "u1",
    nombre: "Ana",
    nombrePendiente: false,
    contextoActual: CONTEXTO_ADMIN,
    contextos: [CONTEXTO_ADMIN],
    ...cambios,
  };
}

beforeEach(() => {
  transporte = vi.fn(async (config) => ({
    config,
    status: 200,
    statusText: "OK",
    headers: {},
    data: [],
  }));
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptadorOriginal;
});

function montar({ estado, ruta = "/admin" }) {
  const dependencies = {
    obtenerCuentaActual: vi.fn(async () => estado.cuenta),
    registrarUsuario: async () => ({ creado: false }),
    seleccionarContexto: vi.fn(async (contextoId) => {
      const elegido = estado.cuenta.contextos.find(({ id }) => id === contextoId);
      estado.cuenta = {
        ...estado.cuenta,
        contextoActual: elegido,
        rol: { ADMINISTRACION: "ADMINISTRACION", COLECTIVO: "COLECTIVO" }[elegido.tipo],
      };
    }),
    limpiarContexto: vi.fn(async () => null),
  };
  const sesion = crearSesionFalsa({ autenticado: true });
  const router = createMemoryRouter(
    [
      {
        ...rutas[0],
        element: (
          <Raiz
            usarSesion={sesion.usarSesion}
            CallbackComponent={sesion.CallbackComponent}
            dependencies={dependencies}
          />
        ),
      },
    ],
    { initialEntries: [ruta] },
  );
  render(<RouterProvider router={router} />);
  return { router, user: userEvent.setup() };
}

function pedidosDeAdministracion() {
  return transporte.mock.calls.filter(([config]) =>
    String(config.url).startsWith("/administracion"),
  );
}

const SIN_PERMISOS = { ...CONTEXTO_ADMIN, permisos: [] };

function cuentaSinPermisos() {
  return cuenta({ contextoActual: SIN_PERMISOS, contextos: [SIN_PERMISOS] });
}

test("la administradora entra a /admin y llega a su primera sección con el enlace principal marcado", async () => {
  const { router } = montar({ estado: { cuenta: cuenta() } });
  expect(
    await screen.findByRole("navigation", { name: "Secciones de administración" }),
  ).toBeVisible();
  await waitFor(() => expect(router.state.location.pathname).toBe("/admin/destacados"));
  const principal = screen.getByRole("navigation", { name: "Principal" });
  expect(
    within(principal)
      .getAllByRole("link")
      .map((enlace) => enlace.textContent),
  ).toEqual(["Proyectos", "Administración"]);
  expect(within(principal).getByRole("link", { name: "Administración" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("sin permisos para ninguna sección lo explica y no pide nada al back", async () => {
  montar({ estado: { cuenta: cuentaSinPermisos() } });
  expect(
    await screen.findByRole("heading", {
      level: 1,
      name: "Administración de la plataforma",
    }),
  ).toBeVisible();
  expect(
    await screen.findByText("Todavía no hay secciones disponibles para tu cuenta."),
  ).toBeVisible();
  expect(document.title).toBe("Administración · Código a Voluntad");
  await act(async () => {});
  expect(pedidosDeAdministracion()).toHaveLength(0);
});

test("al entrar a la portada la administradora llega a /admin", async () => {
  const { router } = montar({ estado: { cuenta: cuentaSinPermisos() }, ruta: "/" });
  await waitFor(() => expect(router.state.location.pathname).toBe("/admin"));
});

test("una colaboradora que abre /admin ve Sin permiso y no se pide nada", async () => {
  const { router } = montar({
    estado: {
      cuenta: cuenta({
        rol: "COLABORADORA",
        perfilId: "co1",
        contextoActual: CONTEXTO_COLABORADOR,
        contextos: [CONTEXTO_COLABORADOR],
      }),
    },
  });
  expect(
    await screen.findByRole("heading", { name: "No tenés permiso para ver esta página" }),
  ).toBeVisible();
  expect(
    screen.getByText("Esta sección es solo para la administración de la plataforma."),
  ).toBeVisible();
  expect(router.state.location.pathname).toBe("/sin-permiso");
  await act(async () => {});
  expect(pedidosDeAdministracion()).toHaveLength(0);
});

test("quien opera como colectivo y es administradora recibe la pista para cambiar de contexto", async () => {
  const estado = {
    cuenta: cuenta({
      rol: "COLECTIVO",
      perfilId: "c1",
      contextoActual: CONTEXTO_COLECTIVO,
      contextos: [CONTEXTO_COLECTIVO, CONTEXTO_ADMIN],
    }),
  };
  const { router, user } = montar({ estado });
  expect(
    await screen.findByText(
      /Cambiá a «Administración de la plataforma» desde «Mi cuenta»/,
    ),
  ).toBeVisible();
  expect(router.state.location.pathname).toBe("/sin-permiso");

  await user.click(screen.getByRole("button", { name: "Mi cuenta" }));
  await user.click(
    screen.getByRole("button", { name: /Administración de la plataforma/ }),
  );
  await waitFor(() => expect(router.state.location.pathname).toBe("/admin/destacados"));
  expect(
    await screen.findByRole("heading", { level: 1, name: "Proyectos destacados" }),
  ).toBeVisible();
  expect(
    screen.queryByText("No tenés permiso para ver esta página"),
  ).not.toBeInTheDocument();
});

test("un visitante que abre /admin va a ingresar", async () => {
  const sesion = crearSesionFalsa({ autenticado: false });
  const router = createMemoryRouter(
    [
      {
        ...rutas[0],
        element: (
          <Raiz
            usarSesion={sesion.usarSesion}
            CallbackComponent={sesion.CallbackComponent}
            dependencies={{
              obtenerCuentaActual: async () => null,
              registrarUsuario: async () => ({ creado: false }),
            }}
          />
        ),
      },
    ],
    { initialEntries: ["/admin"] },
  );
  render(<RouterProvider router={router} />);
  await waitFor(() => expect(router.state.location.pathname).toBe("/login"));
});
