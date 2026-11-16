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
  permisos: ["REVISION_VER", "REVISION_RESOLVER"],
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

function revision(numero, cambios = {}) {
  return {
    id: `r${numero}`,
    proyecto: {
      id: `p${numero}`,
      titulo: `Proyecto ${numero}`,
      colectivo: { id: `c${numero}`, nombre: `Colectivo ${numero}` },
    },
    motivo: "SIN_ACTUALIZACIONES",
    estado: "PENDIENTE",
    creadaEn: "2026-11-01T12:00:00.000Z",
    resueltaPor: null,
    resueltaEn: null,
    nota: null,
    ...cambios,
  };
}

function respuesta(config, data, status = 200) {
  return { config, data, status, statusText: "", headers: {} };
}

function rechazo(config, status, data = {}) {
  const error = new Error(`Error ${status}`);
  error.isAxiosError = true;
  error.config = config;
  error.response = { config, status, data, headers: {} };
  return Promise.reject(error);
}

beforeEach(() => {
  estado = {
    revisiones: [revision(1), revision(2)],
    falla: false,
    errorAlResolver: null,
  };
  transporte = vi.fn(async (config) => {
    const { url, method } = config;
    if (url === "/administracion/revisiones" && method === "get") {
      if (estado.falla) return rechazo(config, 500);
      const { page, limit, estado: filtro } = config.params;
      const lista = estado.revisiones.filter((r) => r.estado === filtro);
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
    if (url.endsWith("/resolucion") && method === "post") {
      if (estado.errorAlResolver) return rechazo(config, ...estado.errorAlResolver);
      const id = url.split("/")[3];
      const { estado: nuevo, nota } = JSON.parse(config.data);
      estado.revisiones = estado.revisiones.map((r) =>
        r.id === id
          ? {
              ...r,
              estado: nuevo,
              nota: nota ?? null,
              resueltaPor: "u1",
              resueltaEn: "2026-11-15T12:00:00.000Z",
            }
          : r,
      );
      return respuesta(
        config,
        estado.revisiones.find((r) => r.id === id),
      );
    }
    return respuesta(config, []);
  });
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptadorOriginal;
});

function montar({ ruta = "/admin/revisiones", permisos } = {}) {
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

function pedidos(metodo, ruta) {
  return transporte.mock.calls.filter(
    ([config]) => config.method === metodo && config.url.includes(ruta),
  );
}

async function abierta() {
  return screen.findByRole("heading", { level: 1, name: "Revisiones de proyectos" });
}

test("lista las pendientes con proyecto, colectivo, motivo y desde cuándo", async () => {
  montar();
  await abierta();
  const lista = await screen.findByRole("list", { name: "Revisiones pendientes" });
  const filas = within(lista).getAllByRole("listitem");
  expect(filas).toHaveLength(2);
  expect(within(filas[0]).getByRole("link", { name: "Proyecto 1" })).toHaveAttribute(
    "href",
    "/proyectos/p1",
  );
  expect(within(filas[0]).getByText("Colectivo 1")).toBeVisible();
  expect(
    within(filas[0]).getByText("Sin actualizaciones hace más de 30 días"),
  ).toBeVisible();
  expect(within(filas[0]).getByText("Pendiente")).toBeVisible();
  expect(filas[0].querySelector("time")).toHaveAttribute(
    "datetime",
    "2026-11-01T12:00:00.000Z",
  );
  expect(pedidos("get", "/administracion/revisiones")[0][0].params).toMatchObject({
    page: 1,
    estado: "PENDIENTE",
  });
});

test("sin pendientes explica cuándo aparecen", async () => {
  estado.revisiones = [];
  montar();
  expect(await screen.findByText("No hay proyectos para revisar")).toBeVisible();
});

test("marcar como revisada con nota la guarda, la saca de pendientes y avisa", async () => {
  const { user } = montar();
  await abierta();
  await user.click(
    await screen.findByRole("button", { name: "Marcar como revisada Proyecto 1" }),
  );
  const dialogo = await screen.findByRole("dialog");
  await user.type(
    within(dialogo).getByLabelText("Nota (opcional)"),
    "Hablé con el colectivo.",
  );
  expect(within(dialogo).getByText("23 de 1000 caracteres")).toBeVisible();
  await user.click(within(dialogo).getByRole("button", { name: "Marcar como revisada" }));
  expect(await screen.findByText("Marcaste la revisión como revisada.")).toBeVisible();
  expect(
    JSON.parse(pedidos("post", "/administracion/revisiones/r1/resolucion")[0][0].data),
  ).toEqual({
    estado: "REVISADA",
    nota: "Hablé con el colectivo.",
  });
  await waitFor(() => expect(screen.queryByText("Proyecto 1")).not.toBeInTheDocument());
  expect(screen.getByText("Proyecto 2")).toBeVisible();
});

test("descartar sin nota no manda nota", async () => {
  const { user } = montar();
  await abierta();
  await user.click(await screen.findByRole("button", { name: "Descartar Proyecto 2" }));
  const dialogo = await screen.findByRole("dialog");
  await user.click(within(dialogo).getByRole("button", { name: "Descartar" }));
  expect(await screen.findByText("Descartaste la revisión.")).toBeVisible();
  expect(JSON.parse(pedidos("post", "/resolucion")[0][0].data)).toEqual({
    estado: "DESCARTADA",
  });
});

test("una revisión ya resuelta por otra persona se informa y la lista se actualiza", async () => {
  estado.errorAlResolver = [409, { message: "La revision ya fue resuelta" }];
  const { user } = montar();
  await abierta();
  await user.click(
    await screen.findByRole("button", { name: "Marcar como revisada Proyecto 1" }),
  );
  const dialogo = await screen.findByRole("dialog");
  await user.click(within(dialogo).getByRole("button", { name: "Marcar como revisada" }));
  expect(await screen.findByText("Esta revisión ya fue resuelta.")).toBeVisible();
  await waitFor(() =>
    expect(pedidos("get", "/administracion/revisiones").length).toBeGreaterThan(1),
  );
});

test("el filtro de estado queda en la URL y las resueltas son de solo lectura con su nota", async () => {
  estado.revisiones = [
    revision(3, {
      estado: "REVISADA",
      nota: "Ya hablamos.",
      resueltaPor: "u1",
      resueltaEn: "2026-11-10T12:00:00.000Z",
    }),
  ];
  const { router, user } = montar();
  await abierta();
  await user.selectOptions(await screen.findByLabelText("Estado"), "REVISADA");
  await waitFor(() => expect(router.state.location.search).toBe("?estado=REVISADA"));
  const lista = await screen.findByRole("list", { name: "Revisiones revisadas" });
  expect(within(lista).getByText("Ya hablamos.")).toBeVisible();
  expect(within(lista).getByText(/Resuelta por vos/)).toBeVisible();
  expect(within(lista).queryByRole("button")).not.toBeInTheDocument();
});

test("un estado inválido en la URL vuelve a pendientes", async () => {
  montar({ ruta: "/admin/revisiones?estado=XXX" });
  await abierta();
  await screen.findByRole("list", { name: "Revisiones pendientes" });
});

test("un filtro sin resultados lo dice", async () => {
  montar({ ruta: "/admin/revisiones?estado=DESCARTADA" });
  expect(await screen.findByText("No hay revisiones descartadas")).toBeVisible();
});

test("la página queda en la URL, el foco va al conteo y una página fuera de rango se corrige", async () => {
  estado.revisiones = Array.from({ length: 25 }, (_, i) => revision(i + 1));
  const { router, user } = montar();
  await abierta();
  await screen.findByRole("list", { name: "Revisiones pendientes" });
  await user.click(screen.getByRole("button", { name: /Siguiente/ }));
  await waitFor(() => expect(router.state.location.search).toBe("?pagina=2"));
  const conteo = await screen.findByText("Mostrando 21–25 de 25 revisiones");
  await waitFor(() => expect(conteo).toHaveFocus());
});

test("si falla la carga muestra el error con Reintentar", async () => {
  estado.falla = true;
  const { user } = montar();
  expect(await screen.findByText("No pudimos cargar las revisiones")).toBeVisible();
  estado.falla = false;
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(
    await screen.findByRole("list", { name: "Revisiones pendientes" }),
  ).toBeVisible();
});

test("quien solo puede ver no tiene acciones de resolver", async () => {
  montar({ permisos: ["REVISION_VER"] });
  await abierta();
  await screen.findByRole("list", { name: "Revisiones pendientes" });
  expect(
    screen.queryByRole("button", { name: /Marcar como revisada/ }),
  ).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Descartar/ })).not.toBeInTheDocument();
});

test("sin el permiso para ver no se abre la pantalla ni se pide nada", async () => {
  montar({ permisos: ["PROYECTO_DESTACAR"] });
  expect(await screen.findByText("Tu cuenta no puede ver las revisiones.")).toBeVisible();
  await act(async () => {});
  expect(pedidos("get", "/administracion/revisiones")).toHaveLength(0);
});
