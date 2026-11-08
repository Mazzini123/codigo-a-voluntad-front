import { act, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { Navigate, Route } from "react-router-dom";
import { AppLayout } from "../Components/App/AppLayout.jsx";
import { axiosClient } from "../../Infrastructure/Http/axiosClient.js";
import { ProyectosPage } from "./ProyectosPage.jsx";
import { montarRutas } from "../../test/montarRutas.jsx";

function proyecto(numero, cambios = {}) {
  return {
    id: `p${numero}`,
    titulo: `Proyecto ${numero}`,
    descripcion: "Descripción.",
    estado: "ABIERTO",
    colaboraciones: [],
    perfiles: [
      {
        id: `pe${numero}`,
        busquedaAbierta: true,
        fechaCierreBusqueda: null,
        limiteColaboraciones: null,
        compromiso: { cantidadHoras: 5, periodo: "HS_MENSUALES" },
        modalidadColaboracion: "GRATUITA",
        habilidadesRequeridas: [
          { codigo: "react", titulo: "React" },
          { codigo: "python", titulo: "Python" },
        ],
      },
    ],
    ...cambios,
  };
}

const TODOS = Array.from({ length: 30 }, (_, indice) => proyecto(indice + 1));
const adaptadorOriginal = axiosClient.defaults.adapter;
let transporte;
let potenciales;

function respuesta(config, data, status = 200) {
  return { config, data, status, statusText: "", headers: {} };
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

beforeEach(() => {
  potenciales = TODOS.slice(0, 3);
  transporte = vi.fn(async (config) => {
    if (config.url === "/proyectos") {
      const lista = config.params.etiqueta
        ? TODOS.filter(
            (p) => config.params.etiqueta === "salud" && Number(p.id.slice(1)) <= 2,
          )
        : TODOS;
      return respuesta(config, pagina(lista, config.params));
    }
    if (config.url === "/colaboradores/co1/proyectos-potenciales")
      return respuesta(config, pagina(potenciales, config.params));
    if (config.url === "/colaboradores/co1")
      return respuesta(config, {
        id: "co1",
        habilidades: [{ codigo: "react", titulo: "React" }],
      });
    throw new axios.AxiosError(
      "Error",
      "ERR_BAD_RESPONSE",
      config,
      null,
      respuesta(config, {}, 500),
    );
  });
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptadorOriginal;
});

function montar(ruta, cuenta = null) {
  return montarRutas(
    <Route element={<AppLayout />}>
      <Route path="/" element={<Navigate to="/proyectos" replace />} />
      <Route path="/proyectos" element={<ProyectosPage />} />
      <Route path="/proyectos/:id" element={<h1>Detalle</h1>} />
    </Route>,
    { ruta, cuenta, dependencies: { obtenerCuentaActual: async () => cuenta } },
  );
}

function pedidosA(url) {
  return transporte.mock.calls.map(([c]) => c).filter((c) => c.url === url);
}

const COLABORADORA = { id: "cuenta-2", rol: "COLABORADORA", perfilId: "co1" };

test.each([false, true])(
  "la grilla anterior queda inerte durante paginación y reintento: %s",
  async (conError) => {
    const original = transporte.getMockImplementation();
    let resolver;
    transporte.mockImplementation((config) =>
      config.url === "/proyectos" && config.params.page === 2
        ? new Promise((resolve, reject) => {
            resolver = () =>
              conError
                ? reject(
                    new axios.AxiosError(
                      "Error",
                      "ERR_BAD_REQUEST",
                      config,
                      null,
                      respuesta(config, {}, 500),
                    ),
                  )
                : resolve(respuesta(config, pagina(TODOS, config.params)));
          })
        : original(config),
    );
    const { user } = montar("/proyectos");
    const anterior = await screen.findByRole("link", { name: "Proyecto 1", exact: true });
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    await screen.findByText("Cargando página 2…");
    expect(anterior.closest("ul")).toHaveAttribute("inert");
    expect(anterior.closest("ul")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("link", { name: "Proyecto 1", exact: true })).toBeNull();
    expect(screen.getByRole("searchbox")).toBeEnabled();
    await act(async () => resolver());
    if (conError) {
      await screen.findByText("No pudimos cargar los proyectos");
      await user.click(screen.getByRole("button", { name: "Reintentar" }));
      await waitFor(() =>
        expect(
          screen.queryByRole("link", { name: "Proyecto 1", exact: true }),
        ).toBeNull(),
      );
      transporte.mockImplementation(original);
      conError = false;
      await act(async () => resolver());
    }
    const actual = await screen.findByRole("link", { name: "Proyecto 13", exact: true });
    expect(actual.closest("ul")).not.toHaveAttribute("inert");
  },
);

test("los temas son únicos y elegir con teclado sincroniza campo, URL, vista y página", async () => {
  potenciales = [
    proyecto(1, { etiquetas: ["salud", "logistica"] }),
    proyecto(2, { etiquetas: ["salud"] }),
  ];
  const { user, router } = montar("/proyectos?pagina=2", COLABORADORA);
  const tema = await screen.findByRole("button", { name: "salud", exact: true });
  expect(screen.getAllByRole("button", { name: "salud", exact: true })).toHaveLength(1);
  tema.focus();
  await user.keyboard("{Enter}");
  await screen.findByText("2 proyectos encontrados");
  expect(screen.getByRole("searchbox")).toHaveValue("salud");
  const params = new URLSearchParams(router.state.location.search);
  expect(params.get("etiqueta")).toBe("salud");
  expect(params.get("vista")).toBe("todos");
  expect(params.has("pagina")).toBe(false);
});

test("la entrada lista los proyectos con conteo y paginación en la URL", async () => {
  const { user, router } = montar("/");
  expect(
    await screen.findByRole("heading", {
      level: 1,
      name: "Proyectos de colectivos sociales",
    }),
  ).toBeInTheDocument();
  expect(await screen.findByText("Mostrando 1–12 de 30 proyectos")).toBeInTheDocument();
  expect(pedidosA("/proyectos")[0].params).toEqual({ page: 1, limit: 12 });
  expect(pedidosA("/colaboradores/co1")).toHaveLength(0);

  await user.click(screen.getByRole("button", { name: "Siguiente" }));
  expect(await screen.findByText("Mostrando 13–24 de 30 proyectos")).toBeInTheDocument();
  expect(router.state.location.search).toBe("?pagina=2");
  expect(screen.getByText("Mostrando 13–24 de 30 proyectos")).toHaveFocus();
});

test("busca por etiqueta al dejar de escribir, vuelve a la página 1 y lo deja en la URL", async () => {
  const { user, router } = montar("/proyectos?pagina=2");
  await screen.findByText("Mostrando 13–24 de 30 proyectos");
  await user.type(
    screen.getByRole("searchbox", { name: "Buscar por etiqueta" }),
    "salud",
  );
  expect(await screen.findByText("2 proyectos encontrados")).toBeInTheDocument();
  expect(router.state.location.search).toBe("?etiqueta=salud");
  expect(screen.getByRole("searchbox")).toHaveValue("salud");
  expect(
    screen.queryByRole("region", { name: "Temas de los resultados" }),
  ).not.toBeInTheDocument();
  expect(pedidosA("/proyectos").at(-1).params).toEqual({
    page: 1,
    limit: 12,
    etiqueta: "salud",
  });
});

function anuncios() {
  return screen
    .getAllByRole("status")
    .map((region) => region.textContent)
    .filter(Boolean);
}

test("anuncia el conteo en una región de estado cuando llega la respuesta, no en cada tecla", async () => {
  const { user } = montar("/proyectos");
  await screen.findByText("Mostrando 1–12 de 30 proyectos");
  expect(anuncios()).toEqual(["30 proyectos, página 1 de 3"]);

  await user.type(
    screen.getByRole("searchbox", { name: "Buscar por etiqueta" }),
    "salud",
  );
  expect(anuncios()).toEqual(["30 proyectos, página 1 de 3"]);
  await waitFor(() =>
    expect(anuncios()).toEqual(["2 proyectos con la etiqueta «salud»"]),
  );
});

test("anuncia cuando una etiqueta no tiene resultados", async () => {
  const { user } = montar("/proyectos");
  await screen.findByText("Mostrando 1–12 de 30 proyectos");
  await user.type(
    screen.getByRole("searchbox", { name: "Buscar por etiqueta" }),
    "cobol",
  );
  await waitFor(() =>
    expect(anuncios()).toEqual(["No encontramos proyectos con la etiqueta «cobol»"]),
  );
});

test("sin resultados lo explica y Limpiar búsqueda vuelve al listado", async () => {
  const { user, router } = montar("/proyectos?etiqueta=cobol");
  expect(
    await screen.findByRole("heading", {
      name: "No encontramos proyectos con la etiqueta «cobol»",
    }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));
  expect(await screen.findByText("Mostrando 1–12 de 30 proyectos")).toBeInTheDocument();
  expect(router.state.location.search).toBe("");
});

test("una página que ya no existe lleva a la última", async () => {
  const { router } = montar("/proyectos?pagina=9");
  expect(await screen.findByText("Mostrando 25–30 de 30 proyectos")).toBeInTheDocument();
  expect(router.state.location.search).toBe("?pagina=3");
});

test("si falla ofrece Reintentar sin perder la búsqueda", async () => {
  transporte.mockImplementationOnce(async (config) => {
    throw new axios.AxiosError(
      "Error",
      "ERR_BAD_RESPONSE",
      config,
      null,
      respuesta(config, {}, 500),
    );
  });
  const { user } = montar("/proyectos?etiqueta=salud");
  expect(await screen.findByText("No pudimos cargar los proyectos")).toBeInTheDocument();
  expect(screen.getByRole("searchbox")).toHaveValue("salud");
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(await screen.findByText("2 proyectos encontrados")).toBeInTheDocument();
});

describe("colaboradora", () => {
  test("arranca en Para vos, con el encaje marcado", async () => {
    montar("/proyectos", COLABORADORA);
    expect(await screen.findByText("3 proyectos encontrados")).toBeInTheDocument();
    expect(pedidosA("/proyectos")).toHaveLength(0);
    expect(screen.getByRole("link", { name: "Para vos" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      await screen.findAllByText("Tenés 1 de 2 habilidades requeridas"),
    ).toHaveLength(3);
  });

  test("Todos los proyectos cambia de vista y la URL lo recuerda", async () => {
    const { user, router } = montar("/proyectos", COLABORADORA);
    await screen.findByText("3 proyectos encontrados");
    await user.click(screen.getByRole("link", { name: "Todos los proyectos" }));
    expect(await screen.findByText("Mostrando 1–12 de 30 proyectos")).toBeInTheDocument();
    expect(router.state.location.search).toBe("?vista=todos");
  });

  test("buscar una etiqueta pasa a Todos los proyectos", async () => {
    const { user, router } = montar("/proyectos", COLABORADORA);
    await screen.findByText("3 proyectos encontrados");
    await user.type(screen.getByRole("searchbox"), "salud{Enter}");
    await waitFor(() =>
      expect(router.state.location.search).toBe("?etiqueta=salud&vista=todos"),
    );
    expect(screen.getByRole("link", { name: "Todos los proyectos" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("sin proyectos que encajen ofrece ver todos o sumar habilidades", async () => {
    potenciales = [];
    montar("/proyectos", COLABORADORA);
    expect(
      await screen.findByRole("heading", {
        name: "Todavía no hay proyectos que encajen con tus habilidades",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "sumar habilidades" })).toHaveAttribute(
      "href",
      "/colaboradora/perfil",
    );
  });
});
