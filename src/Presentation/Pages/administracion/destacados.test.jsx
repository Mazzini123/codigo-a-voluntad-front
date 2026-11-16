import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { fechaDeFinPorDefecto } from "@/Application/Domain/Reglas/destacados.js";
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
  permisos: ["PROYECTO_DESTACAR", "REVISION_VER", "REVISION_RESOLVER", "AUDITORIA_VER"],
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

function proyecto(numero, cambios = {}) {
  return {
    id: `p${numero}`,
    titulo: `Proyecto ${numero}`,
    descripcion: "Descripción.",
    estado: "ABIERTO",
    colectivo: { id: `c${numero}`, nombre: `Colectivo ${numero}` },
    perfiles: [],
    colaboraciones: [],
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

function pagina(lista, { page, limit }) {
  return {
    data: lista.slice((page - 1) * limit, page * limit),
    meta: {
      page,
      per_page: limit,
      total: lista.length,
      total_pages: Math.ceil(lista.length / limit),
    },
  };
}

function abiertos() {
  const vigentes = estado.vigentes.map((p) => ({ ...p, destacado: true }));
  const ids = new Set(vigentes.map(({ id }) => id));
  return [...vigentes, ...estado.otros.filter(({ id }) => !ids.has(id))];
}

beforeEach(() => {
  estado = {
    vigentes: [proyecto(1), proyecto(2)],
    otros: [proyecto(3), proyecto(4)],
    falla: null,
  };
  transporte = vi.fn(async (config) => {
    const { url, method } = config;
    if (url === "/proyectos/destacados") {
      if (estado.falla === "vigentes") return rechazo(config, 500);
      return respuesta(
        config,
        estado.vigentes.map((p) => ({ ...p, destacado: true })),
      );
    }
    if (url === "/proyectos") {
      if (estado.falla === "candidatos") return rechazo(config, 500);
      const { etiqueta } = config.params;
      const lista = etiqueta
        ? abiertos().filter((p) => p.etiquetas?.includes(etiqueta))
        : abiertos();
      return respuesta(config, pagina(lista, config.params));
    }
    if (url.startsWith("/administracion/proyectos/") && url.endsWith("/destacado")) {
      const id = url.split("/")[3];
      if (estado.errorAlOperar) return rechazo(config, ...estado.errorAlOperar);
      if (method === "put") {
        const nuevo = estado.otros.find((p) => p.id === id) ?? proyecto(9);
        if (!estado.vigentes.some((p) => p.id === id)) estado.vigentes.push(nuevo);
        return respuesta(config, {
          id,
          destacado: { desde: "2026-11-15T12:00:00Z", hasta: "2026-12-16T02:59:59.999Z" },
        });
      }
      estado.vigentes = estado.vigentes.filter((p) => p.id !== id);
      return respuesta(config, undefined, 204);
    }
    return respuesta(config, []);
  });
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptadorOriginal;
});

function montar({ ruta = "/admin/destacados", cuenta = CUENTA } = {}) {
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
  return screen.findByRole("heading", { level: 1, name: "Proyectos destacados" });
}

test("lista los destacados vigentes con su cupo y los proyectos abiertos para elegir", async () => {
  montar();
  await abierta();
  const vigentes = await screen.findByRole("list", {
    name: "Proyectos destacados vigentes",
  });
  expect(within(vigentes).getAllByRole("listitem")).toHaveLength(2);
  expect(screen.getByText("2 lugares usados de 6")).toBeVisible();
  const abiertos = await screen.findByRole("list", { name: "Proyectos abiertos" });
  expect(within(abiertos).getAllByRole("listitem")).toHaveLength(4);
  expect(within(abiertos).getAllByText("Destacado")).toHaveLength(2);
  expect(
    within(abiertos).getByRole("button", { name: "Destacar Proyecto 3" }),
  ).toBeEnabled();
  const pedidoDeProyectos = pedidos("get", "/proyectos").find(
    ([config]) => config.url === "/proyectos",
  );
  expect(pedidoDeProyectos[0].params).toMatchObject({
    page: 1,
    limit: 12,
    estado: "ABIERTO",
  });
});

test("sin destacados vigentes lo explica y ofrece elegir", async () => {
  estado.vigentes = [];
  montar();
  expect(await screen.findByText("Todavía no hay proyectos destacados")).toBeVisible();
  expect(screen.getByText("Ningún lugar usado de 6")).toBeVisible();
});

test("destacar abre un diálogo con la fecha a 30 días, envía la fecha y actualiza ambas listas", async () => {
  const { user } = montar();
  await abierta();
  await user.click(await screen.findByRole("button", { name: "Destacar Proyecto 3" }));
  const dialogo = await screen.findByRole("dialog", { name: "Destacar «Proyecto 3»" });
  const campo = within(dialogo).getByLabelText(/Destacado hasta/);
  expect(campo).toHaveValue(fechaDeFinPorDefecto());
  await user.click(within(dialogo).getByRole("button", { name: "Destacar" }));

  await waitFor(() =>
    expect(pedidos("put", "/administracion/proyectos/p3/destacado")).toHaveLength(1),
  );
  expect(pedidos("put", "/destacado")[0][0].data).toBe(
    JSON.stringify({ hasta: fechaDeFinPorDefecto() }),
  );
  expect(
    await screen.findByText(/Destacaste «Proyecto 3» hasta el 15 de diciembre de 2026/),
  ).toBeVisible();
  const vigentes = screen.getByRole("list", { name: "Proyectos destacados vigentes" });
  expect(await within(vigentes).findByText("Proyecto 3")).toBeVisible();
  expect(screen.getByText("3 lugares usados de 6")).toBeVisible();
});

test("una fecha anterior a mañana se rechaza en el campo, sin pedir nada", async () => {
  const { user } = montar();
  await abierta();
  await user.click(await screen.findByRole("button", { name: "Destacar Proyecto 3" }));
  const dialogo = await screen.findByRole("dialog", { name: "Destacar «Proyecto 3»" });
  const campo = within(dialogo).getByLabelText(/Destacado hasta/);
  await user.clear(campo);
  await user.type(campo, "2020-01-01");
  await user.click(within(dialogo).getByRole("button", { name: "Destacar" }));
  expect(
    await within(dialogo).findByText("Elegí una fecha posterior a hoy."),
  ).toBeVisible();
  expect(campo).toHaveAccessibleDescription(/Elegí una fecha posterior a hoy/);
  expect(pedidos("put", "/destacado")).toHaveLength(0);
});

test("cambiar la fecha de un destacado no duplica ni gasta otro lugar", async () => {
  const { user } = montar();
  await abierta();
  const vigentes = await screen.findByRole("list", {
    name: "Proyectos destacados vigentes",
  });
  await user.click(
    within(vigentes).getByRole("button", { name: "Cambiar fecha de Proyecto 1" }),
  );
  const dialogo = await screen.findByRole("dialog", {
    name: "Cambiar la fecha de «Proyecto 1»",
  });
  await user.click(within(dialogo).getByRole("button", { name: "Guardar fecha" }));
  expect(await screen.findByText(/Cambiaste la fecha de «Proyecto 1»/)).toBeVisible();
  expect(screen.getByText("2 lugares usados de 6")).toBeVisible();
});

test("cancelar devuelve el foco al botón que abrió el diálogo", async () => {
  const { user } = montar();
  await abierta();
  const vigentes = await screen.findByRole("list", {
    name: "Proyectos destacados vigentes",
  });
  const boton = within(vigentes).getByRole("button", {
    name: "Cambiar fecha de Proyecto 1",
  });
  await user.click(boton);
  const dialogo = await screen.findByRole("dialog", {
    name: "Cambiar la fecha de «Proyecto 1»",
  });
  await user.click(within(dialogo).getByRole("button", { name: "Cancelar" }));
  await waitFor(() => expect(boton).toHaveFocus());
  expect(pedidos("put", "/destacado")).toHaveLength(0);
});

test("quitar pide confirmación, libera el lugar y avisa", async () => {
  const { user } = montar();
  await abierta();
  const vigentes = await screen.findByRole("list", {
    name: "Proyectos destacados vigentes",
  });
  await user.click(
    within(vigentes).getByRole("button", { name: "Quitar Proyecto 1 de los destacados" }),
  );
  const dialogo = await screen.findByRole("dialog", {
    name: "¿Quitar «Proyecto 1» de los destacados?",
  });
  expect(pedidos("delete", "/destacado")).toHaveLength(0);
  await user.click(within(dialogo).getByRole("button", { name: "Quitar destacado" }));
  expect(
    await screen.findByText("Quitaste «Proyecto 1» de los destacados."),
  ).toBeVisible();
  expect(pedidos("delete", "/administracion/proyectos/p1/destacado")).toHaveLength(1);
  expect(await screen.findByText("1 lugar usado de 6")).toBeVisible();
});

test("con el cupo completo los demás proyectos no se pueden destacar y se explica por qué", async () => {
  estado.vigentes = [1, 2, 3, 4, 5, 6].map((n) => proyecto(n));
  estado.otros = [proyecto(7)];
  montar();
  await abierta();
  const boton = await screen.findByRole("button", { name: "Destacar Proyecto 7" });
  expect(boton).toBeDisabled();
  expect(boton).toHaveAccessibleDescription(
    "Ya hay 6 proyectos destacados. Quitá uno para sumar otro.",
  );
  expect(screen.getByText("6 lugares usados de 6")).toBeVisible();
});

test.each([
  [
    [409, { codigo: "CONFLICTO" }],
    "Ya hay 6 proyectos destacados. Quitá uno para sumar otro.",
  ],
  [
    [422, { codigo: "CONFLICTO_DE_INTERESES" }],
    "No podés destacar un proyecto de un colectivo del que sos parte.",
  ],
  [[422, {}], "Solo se pueden destacar proyectos abiertos de colectivos activos."],
  [[403, { codigo: "PERMISO_INSUFICIENTE" }], "No tenés permiso para hacer esto."],
])("si el back responde %j la persona lee un mensaje claro", async (error, mensaje) => {
  estado.errorAlOperar = error;
  const { user } = montar();
  await abierta();
  await user.click(await screen.findByRole("button", { name: "Destacar Proyecto 3" }));
  const dialogo = await screen.findByRole("dialog", { name: "Destacar «Proyecto 3»" });
  await user.click(within(dialogo).getByRole("button", { name: "Destacar" }));
  expect(await screen.findByText(mensaje)).toBeVisible();
});

test("la etiqueta y la página quedan en la URL y se pide con ellas", async () => {
  estado.otros = [proyecto(3, { etiquetas: ["salud"] }), proyecto(4)];
  const { router, user } = montar();
  await abierta();
  await screen.findByRole("list", { name: "Proyectos abiertos" });
  await user.type(
    screen.getByRole("searchbox", { name: "Buscar por etiqueta" }),
    "salud",
  );
  await user.click(screen.getByRole("button", { name: "Buscar" }));
  await waitFor(() => expect(router.state.location.search).toBe("?etiqueta=salud"));
  await waitFor(() =>
    expect(
      pedidos("get", "/proyectos").some(
        ([config]) => config.params?.etiqueta === "salud",
      ),
    ).toBe(true),
  );
  const lista = await screen.findByRole("list", { name: "Proyectos abiertos" });
  expect(within(lista).getAllByRole("listitem")).toHaveLength(1);
});

test("una etiqueta sin resultados ofrece limpiar la búsqueda", async () => {
  const { user } = montar({ ruta: "/admin/destacados?etiqueta=nada" });
  expect(
    await screen.findByText("No encontramos proyectos abiertos con la etiqueta «nada»"),
  ).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));
  expect(await screen.findByRole("list", { name: "Proyectos abiertos" })).toBeVisible();
});

test("si falla una lista muestra su error con Reintentar y la otra sigue", async () => {
  estado.falla = "vigentes";
  const { user } = montar();
  expect(await screen.findByText("No pudimos cargar los destacados")).toBeVisible();
  expect(await screen.findByRole("list", { name: "Proyectos abiertos" })).toBeVisible();
  estado.falla = null;
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(
    await screen.findByRole("list", { name: "Proyectos destacados vigentes" }),
  ).toBeVisible();
});

test("sin el permiso para destacar no se abre la pantalla ni se pide nada", async () => {
  const sinPermiso = { ...CONTEXTO_ADMIN, permisos: ["REVISION_VER"] };
  montar({ cuenta: { ...CUENTA, contextoActual: sinPermiso, contextos: [sinPermiso] } });
  expect(
    await screen.findByText("Tu cuenta no puede administrar los destacados."),
  ).toBeVisible();
  await act(async () => {});
  expect(pedidos("get", "/proyectos")).toHaveLength(0);
  expect(pedidos("get", "/proyectos/destacados")).toHaveLength(0);
});
