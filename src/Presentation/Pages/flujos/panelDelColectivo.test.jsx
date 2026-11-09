import { screen, within } from "@testing-library/react";
import axios from "axios";
import { Route } from "react-router-dom";
import { MarcoDeLaApp } from "@/Presentation/Components/App/layout/MarcoDeLaApp.jsx";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { RutaProtegida } from "@/Presentation/Routes/RutaProtegida.jsx";
import { montarRutas } from "@/test/montarRutas.jsx";
import { MarcoDelPanelDelColectivo } from "@/Presentation/Components/Colectivo/MarcoDelPanelDelColectivo.jsx";
import { MisProyectosPage } from "@/Presentation/Pages/colectivo/MisProyectosPage.jsx";
import { PostulacionesPendientesPage } from "@/Presentation/Pages/colectivo/PostulacionesPendientesPage.jsx";
import { ResumenColectivoPage } from "@/Presentation/Pages/colectivo/ResumenColectivoPage.jsx";
import { SinPermisoPage } from "@/Presentation/Pages/sistema/SinPermisoPage.jsx";

const habilidad = (codigo, titulo) => ({ codigo, titulo });

function unPerfil(id, cambios = {}) {
  return {
    id,
    descripcion: `Perfil ${id}`,
    busquedaAbierta: true,
    fechaCierreBusqueda: null,
    limiteColaboraciones: null,
    modoAceptacion: "REVISION_MANUAL",
    compromiso: { cantidadHoras: 5, periodo: "HS_SEMANALES" },
    modalidadColaboracion: "GRATUITA",
    habilidadesRequeridas: [habilidad("react", "React")],
    habilidadesOpcionales: [],
    ...cambios,
  };
}

const colaboracion = (id, estado, cambios = {}) => ({
  id,
  perfil: "pe1",
  estado,
  esPublica: true,
  colaborador: { nombreFantasia: `Persona ${id}` },
  fecha: "2026-11-01T12:00:00.000Z",
  ...cambios,
});

function proyectos() {
  return [
    {
      id: "p1",
      titulo: "Sistema de turnos del comedor",
      descripcion: "Una app para ordenar las entregas.",
      estado: "ABIERTO",
      etiquetas: [],
      perfiles: [unPerfil("pe1"), unPerfil("pe2", { busquedaAbierta: false })],
      colaboraciones: [
        colaboracion("c1", "PENDIENTE"),
        colaboracion("c2", "PENDIENTE"),
        colaboracion("c3", "ACEPTADA"),
      ],
    },
    {
      id: "p2",
      titulo: "Huerta comunitaria",
      descripcion: "Mapa de las huertas del barrio.",
      estado: "FINALIZADO",
      etiquetas: [],
      perfiles: [unPerfil("pe3")],
      colaboraciones: [],
    },
    {
      id: "p3",
      titulo: "Registro de donaciones",
      descripcion: "Planilla compartida.",
      estado: "ABIERTO",
      etiquetas: [],
      perfiles: [unPerfil("pe4")],
    },
  ];
}

const adaptadorOriginal = axiosClient.defaults.adapter;
const COLECTIVO = { id: "cuenta-1", rol: "COLECTIVO", perfilId: "c1" };
const COLABORADORA = { id: "cuenta-2", rol: "COLABORADORA", perfilId: "co1" };
let transporte;
let listado;

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

beforeEach(() => {
  listado = proyectos();
  transporte = vi.fn(async (config) => {
    if (config.method === "get" && config.url === "/colectivos/c1")
      return respuesta(config, { id: "c1", nombre: "Fundación Verde" });
    if (config.method === "get" && config.url === "/colectivos/c1/proyectos")
      return respuesta(config, listado);
    return falla(config, 404);
  });
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptadorOriginal;
});

function montar(ruta = "/colectivo/resumen", cuenta = COLECTIVO) {
  return montarRutas(
    <Route element={<MarcoDeLaApp />}>
      <Route element={<RutaProtegida roles={["COLECTIVO"]} />}>
        <Route element={<MarcoDelPanelDelColectivo />}>
          <Route path="/colectivo/resumen" element={<ResumenColectivoPage />} />
          <Route path="/colectivo/proyectos" element={<MisProyectosPage />} />
          <Route
            path="/colectivo/postulaciones"
            element={<PostulacionesPendientesPage />}
          />
        </Route>
        <Route path="/colectivo/proyectos/nuevo" element={<h1>Publicá un proyecto</h1>} />
        <Route path="/colectivo/perfil" element={<h1>Editá tu colectivo</h1>} />
        <Route
          path="/proyectos/:id/administrar"
          element={<h1>Administrar proyecto</h1>}
        />
        <Route
          path="/proyectos/:id/postulaciones"
          element={<h1>Revisar postulaciones</h1>}
        />
      </Route>
      <Route path="/proyectos/:id" element={<h1>Detalle del proyecto</h1>} />
      <Route path="/sin-permiso" element={<SinPermisoPage />} />
    </Route>,
    { ruta, cuenta, dependencies: { obtenerCuentaActual: async () => cuenta } },
  );
}

function tarjeta(titulo) {
  return screen.findByRole("article", { name: titulo });
}

function pedidosDeProyectos() {
  return transporte.mock.calls.filter(
    ([config]) => config.url === "/colectivos/c1/proyectos",
  );
}

function perfilesDelListado(cantidad) {
  return Array.from({ length: cantidad }, (_, indice) => ({
    id: `x${indice}`,
    titulo: `Proyecto extra ${indice + 1}`,
    descripcion: "Descripción.",
    estado: "ABIERTO",
    etiquetas: [],
    perfiles: [unPerfil(`pex${indice}`)],
    colaboraciones: [],
  }));
}

describe("resumen del colectivo", () => {
  test("muestra el nombre del colectivo y solo los indicadores que se pueden calcular", async () => {
    montar();
    expect(
      await screen.findByRole("heading", { level: 1, name: "Resumen del colectivo" }),
    ).toBeVisible();
    expect(await screen.findByText("Fundación Verde")).toBeVisible();
    const indicadores = within(screen.getByLabelText("Resumen del colectivo"));
    expect(indicadores.queryByText("Proyectos activos")).not.toBeInTheDocument();
    expect(indicadores.getByText("Perfiles abiertos").closest("div")).toHaveTextContent(
      "2",
    );
    expect(indicadores.queryByText("Postulaciones pendientes")).not.toBeInTheDocument();
  });

  test("los pendientes se consultan en la seccion de estadisticas", async () => {
    listado[2].colaboraciones = [];
    montar();
    const indicadores = within(await screen.findByLabelText("Resumen del colectivo"));
    expect(indicadores.queryByText("Postulaciones pendientes")).not.toBeInTheDocument();
    expect(
      await screen.findByRole("region", { name: "Tus proyectos en n\u00fameros" }),
    ).toBeVisible();
  });

  test("Tus proyectos es un resumen compacto que lleva a Mis proyectos", async () => {
    listado = [...proyectos(), ...perfilesDelListado(3)];
    const { user } = montar();
    const region = within(await screen.findByRole("region", { name: "Tus proyectos" }));
    expect(await region.findAllByRole("article")).toHaveLength(3);
    expect(region.getByText("Sistema de turnos del comedor")).toBeVisible();
    expect(region.queryByText("Proyecto extra 3")).not.toBeInTheDocument();
    await user.click(region.getByRole("link", { name: "Ver todos mis proyectos" }));
    expect(
      await screen.findByRole("heading", { level: 1, name: "Mis proyectos" }),
    ).toBeVisible();
  });

  test("cada proyecto resumido dice su estado y da acceso a su administración", async () => {
    montar();
    const abierto = await tarjeta("Sistema de turnos del comedor");
    expect(within(abierto).getByText("Abierto")).toBeInTheDocument();
    expect(within(abierto).getByText("1 perfil busca gente")).toBeInTheDocument();
    expect(within(abierto).getByText("2 postulaciones pendientes")).toBeInTheDocument();
    expect(within(abierto).getByRole("link", { name: "Administrar" })).toHaveAttribute(
      "href",
      "/proyectos/p1/administrar",
    );
  });

  test("las postulaciones pendientes no revelan identidades anónimas y llevan a revisarlas", async () => {
    listado[0].colaboraciones[0] = colaboracion("c1", "PENDIENTE", {
      esPublica: false,
      colaborador: { nombreFantasia: "Identidad privada" },
    });
    const { user } = montar();
    const pendientes = within(
      await screen.findByRole("region", { name: "Postulaciones pendientes" }),
    );
    expect(await pendientes.findByText("Postulación anónima")).toBeVisible();
    expect(pendientes.queryByText("Identidad privada")).not.toBeInTheDocument();
    expect(pendientes.getByText("Persona c2")).toBeVisible();
    expect(
      pendientes.getByText(/no incluye las postulaciones de todos los proyectos/),
    ).toBeVisible();
    const revisar = pendientes.getAllByRole("link", { name: /Revisar postulaciones/ });
    expect(revisar[0]).toHaveAttribute(
      "href",
      "/proyectos/p1/postulaciones?estado=PENDIENTE",
    );
    await user.click(pendientes.getByRole("link", { name: /Ver todas/ }));
    expect(
      await screen.findByRole("heading", { level: 1, name: "Postulaciones pendientes" }),
    ).toBeVisible();
  });

  test("muestra como máximo tres postulaciones y cuenta todas", async () => {
    listado = [
      {
        ...proyectos()[0],
        colaboraciones: [1, 2, 3, 4, 5].map((n) => colaboracion(`c${n}`, "PENDIENTE")),
      },
    ];
    montar();
    const pendientes = within(
      await screen.findByRole("region", { name: "Postulaciones pendientes" }),
    );
    expect(
      await pendientes.findByText("Tenés 5 postulaciones por revisar."),
    ).toBeVisible();
    expect(
      pendientes.getAllByRole("link", { name: /Revisar postulaciones/ }),
    ).toHaveLength(3);
  });

  test("sin postulaciones pendientes lo dice y no ofrece ver todas", async () => {
    listado = [{ ...proyectos()[1] }];
    montar();
    const pendientes = within(
      await screen.findByRole("region", { name: "Postulaciones pendientes" }),
    );
    expect(
      await pendientes.findByText("No hay postulaciones pendientes de revisión."),
    ).toBeVisible();
    expect(pendientes.queryByRole("link", { name: /Ver todas/ })).not.toBeInTheDocument();
  });

  test("las acciones rápidas llevan a funcionalidades reales", async () => {
    const { user } = montar();
    await tarjeta("Huerta comunitaria");
    const acciones = within(screen.getByRole("region", { name: "Acciones rápidas" }));
    expect(
      acciones.getByRole("link", { name: "Ver postulaciones pendientes" }),
    ).toHaveAttribute("href", "/colectivo/postulaciones");
    await user.click(acciones.getByRole("link", { name: "Editar mi colectivo" }));
    expect(
      await screen.findByRole("heading", { name: "Editá tu colectivo" }),
    ).toBeVisible();
  });

  test("Publicar proyecto lleva al formulario", async () => {
    const { user } = montar();
    await tarjeta("Huerta comunitaria");
    expect(screen.queryByText("Publicar el primero")).not.toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Publicar proyecto" }));
    expect(
      await screen.findByRole("heading", { name: "Publicá un proyecto" }),
    ).toBeVisible();
  });

  test("sin proyectos explica qué es un proyecto y ofrece publicar el primero", async () => {
    listado = [];
    const { user } = montar();
    expect(
      await screen.findByRole("heading", { name: "Todavía no publicaste proyectos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Un proyecto cuenta qué necesitan y qué perfiles de personas buscan.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Publicar proyecto" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Ver postulaciones pendientes" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Publicar el primero" }));
    expect(
      await screen.findByRole("heading", { name: "Publicá un proyecto" }),
    ).toBeVisible();
  });
});

describe("mis proyectos", () => {
  test("lista los proyectos con su estado, sin repetir indicadores ni postulaciones", async () => {
    montar("/colectivo/proyectos");
    const abierto = await tarjeta("Sistema de turnos del comedor");
    expect(within(abierto).getByText("Abierto")).toBeInTheDocument();
    expect(within(abierto).getByText("1 perfil busca gente")).toBeInTheDocument();
    expect(within(abierto).getByText("2 postulaciones pendientes")).toBeInTheDocument();

    const finalizado = await tarjeta("Huerta comunitaria");
    expect(within(finalizado).getByText("Finalizado")).toBeInTheDocument();
    expect(within(finalizado).queryByText(/pendiente/)).not.toBeInTheDocument();

    expect(screen.getByText("3 proyectos publicados")).toBeVisible();
    expect(screen.queryByLabelText("Resumen del colectivo")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Postulaciones pendientes" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Acciones rápidas" }),
    ).not.toBeInTheDocument();
  });

  test("usa un solo h1 y los proyectos son h2", async () => {
    montar("/colectivo/proyectos");
    await tarjeta("Huerta comunitaria");
    expect(
      screen.getAllByRole("heading", { level: 1 }).map((h) => h.textContent),
    ).toEqual(["Mis proyectos"]);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(3);
  });

  test("si el listado no trae las postulaciones, la tarjeta no inventa el conteo", async () => {
    montar("/colectivo/proyectos");
    const sinDato = await tarjeta("Registro de donaciones");
    expect(within(sinDato).getByText("1 perfil busca gente")).toBeInTheDocument();
    expect(within(sinDato).queryByText(/pendiente/)).not.toBeInTheDocument();
  });

  test("el título lleva al detalle y Administrar a la administración del proyecto", async () => {
    const { user } = montar("/colectivo/proyectos");
    const abierto = await tarjeta("Sistema de turnos del comedor");
    expect(within(abierto).getByRole("link", { name: "Administrar" })).toHaveAttribute(
      "href",
      "/proyectos/p1/administrar",
    );
    await user.click(
      within(abierto).getByRole("link", { name: "Sistema de turnos del comedor" }),
    );
    expect(
      await screen.findByRole("heading", { name: "Detalle del proyecto" }),
    ).toBeVisible();
  });

  test("Publicar proyecto inicia el alta", async () => {
    const { user } = montar("/colectivo/proyectos");
    await tarjeta("Huerta comunitaria");
    await user.click(screen.getByRole("link", { name: "Publicar proyecto" }));
    expect(
      await screen.findByRole("heading", { name: "Publicá un proyecto" }),
    ).toBeVisible();
  });

  test("sin proyectos ofrece publicar el primero, sin otra acción arriba", async () => {
    listado = [];
    montar("/colectivo/proyectos");
    expect(
      await screen.findByRole("heading", { name: "Todavía no publicaste proyectos" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Publicar proyecto" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Publicar el primero" })).toBeVisible();
  });
});

describe("postulaciones pendientes", () => {
  test("lista todas las pendientes con persona, perfil y proyecto, y sin identidades anónimas", async () => {
    listado[2].colaboraciones = [];
    listado[0].colaboraciones[0] = colaboracion("c1", "PENDIENTE", {
      esPublica: false,
      colaborador: { nombreFantasia: "Identidad privada" },
    });
    montar("/colectivo/postulaciones");
    expect(
      await screen.findByRole("heading", { level: 1, name: "Postulaciones pendientes" }),
    ).toBeVisible();
    const lista = within(
      await screen.findByRole("region", { name: "Postulaciones por revisar" }),
    );
    expect(await lista.findByText("Tenés 2 postulaciones por revisar.")).toBeVisible();
    expect(lista.getByText("Postulación anónima")).toBeVisible();
    expect(
      lista.getByText("Contribución anónima: su identidad no se muestra."),
    ).toBeVisible();
    expect(lista.queryByText("Identidad privada")).not.toBeInTheDocument();
    expect(lista.getByText("Persona c2")).toBeVisible();
    expect(lista.getAllByText("Sistema de turnos del comedor")).toHaveLength(2);
    expect(lista.getAllByText("Perfil pe1")).toHaveLength(2);
    expect(lista.queryByText("Persona c3")).not.toBeInTheDocument();
  });

  test("Revisar lleva a la revisión del proyecto con las pendientes", async () => {
    const { user } = montar("/colectivo/postulaciones");
    const lista = within(
      await screen.findByRole("region", { name: "Postulaciones por revisar" }),
    );
    await user.click((await lista.findAllByRole("link", { name: /Revisar/ }))[0]);
    expect(
      await screen.findByRole("heading", { name: "Revisar postulaciones" }),
    ).toBeVisible();
  });

  test("sin postulaciones pendientes lo dice", async () => {
    listado = [{ ...proyectos()[1] }];
    montar("/colectivo/postulaciones");
    expect(
      await screen.findByText("No hay postulaciones pendientes de revisión."),
    ).toBeVisible();
  });
});

describe("navegación del panel", () => {
  test("distingue las tres secciones y marca la activa", async () => {
    const { user } = montar();
    await tarjeta("Huerta comunitaria");
    const secciones = within(
      screen.getByRole("navigation", { name: "Secciones del colectivo" }),
    );
    const resumen = secciones.getByRole("link", { name: "Resumen" });
    const proyectos = secciones.getByRole("link", { name: "Mis proyectos" });
    const postulaciones = secciones.getByRole("link", { name: "Postulaciones" });
    expect(resumen).toHaveAttribute("aria-current", "page");
    expect(proyectos).not.toHaveAttribute("aria-current");

    await user.click(proyectos);
    expect(
      await screen.findByRole("heading", { level: 1, name: "Mis proyectos" }),
    ).toHaveFocus();
    expect(proyectos).toHaveAttribute("aria-current", "page");
    expect(resumen).not.toHaveAttribute("aria-current");

    await user.click(postulaciones);
    expect(
      await screen.findByRole("heading", { level: 1, name: "Postulaciones pendientes" }),
    ).toHaveFocus();
    expect(postulaciones).toHaveAttribute("aria-current", "page");
  });

  test("la cabecera mantiene marcado el panel en sus tres pantallas, sin una segunda navegación", async () => {
    const { user } = montar("/colectivo/proyectos");
    await tarjeta("Huerta comunitaria");
    const principal = screen.getByRole("navigation", { name: "Principal" });
    expect(
      within(principal).getByRole("link", { name: "Panel del colectivo" }),
    ).toHaveAttribute("aria-current", "page");
    await user.click(
      within(
        screen.getByRole("navigation", { name: "Secciones del colectivo" }),
      ).getByRole("link", { name: "Postulaciones" }),
    );
    await screen.findByRole("heading", { level: 1, name: "Postulaciones pendientes" });
    expect(
      within(principal).getByRole("link", { name: "Panel del colectivo" }),
    ).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByRole("navigation")).toHaveLength(3);
  });

  test("las tres secciones comparten una sola consulta de proyectos", async () => {
    const { user } = montar();
    await tarjeta("Huerta comunitaria");
    const secciones = within(
      screen.getByRole("navigation", { name: "Secciones del colectivo" }),
    );
    await user.click(secciones.getByRole("link", { name: "Mis proyectos" }));
    await screen.findByRole("heading", { level: 1, name: "Mis proyectos" });
    await user.click(secciones.getByRole("link", { name: "Postulaciones" }));
    await screen.findByRole("heading", { level: 1, name: "Postulaciones pendientes" });
    await user.click(secciones.getByRole("link", { name: "Resumen" }));
    await screen.findByRole("heading", { level: 1, name: "Resumen del colectivo" });
    expect(pedidosDeProyectos()).toHaveLength(1);
  });
});

describe("cargando y con error", () => {
  test.each([
    ["/colectivo/resumen", "Resumen del colectivo"],
    ["/colectivo/proyectos", "Mis proyectos"],
    ["/colectivo/postulaciones", "Postulaciones pendientes"],
  ])(
    "%s mientras carga anuncia que está cargando y mantiene el encabezado",
    async (ruta, titulo) => {
      const responder = transporte.getMockImplementation();
      transporte.mockImplementation((config) =>
        config.url === "/colectivos/c1/proyectos"
          ? new Promise(() => {})
          : responder(config),
      );
      montar(ruta);
      expect(await screen.findByText(/^Cargando /)).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 1, name: titulo })).toBeInTheDocument();
    },
  );

  test.each(["/colectivo/resumen", "/colectivo/proyectos", "/colectivo/postulaciones"])(
    "%s si falla, avisa con palabras de la persona y deja Reintentar",
    async (ruta) => {
      const responder = transporte.getMockImplementation();
      transporte.mockImplementation(async (config) => {
        if (config.url === "/colectivos/c1/proyectos") {
          transporte.mockImplementation(responder);
          return falla(config, 500, { message: "MongoNetworkError: connection refused" });
        }
        return responder(config);
      });
      const { user } = montar(ruta);
      expect(
        await screen.findByRole("heading", { name: "No pudimos cargar tus proyectos" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Tuvimos un problema en el servidor. Probá de nuevo en unos minutos.",
        ),
      ).toBeInTheDocument();
      expect(screen.queryByText(/Mongo/)).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Reintentar" }));
      expect(
        await screen.findAllByText("Sistema de turnos del comedor"),
      ).not.toHaveLength(0);
    },
  );
});

describe("permisos", () => {
  test.each(["/colectivo/resumen", "/colectivo/proyectos", "/colectivo/postulaciones"])(
    "una colaboradora no entra a %s",
    async (ruta) => {
      montar(ruta, COLABORADORA);
      expect(
        await screen.findByRole("heading", {
          name: "No tenés permiso para ver esta página",
        }),
      ).toBeInTheDocument();
    },
  );

  test("una colaboradora no ve el enlace al panel del colectivo en la cabecera", async () => {
    montar("/sin-permiso", COLABORADORA);
    await screen.findByRole("button", { name: "Mi cuenta" });
    expect(
      screen.queryByRole("link", { name: "Panel del colectivo" }),
    ).not.toBeInTheDocument();
  });
});
