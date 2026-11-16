import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { crearSesionFalsa } from "@/Presentation/Dependencies/identidadDependencies.js";
import { Raiz } from "@/Presentation/Components/App/layout/Raiz.jsx";
import { rutas } from "@/Presentation/Routes/RutasDeLaApp.jsx";

const adaptadorOriginal = axiosClient.defaults.adapter;
let transporte;
let estado;

const PERMISOS = ["AUDITORIA_VER", "TERMINOS_GESTIONAR", "BAJA_POR_INFRACCION"];

function cuenta(permisos = PERMISOS) {
  const contexto = {
    id: "ctx-admin",
    tipo: "ADMINISTRACION",
    rol: "ADMIN",
    colectivo: null,
    colaborador: null,
    permisos,
  };
  return {
    id: "sub-1",
    rol: "ADMINISTRACION",
    perfilId: null,
    usuarioId: "u1",
    nombre: "Ana",
    nombrePendiente: false,
    contextoActual: contexto,
    contextos: [contexto],
  };
}

const VERSION_2 = {
  version: 2,
  texto: "# Uso\n\nTratá a todas las personas con **respeto**.",
  publicadoEn: "2026-11-10T15:00:00Z",
};

function respuesta(config, data, status = 200) {
  return { config, data, status, statusText: "", headers: {} };
}

function rechazo(config, status, data = { message: "crudo del back" }) {
  const error = new Error(`Error ${status}`);
  error.isAxiosError = true;
  error.config = config;
  error.response = { config, status, data, headers: {} };
  return Promise.reject(error);
}

beforeEach(() => {
  estado = { vigentes: VERSION_2, fallaAlCargar: false, errorAlPublicar: null };
  transporte = vi.fn(async (config) => {
    const { url, method } = config;
    if (url === "/terminos") {
      if (estado.fallaAlCargar) return rechazo(config, 500);
      if (!estado.vigentes) return rechazo(config, 404);
      return respuesta(config, estado.vigentes);
    }
    if (url === "/administracion/terminos" && method === "put") {
      if (estado.errorAlPublicar) {
        const [status, cambio] = estado.errorAlPublicar;
        if (cambio) estado.vigentes = cambio;
        return rechazo(config, status);
      }
      const { texto } = JSON.parse(config.data);
      estado.vigentes = {
        version: (estado.vigentes?.version ?? 0) + 1,
        texto,
        publicadoEn: "2026-11-16T15:00:00Z",
      };
      return respuesta(config, { ...estado.vigentes, publicadoPor: "u1" }, 201);
    }
    return respuesta(config, { data: [], meta: { page: 1, total: 0, total_pages: 0 } });
  });
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptadorOriginal;
});

function montar({ ruta = "/admin/terminos", permisos } = {}) {
  const sesion = crearSesionFalsa({ autenticado: true });
  const router = createMemoryRouter(
    [
      {
        ...rutas[0],
        element: (
          <Raiz
            usarSesion={sesion.usarSesion}
            CallbackComponent={sesion.CallbackComponent}
            dependencies={{
              obtenerCuentaActual: async () => cuenta(permisos),
              registrarUsuario: async () => ({ creado: false }),
            }}
          />
        ),
      },
    ],
    { initialEntries: [ruta] },
  );
  render(<RouterProvider router={router} />);
  return { router, user: userEvent.setup() };
}

function publicaciones() {
  return transporte.mock.calls.filter(
    ([config]) => config.method === "put" && config.url === "/administracion/terminos",
  );
}

async function abrirEditor(user, boton = "Editar los términos") {
  await user.click(await screen.findByRole("button", { name: boton }));
  return screen.findByLabelText(/^Texto de los términos/);
}

test("muestra la versión vigente con su texto con formato y figura en el menú", async () => {
  montar();
  expect(
    await screen.findByRole("heading", { level: 1, name: "Términos y condiciones" }),
  ).toBeVisible();
  const vigente = await screen.findByRole("region", { name: "Versión vigente" });
  expect(
    within(vigente).getByText("Versión 2, publicada el 10 de noviembre de 2026"),
  ).toBeVisible();
  expect(await within(vigente).findByText("respeto")).toHaveProperty("tagName", "STRONG");
  const menu = within(
    screen.getByRole("navigation", { name: "Secciones de administración" }),
  );
  expect(menu.getByRole("link", { name: "Términos" })).toHaveAttribute(
    "href",
    "/admin/terminos",
  );
  expect(menu.getByRole("link", { name: "Bajas por infracción" })).toHaveAttribute(
    "href",
    "/admin/bajas",
  );
});

test("editar parte del texto vigente y publicar pide confirmación, avisa y muestra la nueva versión", async () => {
  const { user } = montar();
  const campo = await abrirEditor(user);
  expect(campo).toHaveValue(VERSION_2.texto);
  expect(campo).toHaveFocus();
  await user.clear(campo);
  await user.type(campo, "Nuevas reglas de uso.");
  await user.click(screen.getByRole("button", { name: "Publicar versión 3" }));

  const dialogo = screen.getByRole("dialog", {
    name: "¿Publicar la versión 3 de los términos?",
  });
  expect(dialogo).toHaveTextContent(
    "Los proyectos que se creen desde ahora van a tener que aceptarla. Los que ya existen conservan la versión que aceptaron.",
  );
  expect(dialogo).toHaveTextContent("Esta acción no se puede deshacer.");
  expect(within(dialogo).getByRole("button", { name: "Cancelar" })).toHaveFocus();
  await user.click(within(dialogo).getByRole("button", { name: "Publicar versión 3" }));

  expect(await screen.findByRole("status")).toHaveTextContent(
    "Publicaste la versión 3 de los términos.",
  );
  expect(JSON.parse(publicaciones()[0][0].data)).toEqual({
    texto: "Nuevas reglas de uso.",
  });
  const vigente = await screen.findByRole("region", { name: "Versión vigente" });
  expect(await within(vigente).findByText(/^Versión 3/)).toBeVisible();
  expect(within(vigente).getByText("Nuevas reglas de uso.")).toBeVisible();
  expect(screen.queryByLabelText(/^Texto de los términos/)).toBeNull();
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { level: 1, name: "Términos y condiciones" }),
    ).toHaveFocus(),
  );
});

test("cancelar la confirmación no publica y conserva lo escrito", async () => {
  const { user } = montar();
  const campo = await abrirEditor(user);
  await user.type(campo, " Agregado.");
  await user.click(screen.getByRole("button", { name: "Publicar versión 3" }));
  const dialogo = screen.getByRole("dialog");
  await user.click(within(dialogo).getByRole("button", { name: "Cancelar" }));
  expect(publicaciones()).toHaveLength(0);
  expect(screen.getByLabelText(/^Texto de los términos/)).toHaveValue(
    `${VERSION_2.texto} Agregado.`,
  );
});

test("sin cambios o sin texto no abre la confirmación y explica por qué", async () => {
  const { user } = montar();
  const campo = await abrirEditor(user);
  await user.click(screen.getByRole("button", { name: "Publicar versión 3" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(campo).toHaveAccessibleDescription(/El texto es igual a la versión vigente/);

  await user.clear(campo);
  await user.click(screen.getByRole("button", { name: "Publicar versión 3" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(campo).toHaveAccessibleDescription(/Escribí el texto de los términos\./);
  expect(campo).toHaveFocus();
});

test("Descartar cierra el editor sin publicar", async () => {
  const { user } = montar();
  await abrirEditor(user);
  await user.click(screen.getByRole("button", { name: "Descartar cambios" }));
  expect(screen.queryByLabelText(/^Texto de los términos/)).toBeNull();
  expect(screen.getByRole("button", { name: "Editar los términos" })).toHaveFocus();
});

test("sin términos publicados lo dice y permite escribir la primera versión", async () => {
  estado.vigentes = null;
  const { user } = montar();
  expect(
    await screen.findByRole("heading", { name: "Todavía no hay términos publicados" }),
  ).toBeVisible();
  const campo = await abrirEditor(user, "Escribir los términos");
  expect(campo).toHaveValue("");
  await user.type(campo, "Primera versión.");
  await user.click(screen.getByRole("button", { name: "Publicar versión 1" }));
  await user.click(
    within(screen.getByRole("dialog")).getByRole("button", {
      name: "Publicar versión 1",
    }),
  );
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Publicaste la versión 1 de los términos.",
  );
});

test("si falla la carga ofrece reintentar", async () => {
  estado.fallaAlCargar = true;
  const { user } = montar();
  expect(
    await screen.findByRole("heading", { name: "No pudimos cargar los términos" }),
  ).toBeVisible();
  expect(screen.queryByText(/crudo del back/)).toBeNull();
  estado.fallaAlCargar = false;
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(await screen.findByText(/^Versión 2/)).toBeVisible();
});

test("si se publicó otra versión al mismo tiempo, lo explica, recarga y conserva lo escrito", async () => {
  const { user } = montar();
  const campo = await abrirEditor(user);
  await user.type(campo, " Agregado.");
  estado.errorAlPublicar = [
    409,
    { version: 3, texto: "Otra versión.", publicadoEn: "2026-11-16T14:00:00Z" },
  ];
  await user.click(screen.getByRole("button", { name: "Publicar versión 3" }));
  await user.click(
    within(screen.getByRole("dialog")).getByRole("button", {
      name: "Publicar versión 3",
    }),
  );
  expect(await screen.findByText(/^Se publicó otra versión/)).toHaveTextContent(
    "Se publicó otra versión al mismo tiempo. Actualizamos el texto vigente: revisalo antes de publicar.",
  );
  expect(screen.queryByText(/crudo del back/)).toBeNull();
  const vigente = screen.getByRole("region", { name: "Versión vigente" });
  expect(await within(vigente).findByText(/^Versión 3/)).toBeVisible();
  expect(screen.getByLabelText(/^Texto de los términos/)).toHaveValue(
    `${VERSION_2.texto} Agregado.`,
  );
  expect(screen.getByRole("button", { name: "Publicar versión 4" })).toBeVisible();
});

test("sin el permiso no aparece en el menú y la ruta lo explica", async () => {
  montar({ permisos: ["AUDITORIA_VER"] });
  expect(
    await screen.findByText("Tu cuenta no puede gestionar los términos y condiciones."),
  ).toBeVisible();
  const menu = within(
    screen.getByRole("navigation", { name: "Secciones de administración" }),
  );
  expect(menu.queryByRole("link", { name: "Términos" })).toBeNull();
  expect(menu.queryByRole("link", { name: "Bajas por infracción" })).toBeNull();
});
