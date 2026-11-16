import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { crearSesionFalsa } from "@/Presentation/Dependencies/identidadDependencies.js";
import { Raiz } from "@/Presentation/Components/App/layout/Raiz.jsx";
import { rutas } from "@/Presentation/Routes/RutasDeLaApp.jsx";

const adaptadorOriginal = axiosClient.defaults.adapter;
let transporte;
let estado;

const CONTEXTO_ADMIN = {
  id: "ctx-admin",
  tipo: "ADMINISTRACION",
  rol: "ADMIN",
  colectivo: null,
  colaborador: null,
  permisos: ["AUDITORIA_VER"],
};

const CUENTA = {
  id: "sub-1",
  rol: "ADMINISTRACION",
  perfilId: null,
  usuarioId: "u1",
  nombre: "Ana",
  nombrePendiente: false,
  contextoActual: CONTEXTO_ADMIN,
  contextos: [CONTEXTO_ADMIN],
};

function accion(numero, cambios = {}) {
  return {
    id: `a${numero}`,
    usuarioId: "u1",
    contextoId: "ctx-admin",
    accion: "PROYECTO_DESTACADO",
    entidad: { tipo: "PROYECTO", id: `p${numero}` },
    detalle: { hasta: "2026-12-16T02:59:59.999Z" },
    fecha: "2026-11-14T15:30:00.000Z",
    ...cambios,
  };
}

function respuesta(config, data, status = 200) {
  return { config, data, status, statusText: "", headers: {} };
}

function rechazo(config, status) {
  const error = new Error(`Error ${status}`);
  error.isAxiosError = true;
  error.config = config;
  error.response = { config, status, data: {}, headers: {} };
  return Promise.reject(error);
}

beforeEach(() => {
  estado = {
    acciones: [
      accion(1),
      accion(2, {
        usuarioId: null,
        contextoId: null,
        accion: "ADMIN_OTORGADO",
        entidad: { tipo: "USUARIO", id: "u9" },
        detalle: { crudo: "no mostrar" },
      }),
    ],
    falla: false,
  };
  transporte = vi.fn(async (config) => {
    if (config.url === "/administracion/auditoria") {
      if (estado.falla) return rechazo(config, 500);
      const { page, limit, accion: filtro } = config.params;
      const lista = filtro
        ? estado.acciones.filter((a) => a.accion === filtro)
        : estado.acciones;
      return respuesta(config, {
        data: lista.slice((page - 1) * limit, page * limit),
        meta: {
          page,
          per_page: limit,
          total: lista.length,
          total_pages: Math.ceil(lista.length / limit),
        },
      });
    }
    return respuesta(config, []);
  });
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptadorOriginal;
});

function montar({ ruta = "/admin/auditoria", permisos } = {}) {
  const contexto = permisos ? { ...CONTEXTO_ADMIN, permisos } : CONTEXTO_ADMIN;
  const cuenta = { ...CUENTA, contextoActual: contexto, contextos: [contexto] };
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
              obtenerCuentaActual: async () => cuenta,
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

function pedidos() {
  return transporte.mock.calls.filter(
    ([config]) => config.url === "/administracion/auditoria",
  );
}

async function abierta() {
  return screen.findByRole("heading", { level: 1, name: "Auditoría" });
}

test("muestra una tabla con fecha, quién, acción, sobre qué y detalle en texto", async () => {
  montar();
  await abierta();
  const tabla = await screen.findByRole("table", {
    name: "Acciones administrativas",
  });
  expect(
    within(tabla)
      .getAllByRole("columnheader")
      .map((c) => c.textContent),
  ).toEqual(["Fecha", "Quién", "Acción", "Sobre qué", "Detalle"]);
  const filas = within(tabla).getAllByRole("row").slice(1);
  expect(filas).toHaveLength(2);
  expect(within(filas[0]).getByText("Administración")).toBeVisible();
  expect(within(filas[0]).getByText("Destacó un proyecto")).toBeVisible();
  expect(
    within(filas[0]).getByText("Destacado hasta el 15 de diciembre de 2026"),
  ).toBeVisible();
  expect(within(filas[0]).getByRole("link", { name: "Ver proyecto" })).toHaveAttribute(
    "href",
    "/proyectos/p1",
  );
  expect(filas[0].querySelector("time")).toHaveAttribute(
    "datetime",
    "2026-11-14T15:30:00.000Z",
  );
  expect(within(filas[1]).getByText("Comando del sistema")).toBeVisible();
  expect(within(filas[1]).getByText("Usuaria")).toBeVisible();
  expect(screen.queryByText(/no mostrar/)).not.toBeInTheDocument();
  expect(screen.queryByText(/u9|p1|ctx-admin/)).not.toBeInTheDocument();
});

test("sin nada auditado lo dice", async () => {
  estado.acciones = [];
  montar();
  expect(await screen.findByText("Todavía no hay acciones registradas")).toBeVisible();
});

test("filtrar por acción deja el filtro en la URL y vuelve a la página 1", async () => {
  const { router, user } = montar({ ruta: "/admin/auditoria?pagina=1" });
  await abierta();
  await screen.findByRole("table");
  await user.selectOptions(screen.getByLabelText("Acción"), "ADMIN_OTORGADO");
  await user.click(screen.getByRole("button", { name: "Aplicar filtros" }));
  await waitFor(() =>
    expect(router.state.location.search).toBe("?accion=ADMIN_OTORGADO"),
  );
  await waitFor(() =>
    expect(pedidos().some(([c]) => c.params.accion === "ADMIN_OTORGADO")).toBe(true),
  );
  const filas = within(await screen.findByRole("table"))
    .getAllByRole("row")
    .slice(1);
  expect(filas).toHaveLength(1);
});

test("las fechas se mandan como rango del día en Argentina", async () => {
  const { user } = montar();
  await abierta();
  await screen.findByRole("table");
  await user.type(screen.getByLabelText("Desde"), "2026-11-01");
  await user.type(screen.getByLabelText("Hasta"), "2026-11-10");
  await user.click(screen.getByRole("button", { name: "Aplicar filtros" }));
  await waitFor(() =>
    expect(
      pedidos().some(
        ([c]) =>
          c.params.desde === "2026-11-01T00:00:00-03:00" &&
          c.params.hasta === "2026-11-10T23:59:59-03:00",
      ),
    ).toBe(true),
  );
});

test("un «desde» posterior a «hasta» se rechaza en el campo, sin pedir nada", async () => {
  const { user } = montar();
  await abierta();
  await screen.findByRole("table");
  const antes = pedidos().length;
  await user.type(screen.getByLabelText("Desde"), "2026-11-10");
  await user.type(screen.getByLabelText("Hasta"), "2026-11-01");
  await user.click(screen.getByRole("button", { name: "Aplicar filtros" }));
  const campo = screen.getByLabelText("Hasta");
  expect(
    await screen.findByText("La fecha «hasta» no puede ser anterior a «desde»."),
  ).toBeVisible();
  expect(campo).toHaveAccessibleDescription(/no puede ser anterior/);
  expect(pedidos()).toHaveLength(antes);
});

test("un filtro sin coincidencias ofrece limpiar los filtros", async () => {
  estado.acciones = [accion(1)];
  const { router, user } = montar({ ruta: "/admin/auditoria?accion=REVISION_RESUELTA" });
  expect(await screen.findByText("No hay acciones con esos filtros")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Limpiar filtros" }));
  await waitFor(() => expect(router.state.location.search).toBe(""));
  expect(await screen.findByRole("table")).toBeVisible();
});

test("la página queda en la URL y el foco va al conteo", async () => {
  estado.acciones = Array.from({ length: 25 }, (_, i) => accion(i + 1));
  const { router, user } = montar();
  await abierta();
  await screen.findByRole("table");
  await user.click(screen.getByRole("button", { name: /Siguiente/ }));
  await waitFor(() => expect(router.state.location.search).toBe("?pagina=2"));
  const conteo = await screen.findByText("Mostrando 21–25 de 25 acciones");
  await waitFor(() => expect(conteo).toHaveFocus());
});

test("si falla la carga muestra el error con Reintentar", async () => {
  estado.falla = true;
  const { user } = montar();
  expect(await screen.findByText("No pudimos cargar la auditoría")).toBeVisible();
  estado.falla = false;
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(await screen.findByRole("table")).toBeVisible();
});

test("sin el permiso para ver la auditoría no se abre la pantalla ni se pide nada", async () => {
  montar({ permisos: ["REVISION_VER"] });
  expect(await screen.findByText("Tu cuenta no puede ver la auditoría.")).toBeVisible();
  await act(async () => {});
  expect(pedidos()).toHaveLength(0);
});

test("las publicaciones aprobadas y con cambios pedidos se leen en texto y se pueden filtrar", async () => {
  estado.acciones = [
    accion(5, { accion: "PROYECTO_PUBLICADO", detalle: { revisionId: "r5" } }),
    accion(6, { accion: "PUBLICACION_RECHAZADA", detalle: { revisionId: "r6" } }),
  ];
  montar();
  const tabla = await screen.findByRole("table", { name: "Acciones administrativas" });
  const [aprobada, rechazada] = within(tabla).getAllByRole("row").slice(1);
  expect(
    within(aprobada).getByText("Aprobó la publicación de un proyecto"),
  ).toBeVisible();
  expect(within(aprobada).getByRole("link", { name: "Ver proyecto" })).toHaveAttribute(
    "href",
    "/proyectos/p5",
  );
  expect(
    within(rechazada).getByText("Pidió cambios en la publicación de un proyecto"),
  ).toBeVisible();
  expect(screen.queryByText(/r5|r6|PUBLICACION/)).not.toBeInTheDocument();
  const filtro = screen.getByLabelText("Acción");
  expect(
    within(filtro).getByRole("option", { name: "Aprobó la publicación de un proyecto" }),
  ).toBeInTheDocument();
  expect(
    within(filtro).getByRole("option", {
      name: "Pidió cambios en la publicación de un proyecto",
    }),
  ).toBeInTheDocument();
});
