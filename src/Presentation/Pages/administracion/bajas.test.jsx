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

const CONTEXTO = {
  id: "ctx-admin",
  tipo: "ADMINISTRACION",
  rol: "ADMIN",
  colectivo: null,
  colaborador: null,
  permisos: ["BAJA_POR_INFRACCION"],
};

const CUENTA = {
  id: "sub-1",
  rol: "ADMINISTRACION",
  perfilId: null,
  usuarioId: "u1",
  nombre: "Ana",
  nombrePendiente: false,
  contextoActual: CONTEXTO,
  contextos: [CONTEXTO],
};

function proyecto(numero, cambios = {}) {
  return {
    id: `p${numero}`,
    titulo: `Proyecto ${numero}`,
    estado: "ABIERTO",
    fechaCreacion: "2026-11-01T12:00:00Z",
    colectivo: { id: `c${numero}`, nombre: `Colectivo ${numero}` },
    conflictoDeIntereses: false,
    ...cambios,
  };
}

function coincide(texto, busqueda) {
  return texto.toLowerCase().includes(busqueda.toLowerCase());
}

function colectivo(numero) {
  return {
    id: `c${numero}`,
    nombre: numero === 1 ? "Huerta Comunitaria Sur" : `Colectivo ${numero}`,
    descripcion: "Descripción.",
    tipoColectivo: "ORGANIZACION_SOCIAL",
  };
}

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

function pagina(lista, { page = 1, limit = 12 } = {}) {
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

beforeEach(() => {
  estado = {
    proyectos: [
      proyecto(1),
      proyecto(2, { titulo: "Huerta en la escuela" }),
      proyecto(3, { estado: "FINALIZADO" }),
      proyecto(4, { estado: "BORRADOR" }),
      proyecto(5, { estado: "EN_REVISION" }),
    ],
    colectivos: [colectivo(1), colectivo(2)],
    falla: null,
    errorAlDarDeBaja: null,
  };
  transporte = vi.fn(async (config) => {
    const { url, method, params = {} } = config;
    if (url === "/administracion/proyectos") {
      if (estado.falla === "proyectos") return rechazo(config, 500);
      const lista = estado.proyectos.filter(
        (p) =>
          (!params.estado || p.estado === params.estado) &&
          (!params.q ||
            coincide(p.titulo, params.q) ||
            coincide(p.colectivo.nombre, params.q)),
      );
      return respuesta(config, pagina(lista, params));
    }
    if (url === "/colectivos") {
      if (estado.falla === "colectivos") return rechazo(config, 500);
      const lista = params.q
        ? estado.colectivos.filter((c) =>
            c.nombre.toLowerCase().includes(params.q.toLowerCase()),
          )
        : estado.colectivos;
      return respuesta(config, pagina(lista, params));
    }
    const baja = /^\/administracion\/(proyectos|colectivos)\/([^/]+)\/baja$/.exec(url);
    if (baja && method === "post") {
      if (estado.errorAlDarDeBaja) return rechazo(config, ...estado.errorAlDarDeBaja);
      const [, tipo, id] = baja;
      const { motivo } = JSON.parse(config.data);
      if (tipo === "proyectos") {
        estado.proyectos = estado.proyectos.filter((p) => p.id !== id);
        return respuesta(config, {
          id,
          estado: "DADO_DE_BAJA",
          baja: { motivo, fecha: "2026-11-16T15:00:00Z" },
        });
      }
      estado.colectivos = estado.colectivos.filter((c) => c.id !== id);
      return respuesta(config, { id, fechaBaja: "2026-11-16T15:00:00Z" });
    }
    return respuesta(config, []);
  });
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptadorOriginal;
});

function montar(ruta = "/admin/bajas") {
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
              obtenerCuentaActual: async () => CUENTA,
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

function bajas() {
  return transporte.mock.calls
    .map(([config]) => config)
    .filter((config) => config.method === "post" && config.url.endsWith("/baja"));
}

async function abrir() {
  return screen.findByRole("heading", { level: 1, name: "Bajas por infracción" });
}

function pedidosDeProyectos() {
  return transporte.mock.calls
    .map(([config]) => config)
    .filter((config) => config.url === "/administracion/proyectos");
}

test("/admin lleva a la primera sección permitida y la página lista los proyectos de todos los estados", async () => {
  const { router } = montar("/admin");
  await abrir();
  expect(router.state.location.pathname).toBe("/admin/bajas");
  const tipo = screen.getByRole("group", { name: "Qué vas a dar de baja" });
  expect(within(tipo).getByRole("radio", { name: "Un proyecto" })).toBeChecked();
  const lista = await screen.findByRole("list", { name: "Proyectos" });
  expect(within(lista).getAllByRole("listitem")).toHaveLength(5);
  expect(within(lista).getByText("Colectivo 1")).toBeVisible();
  expect(within(lista).getByText("Borrador")).toBeVisible();
  expect(within(lista).getByText("En revisión")).toBeVisible();
  expect(
    within(lista).getByRole("button", { name: "Dar de baja Proyecto 4" }),
  ).toBeEnabled();
  expect(pedidosDeProyectos()[0].params).toEqual({ page: 1, limit: 12 });
  expect(transporte.mock.calls.some(([c]) => c.url === "/proyectos")).toBe(false);
});

test("filtrar por estado queda en la URL y se manda al back", async () => {
  const { user, router } = montar();
  await abrir();
  await user.selectOptions(await screen.findByLabelText("Estado"), "En revisión");
  await waitFor(() => expect(router.state.location.search).toBe("?estado=EN_REVISION"));
  const lista = await screen.findByRole("list", { name: "Proyectos" });
  await waitFor(() => expect(within(lista).getAllByRole("listitem")).toHaveLength(1));
  expect(within(lista).getByRole("link", { name: "Proyecto 5" })).toBeVisible();
  expect(pedidosDeProyectos().at(-1).params).toEqual({
    page: 1,
    limit: 12,
    estado: "EN_REVISION",
  });
});

test("un estado que no se puede filtrar en la URL se ignora", async () => {
  montar("/admin/bajas?estado=DADO_DE_BAJA");
  await abrir();
  expect(await screen.findByLabelText("Estado")).toHaveValue("");
  await screen.findByRole("list", { name: "Proyectos" });
  expect(pedidosDeProyectos()[0].params).not.toHaveProperty("estado");
});

test("con conflicto de intereses, «Dar de baja» queda deshabilitado y explica por qué", async () => {
  estado.proyectos = [proyecto(1, { conflictoDeIntereses: true }), proyecto(2)];
  montar();
  const boton = await screen.findByRole("button", { name: "Dar de baja Proyecto 1" });
  expect(boton).toBeDisabled();
  expect(boton).toHaveAccessibleDescription(
    "No podés dar de baja un proyecto de un colectivo del que formás parte.",
  );
  expect(screen.getByRole("button", { name: "Dar de baja Proyecto 2" })).toBeEnabled();
});

test("dar de baja un proyecto pide un motivo obligatorio y confirmación permanente", async () => {
  const { user } = montar();
  await abrir();
  await user.click(await screen.findByRole("button", { name: "Dar de baja Proyecto 1" }));
  const dialogo = screen.getByRole("dialog", { name: "¿Dar de baja «Proyecto 1»?" });
  expect(dialogo).toHaveTextContent("Esta acción no se puede deshacer.");
  expect(dialogo).toHaveTextContent(
    "Deja de verse en la plataforma y sus colaboraciones se cierran. El colectivo ve el motivo en Mis proyectos.",
  );
  expect(within(dialogo).getByRole("button", { name: "Cancelar" })).toHaveFocus();

  const confirmar = within(dialogo).getByRole("button", { name: "Dar de baja" });
  await user.click(confirmar);
  const motivo = within(dialogo).getByLabelText(/^Motivo/);
  expect(motivo).toHaveAccessibleDescription(/Contá el motivo de la baja\./);
  expect(motivo).toHaveFocus();
  expect(bajas()).toHaveLength(0);

  await user.type(motivo, "  Publica datos personales.  ");
  await user.click(confirmar);
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Diste de baja «Proyecto 1». El colectivo ve el motivo en Mis proyectos.",
  );
  const [pedido] = bajas();
  expect(pedido.url).toBe("/administracion/proyectos/p1/baja");
  expect(JSON.parse(pedido.data)).toEqual({ motivo: "Publica datos personales." });
  await waitFor(() =>
    expect(screen.queryByRole("button", { name: "Dar de baja Proyecto 1" })).toBeNull(),
  );
  expect(
    screen.getByRole("heading", { level: 1, name: "Bajas por infracción" }),
  ).toHaveFocus();
});

test("cancelar no da de baja y devuelve el foco al botón", async () => {
  const { user } = montar();
  await abrir();
  const boton = await screen.findByRole("button", { name: "Dar de baja Proyecto 3" });
  await user.click(boton);
  await user.click(
    within(screen.getByRole("dialog")).getByRole("button", { name: "Cancelar" }),
  );
  expect(bajas()).toHaveLength(0);
  expect(boton).toHaveFocus();
});

test("buscar por título o colectivo guarda q en la URL, conserva el estado y se puede limpiar", async () => {
  const { user, router } = montar("/admin/bajas?estado=ABIERTO");
  await abrir();
  const campo = await screen.findByLabelText("Buscar por título o colectivo");
  await user.type(campo, "huerta");
  await user.click(screen.getByRole("button", { name: "Buscar" }));
  await waitFor(() =>
    expect(router.state.location.search).toBe("?estado=ABIERTO&q=huerta"),
  );
  const lista = await screen.findByRole("list", { name: "Proyectos" });
  await waitFor(() => expect(within(lista).getAllByRole("listitem")).toHaveLength(1));
  expect(pedidosDeProyectos().at(-1).params).toEqual({
    page: 1,
    limit: 12,
    q: "huerta",
    estado: "ABIERTO",
  });

  await user.clear(campo);
  await user.type(campo, "nada");
  await user.click(screen.getByRole("button", { name: "Buscar" }));
  expect(
    await screen.findByRole("heading", { name: "No encontramos proyectos con «nada»" }),
  ).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Limpiar filtros" }));
  await waitFor(() => expect(router.state.location.search).toBe(""));
});

test("un estado sin proyectos lo dice y ofrece limpiar el filtro", async () => {
  estado.proyectos = [proyecto(1)];
  const { user, router } = montar("/admin/bajas?estado=BORRADOR");
  expect(
    await screen.findByRole("heading", { name: "No hay proyectos en borrador" }),
  ).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Limpiar filtros" }));
  await waitFor(() => expect(router.state.location.search).toBe(""));
});

test("elegir colectivo cambia la URL, busca por nombre y da de baja con su motivo", async () => {
  const { user, router } = montar();
  await abrir();
  await user.click(screen.getByRole("radio", { name: "Un colectivo" }));
  await waitFor(() => expect(router.state.location.search).toBe("?tipo=colectivo"));
  await user.type(await screen.findByLabelText("Buscar por nombre"), "huerta");
  await user.click(screen.getByRole("button", { name: "Buscar" }));
  await waitFor(() =>
    expect(router.state.location.search).toBe("?tipo=colectivo&q=huerta"),
  );
  const lista = await screen.findByRole("list", { name: "Colectivos" });
  await waitFor(() => expect(within(lista).getAllByRole("listitem")).toHaveLength(1));

  await user.click(
    within(lista).getByRole("button", { name: "Dar de baja Huerta Comunitaria Sur" }),
  );
  const dialogo = screen.getByRole("dialog", {
    name: "¿Dar de baja «Huerta Comunitaria Sur»?",
  });
  expect(dialogo).toHaveTextContent(
    "Sus proyectos abiertos se finalizan, se cancelan sus solicitudes de ingreso y sus miembros pierden el acceso al colectivo.",
  );
  await user.type(
    within(dialogo).getByLabelText(/^Motivo/),
    "Organización en infracción.",
  );
  await user.click(within(dialogo).getByRole("button", { name: "Dar de baja" }));
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Diste de baja «Huerta Comunitaria Sur».",
  );
  expect(bajas()[0].url).toBe("/administracion/colectivos/c1/baja");
});

test.each([
  [409, {}, "Este proyecto ya estaba dado de baja. Actualizamos la lista."],
  [
    422,
    { codigo: "CONFLICTO_DE_INTERESES", message: "crudo del back" },
    "No podés dar de baja un proyecto de un colectivo del que formás parte.",
  ],
])("un %s se explica con un mensaje propio", async (status, cuerpo, mensaje) => {
  estado.errorAlDarDeBaja = [status, cuerpo];
  const { user } = montar();
  await abrir();
  await user.click(await screen.findByRole("button", { name: "Dar de baja Proyecto 1" }));
  const dialogo = screen.getByRole("dialog");
  await user.type(within(dialogo).getByLabelText(/^Motivo/), "Spam.");
  await user.click(within(dialogo).getByRole("button", { name: "Dar de baja" }));
  expect(await screen.findByText(mensaje)).toBeVisible();
  expect(screen.queryByText(/crudo del back/)).toBeNull();
});

test("sin proyectos lo dice", async () => {
  estado.proyectos = [];
  montar();
  expect(
    await screen.findByRole("heading", { name: "No hay proyectos para dar de baja" }),
  ).toBeVisible();
});

test("sin colectivos activos lo dice", async () => {
  estado.colectivos = [];
  montar("/admin/bajas?tipo=colectivo");
  expect(
    await screen.findByRole("heading", { name: "No hay colectivos activos" }),
  ).toBeVisible();
});

test("si falla la búsqueda ofrece reintentar", async () => {
  estado.falla = "colectivos";
  const { user } = montar("/admin/bajas?tipo=colectivo");
  expect(
    await screen.findByRole("heading", { name: "No pudimos cargar los colectivos" }),
  ).toBeVisible();
  estado.falla = null;
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(await screen.findByRole("list", { name: "Colectivos" })).toBeVisible();
});

test("la página se lee de la URL y se pagina", async () => {
  estado.proyectos = Array.from({ length: 14 }, (_, indice) => proyecto(indice + 1));
  const { user, router } = montar("/admin/bajas?pagina=2");
  const lista = await screen.findByRole("list", { name: "Proyectos" });
  await waitFor(() => expect(within(lista).getAllByRole("listitem")).toHaveLength(2));
  await user.click(screen.getByRole("button", { name: /Página 1/ }));
  await waitFor(() => expect(router.state.location.search).toBe(""));
});
