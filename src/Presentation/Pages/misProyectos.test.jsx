import { screen, within } from "@testing-library/react";
import axios from "axios";
import { Route } from "react-router-dom";
import { AppLayout } from "../Components/App/AppLayout.jsx";
import { axiosClient } from "../../Infrastructure/Http/axiosClient.js";
import { ProtectedRoute } from "../Routes/ProtectedRoute.jsx";
import { montarRutas } from "../../test/montarRutas.jsx";
import { MisProyectosPage } from "./MisProyectosPage.jsx";
import { SinPermisoPage } from "./SinPermisoPage.jsx";

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

const colaboracion = (id, estado) => ({ id, perfil: "pe1", estado, esPublica: true });

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
    if (config.method === "get" && config.url === "/colectivos/c1/proyectos")
      return respuesta(config, listado);
    return falla(config, 404);
  });
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptadorOriginal;
});

function montar(ruta = "/colectivo/proyectos", cuenta = COLECTIVO) {
  return montarRutas(
    <Route element={<AppLayout />}>
      <Route element={<ProtectedRoute roles={["COLECTIVO"]} />}>
        <Route path="/colectivo/proyectos" element={<MisProyectosPage />} />
        <Route path="/colectivo/proyectos/nuevo" element={<h1>Publicá un proyecto</h1>} />
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

describe("con proyectos", () => {
  test("cada tarjeta dice el estado, cuántos perfiles buscan gente y cuántas postulaciones esperan", async () => {
    montar();
    const abierto = await tarjeta("Sistema de turnos del comedor");
    expect(within(abierto).getByText("Abierto")).toBeInTheDocument();
    expect(within(abierto).getByText("1 perfil busca gente")).toBeInTheDocument();
    expect(within(abierto).getByText("2 postulaciones pendientes")).toBeInTheDocument();

    const finalizado = await tarjeta("Huerta comunitaria");
    expect(within(finalizado).getByText("Finalizado")).toBeInTheDocument();
    expect(within(finalizado).queryByText(/pendiente/)).not.toBeInTheDocument();
  });

  test("si el listado no trae las postulaciones, la tarjeta no inventa el conteo", async () => {
    montar();
    const sinDato = await tarjeta("Registro de donaciones");
    expect(within(sinDato).getByText("1 perfil busca gente")).toBeInTheDocument();
    expect(within(sinDato).queryByText(/pendiente/)).not.toBeInTheDocument();
  });

  test("el título de la tarjeta lleva al detalle del proyecto", async () => {
    const { user } = montar();
    const abierto = await tarjeta("Sistema de turnos del comedor");
    await user.click(within(abierto).getByRole("link"));
    expect(
      await screen.findByRole("heading", { name: "Detalle del proyecto" }),
    ).toBeVisible();
  });

  test("Publicar proyecto es la única acción de alta y lleva al formulario", async () => {
    const { user } = montar();
    await tarjeta("Huerta comunitaria");
    expect(screen.queryByText("Publicar el primero")).not.toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Publicar proyecto" }));
    expect(
      await screen.findByRole("heading", { name: "Publicá un proyecto" }),
    ).toBeVisible();
  });

  test("los títulos van en orden: Mis proyectos, Tus proyectos y cada proyecto", async () => {
    montar();
    await tarjeta("Huerta comunitaria");
    expect(
      screen.getAllByRole("heading", { level: 1 }).map((h) => h.textContent),
    ).toEqual(["Mis proyectos"]);
    expect(
      screen.getByRole("heading", { level: 2, name: "Tus proyectos" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
  });

  test("la cabecera marca Mis proyectos como la sección actual", async () => {
    montar();
    await tarjeta("Huerta comunitaria");
    const navegacion = screen.getByRole("navigation", { name: "Principal" });
    expect(
      within(navegacion).getByRole("link", { name: "Mis proyectos" }),
    ).toHaveAttribute("aria-current", "page");
  });
});

describe("sin proyectos", () => {
  test("explica qué es un proyecto y ofrece publicar el primero, sin otra acción coral arriba", async () => {
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
    await user.click(screen.getByRole("link", { name: "Publicar el primero" }));
    expect(
      await screen.findByRole("heading", { name: "Publicá un proyecto" }),
    ).toBeVisible();
  });
});

describe("cargando y con error", () => {
  test("mientras carga anuncia que está cargando y mantiene el encabezado", async () => {
    transporte.mockImplementationOnce(() => new Promise(() => {}));
    montar();
    expect(await screen.findByText("Cargando tus proyectos…")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Mis proyectos" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Publicar proyecto" })).toBeInTheDocument();
  });

  test("si falla, avisa con palabras de la persona, conserva el encabezado y deja Reintentar", async () => {
    transporte.mockImplementationOnce(async (config) =>
      falla(config, 500, { message: "MongoNetworkError: connection refused" }),
    );
    const { user } = montar();
    expect(
      await screen.findByRole("heading", { name: "No pudimos cargar tus proyectos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Tuvimos un problema en el servidor. Probá de nuevo en unos minutos.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Mongo/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Publicar proyecto" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await tarjeta("Huerta comunitaria")).toBeInTheDocument();
  });
});

describe("permisos", () => {
  test("una colaboradora no entra a Mis proyectos", async () => {
    montar("/colectivo/proyectos", COLABORADORA);
    expect(
      await screen.findByRole("heading", {
        name: "No tenés permiso para ver esta página",
      }),
    ).toBeInTheDocument();
  });

  test("una colaboradora no ve el enlace Mis proyectos en la cabecera", async () => {
    montar("/sin-permiso", COLABORADORA);
    await screen.findByRole("button", { name: "Mi cuenta" });
    expect(screen.queryByRole("link", { name: "Mis proyectos" })).not.toBeInTheDocument();
  });
});
