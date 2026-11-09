import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { crearSesionFalsa } from "@/Presentation/Dependencies/identidadDependencies.js";
import { Raiz } from "@/Presentation/Components/App/layout/Raiz.jsx";
import { rutas } from "@/Presentation/Routes/RutasDeLaApp.jsx";

const TITULO = "Conectamos colectivos sociales con personas que desarrollan software";
const COLECTIVO = { id: "c", rol: "COLECTIVO", perfilId: "c1" };
const COLABORADORA = { id: "a", rol: "COLABORADORA", perfilId: "co1" };
const adaptadorOriginal = axiosClient.defaults.adapter;
let transporte;

function pagina(data) {
  return {
    data,
    meta: { page: 1, per_page: 12, total: data.length, total_pages: data.length ? 1 : 0 },
  };
}

const PROYECTO = {
  id: "p1",
  titulo: "Proyecto del comedor",
  descripcion: "Organizar los turnos.",
  estado: "ABIERTO",
  fechaCreacion: "2026-11-06T12:00:00Z",
  perfiles: [],
  colaboraciones: [],
};

beforeEach(() => {
  transporte = vi.fn(async (config) => ({
    config,
    status: 200,
    statusText: "OK",
    headers: {},
    data:
      config.url === "/estadisticas"
        ? {
            colectivos: { total: 0 },
            proyectos: { total: 0 },
            colaboradores: { total: 0 },
            colaboraciones: { total: 0 },
          }
        : config.url === "/proyectos"
          ? pagina([PROYECTO])
          : config.url === "/colectivos/c1/proyectos"
            ? []
            : config.url === "/colectivos/c1"
              ? { id: "c1", nombre: "Colectivo de prueba", proyectos: [] }
              : config.url === "/proyectos/p1"
                ? PROYECTO
                : config.url.endsWith("/colaboraciones")
                  ? []
                  : config.url === "/colaboradores/co1"
                    ? { id: "co1", habilidades: [] }
                    : pagina([]),
  }));
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptadorOriginal;
});

function montar({
  cuenta = null,
  sesion = crearSesionFalsa({ autenticado: Boolean(cuenta) }),
  obtenerCuentaActual = async () => cuenta,
  ruta = "/",
} = {}) {
  const router = createMemoryRouter(
    [
      {
        ...rutas[0],
        element: (
          <Raiz
            usarSesion={sesion.usarSesion}
            CallbackComponent={sesion.CallbackComponent}
            dependencies={{ obtenerCuentaActual }}
          />
        ),
      },
    ],
    { initialEntries: [ruta] },
  );
  render(<RouterProvider router={router} />);
  return { router, user: userEvent.setup() };
}

test("el visitante ve la portada con contenido completo sin consultar proyectos", async () => {
  const { router } = montar();
  expect(await screen.findByRole("heading", { level: 1, name: TITULO })).toBeVisible();
  expect(router.state.location.pathname).toBe("/");
  expect(document.title).toBe("Inicio · Código a Voluntad");
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  await waitFor(() =>
    expect(
      screen.queryByRole("heading", { name: "La plataforma en n?meros" }),
    ).not.toBeInTheDocument(),
  );
  expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(2);
  expect(screen.getByText("¿Necesito una cuenta para explorar?")).toBeVisible();
  expect(
    screen.getByText("¿Todas las colaboraciones son sin remuneración?"),
  ).toBeVisible();
  expect(screen.getByText("¿Cuándo se comparten mis datos de contacto?")).toBeVisible();
  expect(
    screen.getByText(/Si la aceptación es automática/).closest("details"),
  ).not.toHaveAttribute("open");
  expect(screen.getByRole("link", { name: "Explorar proyectos" })).toHaveAttribute(
    "href",
    "/proyectos",
  );
  expect(screen.getAllByRole("button", { name: "Ingresar", exact: true })).toHaveLength(
    1,
  );
  await act(async () => {});
  expect(
    transporte.mock.calls.filter(([config]) => config.url !== "/estadisticas"),
  ).toHaveLength(0);
});

test("el contenido público permanece disponible mientras se verifica la sesión", async () => {
  let resolver;
  const { router } = montar({
    sesion: crearSesionFalsa({ autenticado: true }),
    obtenerCuentaActual: () =>
      new Promise((resolve) => {
        resolver = resolve;
      }),
  });
  expect(screen.getByRole("heading", { name: TITULO })).toBeVisible();
  expect(screen.getByRole("link", { name: "Explorar proyectos" })).toBeEnabled();
  await waitFor(() => expect(resolver).toBeTypeOf("function"));
  await act(async () => resolver(COLECTIVO));
  await screen.findByRole("heading", { level: 1, name: "Resumen del colectivo" });
  expect(router.state.location.pathname).toBe("/colectivo/resumen");
});

test.each([
  [COLECTIVO, "/colectivo/resumen", "Resumen del colectivo"],
  [COLABORADORA, "/proyectos", "Proyectos de colectivos sociales"],
  [
    { id: "s", rol: null, perfilId: null },
    "/bienvenida",
    "¿Cómo vas a usar Código a Voluntad?",
  ],
])(
  "la raíz lleva a la cuenta %s al inicio de su rol con replace",
  async (cuenta, destino, titulo) => {
    const { router } = montar({ cuenta });
    await screen.findByRole("heading", { level: 1, name: titulo });
    expect(router.state.location.pathname).toBe(destino);
    expect(router.state.historyAction).toBe("REPLACE");
  },
);

test("Publicar un proyecto lleva al registro con la aclaración del paso previo", async () => {
  const { router, user } = montar();
  await user.click(screen.getByText("Mi colectivo necesita software"));
  const publicar = screen.getByRole("link", { name: "Publicar un proyecto" });
  expect(publicar).toHaveAccessibleDescription(
    "Primero creás una cuenta y completás el perfil de tu colectivo.",
  );
  await user.click(publicar);
  await screen.findByRole("heading", { name: "Crear una cuenta" });
  expect(router.state.location.pathname).toBe("/registro");
  expect(
    transporte.mock.calls.filter(([config]) => config.url !== "/estadisticas"),
  ).toHaveLength(0);
});

test("las respuestas se pueden desplegar individualmente o todas juntas", async () => {
  const { user } = montar();
  const pregunta = screen.getByText("¿Necesito una cuenta para explorar?");
  await user.click(pregunta);
  expect(pregunta.closest("details")).toHaveAttribute("open");

  await user.click(screen.getByRole("button", { name: "Ver todas las respuestas" }));
  const ultimaRespuesta = screen.getByText(/Si la aceptación es automática/);
  expect(ultimaRespuesta.closest("details")).toHaveAttribute("open");

  await user.click(screen.getByRole("button", { name: "Ocultar todas las respuestas" }));
  expect(pregunta.closest("details")).not.toHaveAttribute("open");
  expect(ultimaRespuesta.closest("details")).not.toHaveAttribute("open");
});

test("se explora un detalle sin sesión y la marca permite volver a la landing", async () => {
  const { router, user } = montar();
  await user.click(screen.getByRole("link", { name: "Explorar proyectos" }));
  await user.click(await screen.findByRole("link", { name: "Proyecto del comedor" }));
  await screen.findByRole("heading", { level: 1, name: "Proyecto del comedor" });
  expect(router.state.location.pathname).toBe("/proyectos/p1");
  await user.click(screen.getByRole("link", { name: "Código a Voluntad" }));
  expect(await screen.findByRole("heading", { name: TITULO })).toHaveFocus();
  expect(router.state.location.pathname).toBe("/");
});

test("cerrar sesión termina en la portada pública", async () => {
  const { user, router } = montar({ cuenta: COLECTIVO });
  await screen.findByRole("heading", { level: 1, name: "Resumen del colectivo" });
  await user.click(screen.getByRole("button", { name: "Mi cuenta" }));
  await user.click(screen.getByRole("button", { name: "Cerrar sesión", exact: true }));
  await user.click(
    within(screen.getByRole("dialog")).getByRole("button", {
      name: "Cerrar sesión",
      exact: true,
    }),
  );
  expect(await screen.findByRole("heading", { name: TITULO })).toBeVisible();
  expect(router.state.location.pathname).toBe("/");
});

test.each(["/", "/login", "/registro", "/no-existe", "/proyectos/p1"])(
  "el pie compartido aparece una sola vez con el mismo contenido en %s",
  async (ruta) => {
    montar({ ruta });
    const pies = await screen.findAllByRole("contentinfo");
    expect(pies).toHaveLength(1);
    expect(within(pies[0]).getByText("Código a Voluntad")).toBeVisible();
    expect(
      within(pies[0]).getByText("Colectivos sociales y colaboradoras de software."),
    ).toBeVisible();
    expect(
      within(pies[0]).getByText(
        "Proyecto académico de Desarrollo de Software · UTN FRBA",
      ),
    ).toBeVisible();
    expect(within(pies[0]).getByRole("link", { name: "Cómo funciona" })).toHaveAttribute(
      "href",
      "/#como-empezar",
    );
  },
);

test.each([
  [null, "Iniciar sesión"],
  [COLECTIVO, "Resumen del colectivo"],
  [COLABORADORA, "Proyectos de colectivos sociales"],
  [{ id: "s", rol: null, perfilId: null }, "¿Cómo vas a usar Código a Voluntad?"],
])(
  "Cómo funciona abre la explicación y enfoca la sección para %s",
  async (cuenta, titulo) => {
    const { router, user } = montar({ cuenta, ruta: cuenta ? "/" : "/login" });
    await screen.findByRole("heading", { name: titulo, level: 1 });
    await user.click(
      within(screen.getByRole("contentinfo")).getByRole("link", {
        name: "Cómo funciona",
      }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Dos formas de empezar" }),
      ).toHaveFocus(),
    );
    expect(router.state.location.pathname).toBe("/");
    expect(router.state.location.hash).toBe("#como-empezar");
    expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
  },
);

test("Cómo funciona también enfoca la sección desde la propia landing", async () => {
  const { user } = montar();
  await user.click(
    within(screen.getByRole("contentinfo")).getByRole("link", { name: "Cómo funciona" }),
  );
  expect(screen.getByRole("heading", { name: "Dos formas de empezar" })).toHaveFocus();
  expect(
    transporte.mock.calls.filter(([config]) => config.url !== "/estadisticas"),
  ).toHaveLength(0);
});

test("la portada y el pie permanecen visibles si falla la verificación de sesión", async () => {
  montar({
    sesion: crearSesionFalsa({ autenticado: true }),
    obtenerCuentaActual: async () => {
      throw new Error("sesión");
    },
  });
  expect(await screen.findByRole("link", { name: "Ingresar" })).toBeVisible();
  expect(screen.getByRole("heading", { level: 1, name: TITULO })).toBeVisible();
  expect(
    screen.queryByRole("heading", { name: "No pudimos verificar tu sesión" }),
  ).not.toBeInTheDocument();
  expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
  expect(
    within(screen.getByRole("contentinfo")).getByRole("link", { name: "Cómo funciona" }),
  ).toBeVisible();
});

test("el buscador conserva sus resultados públicos mientras se reintenta la cuenta", async () => {
  let recuperarCuenta;
  const obtenerCuentaActual = vi
    .fn()
    .mockRejectedValueOnce({ status: 500 })
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          recuperarCuenta = resolve;
        }),
    );
  const sesion = crearSesionFalsa({ autenticado: true });
  const { router, user } = montar({ ruta: "/proyectos", sesion, obtenerCuentaActual });

  expect(await screen.findByRole("link", { name: PROYECTO.titulo })).toBeVisible();
  expect(screen.queryByRole("link", { name: "Para vos" })).not.toBeInTheDocument();
  const ingreso = screen.getByRole("link", { name: "Ingresar" });
  await user.click(ingreso);
  expect(router.state.location.pathname).toBe("/login");
  expect(sesion.inicios).toHaveLength(0);
  expect(
    await screen.findByRole("heading", { name: "No pudimos verificar tu sesión" }),
  ).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(await screen.findByRole("button", { name: "Reintentando…" })).toBeDisabled();

  await act(async () => router.navigate("/proyectos"));
  expect(await screen.findByRole("link", { name: PROYECTO.titulo })).toBeVisible();
  expect(screen.queryByRole("link", { name: "Para vos" })).not.toBeInTheDocument();
  await act(async () => recuperarCuenta(COLECTIVO));
  expect(await screen.findByRole("button", { name: "Mi cuenta" })).toBeVisible();
});

test("el panel privado espera una cuenta verificada en la misma ruta", async () => {
  const obtenerCuentaActual = vi
    .fn()
    .mockRejectedValueOnce({ status: 500 })
    .mockResolvedValue(COLECTIVO);
  const { router, user } = montar({
    ruta: "/colectivo/resumen",
    sesion: crearSesionFalsa({ autenticado: true }),
    obtenerCuentaActual,
  });

  expect(
    await screen.findByRole("heading", { name: "No pudimos verificar tu sesión" }),
  ).toBeVisible();
  expect(router.state.location.pathname).toBe("/colectivo/resumen");
  expect(
    screen.queryByRole("heading", { name: "Resumen del colectivo" }),
  ).not.toBeInTheDocument();
  expect(
    transporte.mock.calls.filter(([config]) => config.url !== "/estadisticas"),
  ).toHaveLength(0);

  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(
    await screen.findByRole("heading", { name: "Resumen del colectivo" }),
  ).toBeVisible();
  expect(router.state.location.pathname).toBe("/colectivo/resumen");
});
