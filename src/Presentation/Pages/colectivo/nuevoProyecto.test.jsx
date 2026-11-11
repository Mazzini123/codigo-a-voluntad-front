import { screen, waitFor, within } from "@testing-library/react";
import axios from "axios";
import { Route } from "react-router-dom";
import { MarcoDeLaApp } from "@/Presentation/Components/App/layout/MarcoDeLaApp.jsx";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { RutaProtegida } from "@/Presentation/Routes/RutaProtegida.jsx";
import { montarRutas } from "@/test/montarRutas.jsx";
import { NuevoProyectoPage } from "./NuevoProyectoPage.jsx";
import { ProyectoPage } from "@/Presentation/Pages/publicas/ProyectoPage.jsx";

const CATALOGO = [
  { codigo: "react", titulo: "React", activo: true },
  { codigo: "css", titulo: "CSS", activo: true },
  { codigo: "figma", titulo: "Figma", activo: true },
  { codigo: "python", titulo: "Python", activo: true },
];

const PEDIDO_ESPERADO = {
  titulo: "Sistema de turnos del comedor",
  descripcion: "Una app para ordenar las entregas.",
  etiquetas: ["salud"],
  fechaCierre: "2099-12-31T23:59:59-03:00",
  perfiles: [
    {
      descripcion: "Desarrolladora frontend",
      codigosHabilidadesRequeridas: ["react"],
      codigosHabilidadesOpcionales: [],
      compromiso: { cantidadHoras: 5, periodo: "HS_SEMANALES" },
      modalidadColaboracion: "GRATUITA",
      modoAceptacion: "REVISION_MANUAL",
      limiteColaboraciones: null,
    },
    {
      descripcion: "Diseñadora de interfaz",
      codigosHabilidadesRequeridas: ["css"],
      codigosHabilidadesOpcionales: ["figma"],
      compromiso: { cantidadHoras: 10, periodo: "HS_MENSUALES" },
      modalidadColaboracion: "OFRECE_INCENTIVO_ECONOMICO",
      modoAceptacion: "HASTA_LLENAR_VACANTES",
      limiteColaboraciones: 2,
      fechaCierreBusqueda: "2099-12-01T23:59:59-03:00",
    },
  ],
};

const adaptadorOriginal = axiosClient.defaults.adapter;
const COLECTIVO = { id: "cuenta-1", rol: "COLECTIVO", perfilId: "c1" };
let transporte;
let respuestasAlCrear;

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

function proyectoCreado() {
  return {
    id: "pn",
    colectivo: { id: "c1", nombre: "Asamblea de Fiorito" },
    titulo: PEDIDO_ESPERADO.titulo,
    descripcion: PEDIDO_ESPERADO.descripcion,
    estado: "ABIERTO",
    etiquetas: ["salud"],
    perfiles: [],
    colaboraciones: [],
    avances: [],
    porcentajeConcrecion: 0,
    fechaCreacion: "2026-11-06T15:00:00Z",
  };
}

beforeEach(() => {
  respuestasAlCrear = [];
  transporte = vi.fn(async (config) => {
    if (config.method === "get" && config.url === "/habilidades")
      return respuesta(config, {
        data: CATALOGO,
        meta: { page: 1, per_page: 100, total: CATALOGO.length, total_pages: 1 },
      });
    if (config.method === "get" && config.url === "/colectivos/c1")
      return respuesta(config, {
        id: "c1",
        nombre: "Asamblea de Fiorito",
        proyectos: [{ id: "pn", titulo: PEDIDO_ESPERADO.titulo, estado: "ABIERTO" }],
      });
    if (config.method === "get" && config.url === "/proyectos/pn")
      return respuesta(config, proyectoCreado());
    if (config.method === "post" && config.url === "/colectivos/c1/proyectos") {
      const configurada = respuestasAlCrear.shift();
      if (configurada?.status) return falla(config, configurada.status, configurada.data);
      if (configurada?.codigo)
        throw new axios.AxiosError("Sin respuesta", configurada.codigo, config);
      return respuesta(config, proyectoCreado(), 201);
    }
    return falla(config, 404, { message: "No existe." });
  });
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptadorOriginal;
});

function montar(ruta = "/colectivo/proyectos/nuevo") {
  return montarRutas(
    <Route element={<MarcoDeLaApp />}>
      <Route element={<RutaProtegida roles={["COLECTIVO"]} />}>
        <Route path="/colectivo/resumen" element={<h1>Panel del colectivo</h1>} />
        <Route path="/colectivo/proyectos/nuevo" element={<NuevoProyectoPage />} />
      </Route>
      <Route path="/proyectos/:id" element={<ProyectoPage />} />
    </Route>,
    {
      ruta,
      cuenta: COLECTIVO,
      dependencies: { obtenerCuentaActual: async () => COLECTIVO },
    },
  );
}

function pedidosDeAlta() {
  return transporte.mock.calls
    .map(([config]) => config)
    .filter((config) => config.method === "post");
}

function paso(nombre) {
  return screen.findByRole("heading", { level: 2, name: nombre });
}

async function completarProyecto(user) {
  await user.type(await screen.findByLabelText(/^Título/), PEDIDO_ESPERADO.titulo);
  await user.type(screen.getByLabelText(/^Descripción/), PEDIDO_ESPERADO.descripcion);
  await user.type(screen.getByLabelText("Nueva etiqueta"), "salud{Enter}");
  await user.type(screen.getByLabelText(/^Fecha de cierre del proyecto/), "2099-12-31");
  await user.click(screen.getByRole("button", { name: "Siguiente" }));
  await paso("Los perfiles");
}

async function elegirHabilidad(user, grupo, nombre) {
  const lista = await screen.findByRole("group", { name: grupo });
  await user.click(await within(lista).findByRole("checkbox", { name: nombre }));
}

async function guardarPerfilDeFrontend(user) {
  await user.type(
    await screen.findByLabelText(/^Qué necesitan/),
    "Desarrolladora frontend",
  );
  await elegirHabilidad(user, /^Habilidades requeridas/, "React");
  expect(
    screen.getByRole("radio", { name: "Colaboración sin remuneración" }),
  ).toBeChecked();
  await user.type(screen.getByLabelText(/^¿Cuántas horas\?/), "5");
  await user.click(screen.getByRole("button", { name: "Guardar perfil" }));
}

async function guardarPerfilDeDiseno(user) {
  await user.click(await screen.findByRole("button", { name: "Sumar otro perfil" }));
  await user.type(
    await screen.findByLabelText(/^Qué necesitan/),
    "Diseñadora de interfaz",
  );
  await elegirHabilidad(user, /^Habilidades requeridas/, "CSS");
  await elegirHabilidad(user, /^Habilidades opcionales/, "Figma");
  await user.type(screen.getByLabelText(/^¿Cuántas horas\?/), "10");
  await user.click(screen.getByRole("radio", { name: "por mes" }));
  await user.click(screen.getByRole("radio", { name: "Con incentivo económico" }));
  await user.click(
    screen.getByRole("radio", { name: "Acepto hasta completar un número de lugares" }),
  );
  await user.type(screen.getByLabelText(/^¿Cuántos lugares hay\?/), "2");
  await user.type(screen.getByLabelText(/^Fecha de cierre de la búsqueda/), "2099-12-01");
  await user.click(screen.getByRole("button", { name: "Guardar perfil" }));
}

async function llegarAlPasoDeRevision(user) {
  await completarProyecto(user);
  await guardarPerfilDeFrontend(user);
  await guardarPerfilDeDiseno(user);
  await user.click(await screen.findByRole("button", { name: "Siguiente" }));
  await paso("Revisar y publicar");
}

describe("alta completa", () => {
  test("reusa la clave tras un timeout y pide confirmación si se modifican los datos", async () => {
    respuestasAlCrear = [{ codigo: "ECONNABORTED" }, { codigo: "ECONNABORTED" }];
    const { user } = montar();
    await completarProyecto(user);
    await guardarPerfilDeFrontend(user);
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    await paso("Revisar y publicar");

    const publicar = () =>
      user.click(screen.getByRole("button", { name: "Publicar proyecto" }));
    await publicar();
    await screen.findByText(/El servidor tardó demasiado/);
    await publicar();
    await screen.findByText(/El servidor tardó demasiado/);

    const [primero, reintento] = pedidosDeAlta();
    const clave = primero.headers.get("Idempotency-Key");
    expect(clave).toMatch(/^[0-9a-f-]{36}$/);
    expect(reintento.headers.get("Idempotency-Key")).toBe(clave);
    expect(reintento.data).toBe(primero.data);

    await user.click(screen.getByRole("button", { name: "Volver a editar el proyecto" }));
    await user.type(await screen.findByLabelText(/^Título/), " actualizado");
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    await paso("Los perfiles");
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    await paso("Revisar y publicar");
    await publicar();

    const dialogo = screen.getByRole("dialog", { name: "¿Publicar esta versión?" });
    expect(dialogo).toHaveTextContent(/La publicación anterior pudo haberse guardado/);
    expect(pedidosDeAlta()).toHaveLength(2);
    await user.click(
      within(dialogo).getByRole("button", { name: "Publicar esta versión" }),
    );

    await screen.findByRole("heading", { level: 1, name: /Sistema de turnos/ });
    const nuevo = pedidosDeAlta()[2];
    expect(nuevo.headers.get("Idempotency-Key")).not.toBe(clave);
    expect(JSON.parse(nuevo.data).titulo).toBe(`${PEDIDO_ESPERADO.titulo} actualizado`);
  });

  test("publica un proyecto con dos perfiles en tres pasos y llega a su detalle como dueño", async () => {
    const { user, router } = montar();

    const indicador = await screen.findByRole("list", {
      name: "Pasos para publicar el proyecto",
    });
    expect(within(indicador).getByText("1. El proyecto")).toHaveAttribute(
      "aria-current",
      "step",
    );
    await completarProyecto(user);
    expect(within(indicador).getByText("2. Los perfiles")).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(router.state.location.search).toBe("?paso=2");

    await guardarPerfilDeFrontend(user);
    const cargados = await screen.findByRole("list", { name: "Perfiles cargados" });
    expect(
      within(cargados).getByText("5 h por semana · Colaboración sin remuneración"),
    ).toBeInTheDocument();
    await guardarPerfilDeDiseno(user);
    expect(
      await within(cargados).findByText("10 h por mes · Con incentivo económico"),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(await paso("Revisar y publicar")).toHaveFocus();
    expect(router.state.location.search).toBe("?paso=3");
    expect(
      screen.getByRole("heading", { level: 3, name: "Sistema de turnos del comedor" }),
    ).toBeVisible();
    expect(screen.getByText("Abierto")).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "Desarrolladora frontend" }),
    ).toBeVisible();
    expect(screen.getByRole("article", { name: "Diseñadora de interfaz" })).toBeVisible();
    expect(
      within(screen.getByRole("article", { name: "Desarrolladora frontend" })).getByText(
        "Colaboración sin remuneración",
      ),
    ).toBeVisible();
    expect(document.body).not.toHaveTextContent(
      /HS_|TODO_SUMA|REVISION_MANUAL|HASTA_LLENAR|OFRECE_|GRATUITA/,
    );

    await user.click(screen.getByRole("button", { name: "Publicar proyecto" }));

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Sistema de turnos del comedor",
      }),
    ).toBeInTheDocument();
    expect(pedidosDeAlta()).toHaveLength(1);
    expect(JSON.parse(pedidosDeAlta()[0].data)).toEqual(PEDIDO_ESPERADO);
    expect(router.state.location.pathname).toBe("/proyectos/pn");
    expect(screen.getByRole("status")).toHaveTextContent("Publicaste el proyecto.");
    expect(
      await screen.findByText("Este proyecto es de tu colectivo"),
    ).toBeInTheDocument();
  });

  test("mientras publica muestra Publicando… y no deja volver a editar ni publicar dos veces", async () => {
    let terminar;
    const { user } = montar();
    await llegarAlPasoDeRevision(user);
    const original = transporte.getMockImplementation();
    transporte.mockImplementation(async (config) => {
      if (config.method === "post")
        await new Promise((resolve) => {
          terminar = resolve;
        });
      return original(config);
    });

    await user.click(screen.getByRole("button", { name: "Publicar proyecto" }));
    const publicando = await screen.findByRole("button", { name: "Publicando…" });
    expect(publicando).toBeDisabled();
    expect(publicando).toHaveAttribute("aria-busy", "true");
    expect(
      screen.getByRole("button", { name: "Volver a editar el proyecto" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Volver a editar los perfiles" }),
    ).toBeDisabled();
    terminar();
    expect(
      await screen.findByRole("heading", { level: 1, name: /Sistema de turnos/ }),
    ).toBeVisible();
    expect(pedidosDeAlta()).toHaveLength(1);
  });

  test("si el back rechaza el alta, sigue en el paso 3 con todo cargado y un mensaje del front", async () => {
    respuestasAlCrear = [
      {
        status: 400,
        data: {
          message: "ZodError: perfiles.0.codigosHabilidadesRequeridas",
          issues: [
            {
              path: ["perfiles", 0, "codigosHabilidadesRequeridas"],
              code: "too_small",
              message: "Array must contain at least 1 element(s)",
            },
            { path: ["titulo"], code: "too_small", message: "String must contain" },
          ],
        },
      },
    ];
    const { user, router } = montar();
    await llegarAlPasoDeRevision(user);

    await user.click(screen.getByRole("button", { name: "Publicar proyecto" }));

    const alerta = await screen.findByText(
      "No pudimos publicar el proyecto. Revisá los datos que cargaste y probá de nuevo.",
    );
    const bloque = alerta.closest('[role="alert"]');
    expect(within(bloque).getByText("El título del proyecto")).toBeInTheDocument();
    expect(
      within(bloque).getByText("Perfil 1: las habilidades requeridas"),
    ).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/Zod|Array must|String must/);
    expect(router.state.location.search).toBe("?paso=3");
    expect(
      screen.getByRole("heading", { level: 3, name: "Sistema de turnos del comedor" }),
    ).toBeVisible();
    expect(screen.getByRole("article", { name: "Diseñadora de interfaz" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Publicar proyecto" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Publicar proyecto" }));

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Sistema de turnos del comedor",
      }),
    ).toBeInTheDocument();
    expect(pedidosDeAlta()).toHaveLength(2);
    expect(JSON.parse(pedidosDeAlta()[1].data)).toEqual(PEDIDO_ESPERADO);
  });

  test("volver a editar los perfiles conserva lo cargado y borra el aviso de error", async () => {
    respuestasAlCrear = [{ status: 400, data: { issues: [] } }];
    const { user, router } = montar();
    await llegarAlPasoDeRevision(user);
    await user.click(screen.getByRole("button", { name: "Publicar proyecto" }));
    await screen.findByText(/No pudimos publicar el proyecto/);

    await user.click(
      screen.getByRole("button", { name: "Volver a editar los perfiles" }),
    );

    expect(await paso("Los perfiles")).toHaveFocus();
    expect(router.state.location.search).toBe("?paso=2");
    const cargados = screen.getByRole("list", { name: "Perfiles cargados" });
    expect(within(cargados).getAllByRole("article")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    await paso("Revisar y publicar");
    expect(screen.queryByText(/No pudimos publicar el proyecto/)).not.toBeInTheDocument();
  });

  test.each([
    [500, "Tuvimos un problema en el servidor. Probá de nuevo en unos minutos."],
    [403, "No tenés permiso para hacer esto."],
  ])(
    "ante un %i muestra un mensaje en lenguaje de la persona",
    async (status, mensaje) => {
      respuestasAlCrear = [{ status, data: { message: "stack trace interno" } }];
      const { user } = montar();
      await llegarAlPasoDeRevision(user);
      await user.click(screen.getByRole("button", { name: "Publicar proyecto" }));
      expect(await screen.findByText(mensaje)).toBeInTheDocument();
      expect(screen.queryByText(/stack trace/)).not.toBeInTheDocument();
    },
  );
});

describe("paso 1: el proyecto", () => {
  test("sin título ni descripción no avanza, resume los errores y enfoca el primer campo", async () => {
    const { user, router } = montar();
    await user.click(await screen.findByRole("button", { name: "Siguiente" }));

    const titulo = screen.getByLabelText(/^Título/);
    expect(titulo).toHaveAttribute("aria-invalid", "true");
    expect(titulo).toHaveAccessibleDescription("Escribí el título del proyecto.");
    expect(titulo).toHaveFocus();
    const resumen = screen
      .getAllByRole("alert")
      .find((alerta) => /^Revisá/.test(alerta.textContent));
    expect(resumen).toHaveTextContent("Revisá 2 campos: Título y Descripción.");
    expect(router.state.location.search).toBe("");

    await user.click(within(resumen).getByRole("link", { name: "Descripción" }));
    expect(screen.getByLabelText(/^Descripción/)).toHaveFocus();
  });

  test("la fecha de cierre tiene que ser posterior a hoy", async () => {
    const { user } = montar();
    await user.type(await screen.findByLabelText(/^Título/), "Turnos");
    await user.type(screen.getByLabelText(/^Descripción/), "Una app");
    await user.type(screen.getByLabelText(/^Fecha de cierre del proyecto/), "2020-01-01");
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(
      screen.getByLabelText(/^Fecha de cierre del proyecto/),
    ).toHaveAccessibleDescription(/Elegí una fecha posterior a hoy\./);
    expect(screen.getByLabelText(/^Fecha de cierre del proyecto/)).toHaveFocus();
  });

  test("las etiquetas son opcionales", async () => {
    const { user } = montar();
    await user.type(await screen.findByLabelText(/^Título/), "Turnos");
    await user.type(screen.getByLabelText(/^Descripción/), "Una app");
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(await paso("Los perfiles")).toBeVisible();
  });
});

describe("paso 2: los perfiles", () => {
  async function irAlPasoDePerfiles(user) {
    await user.type(await screen.findByLabelText(/^Título/), "Turnos");
    await user.type(screen.getByLabelText(/^Descripción/), "Una app");
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    await paso("Los perfiles");
  }

  test("sin ningún perfil guardado, Siguiente está deshabilitado y dice por qué", async () => {
    const { user } = montar();
    await irAlPasoDePerfiles(user);
    const siguiente = screen.getByRole("button", { name: "Siguiente" });
    expect(siguiente).toBeDisabled();
    expect(siguiente).toHaveAccessibleDescription("Sumá al menos un perfil para seguir.");
  });

  test("un perfil incompleto marca sus campos y no se guarda", async () => {
    const { user } = montar();
    await irAlPasoDePerfiles(user);
    await user.click(screen.getByRole("button", { name: "Guardar perfil" }));

    const descripcion = screen.getByLabelText(/^Qué necesitan/);
    expect(descripcion).toHaveFocus();
    expect(descripcion).toHaveAccessibleDescription(
      /Contá qué tendría que hacer esta persona\./,
    );
    expect(screen.getByLabelText(/^¿Cuántas horas\?/)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(
      screen.getByRole("group", { name: /^Habilidades requeridas/ }),
    ).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.queryByRole("list", { name: "Perfiles cargados" }),
    ).not.toBeInTheDocument();
  });

  test("hasta completar lugares pide cuántos son", async () => {
    const { user } = montar();
    await irAlPasoDePerfiles(user);
    await user.click(
      screen.getByRole("radio", { name: "Acepto hasta completar un número de lugares" }),
    );
    await user.click(screen.getByRole("button", { name: "Guardar perfil" }));
    expect(screen.getByLabelText(/^¿Cuántos lugares hay\?/)).toHaveAccessibleDescription(
      /Escribí cuántos lugares hay/,
    );
  });

  test("con revisión manual el límite es opcional y con aceptar a todas no se pide", async () => {
    const { user } = montar();
    await irAlPasoDePerfiles(user);
    expect(screen.getByLabelText(/^¿Cuántas personas como máximo\?/)).toBeInTheDocument();
    await user.click(
      screen.getByRole("radio", { name: "Acepto a todas las que se postulen" }),
    );
    expect(screen.queryByLabelText(/personas como máximo/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/lugares hay/)).not.toBeInTheDocument();
  });

  test("una habilidad requerida deja de ofrecerse como opcional", async () => {
    const { user } = montar();
    await irAlPasoDePerfiles(user);
    await elegirHabilidad(user, /^Habilidades requeridas/, "React");
    const opcionales = await screen.findByRole("group", {
      name: /^Habilidades opcionales/,
    });
    expect(
      within(opcionales).queryByRole("checkbox", { name: "React" }),
    ).not.toBeInTheDocument();
    expect(within(opcionales).getByRole("checkbox", { name: "CSS" })).toBeInTheDocument();
  });

  test("Editar abre el perfil con lo cargado y al guardar lo reemplaza, sin duplicarlo", async () => {
    const { user } = montar();
    await irAlPasoDePerfiles(user);
    await guardarPerfilDeFrontend(user);

    await user.click(await screen.findByRole("button", { name: "Editar perfil 1" }));
    const descripcion = screen.getByLabelText(/^Qué necesitan/);
    expect(descripcion).toHaveFocus();
    expect(descripcion).toHaveValue("Desarrolladora frontend");
    expect(screen.getByRole("button", { name: "Editar perfil 1" })).toBeDisabled();
    await user.clear(descripcion);
    await user.type(descripcion, "Desarrolladora full stack");
    await user.click(screen.getByRole("button", { name: "Guardar perfil" }));

    const cargados = await screen.findByRole("list", { name: "Perfiles cargados" });
    expect(within(cargados).getAllByRole("article")).toHaveLength(1);
    expect(within(cargados).getByText("Desarrolladora full stack")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sumar otro perfil" })).toHaveFocus();
  });

  test("con un perfil abierto sin guardar, Siguiente espera; descartarlo lo habilita", async () => {
    const { user } = montar();
    await irAlPasoDePerfiles(user);
    await guardarPerfilDeFrontend(user);

    await user.click(await screen.findByRole("button", { name: "Sumar otro perfil" }));
    const siguiente = screen.getByRole("button", { name: "Siguiente" });
    expect(siguiente).toBeDisabled();
    expect(siguiente).toHaveAccessibleDescription(
      "Guardá o descartá el perfil que estás editando.",
    );

    await user.click(screen.getByRole("button", { name: "Descartar perfil" }));
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Sumar otro perfil" })).toHaveFocus();
  });

  test("Quitar saca el perfil sin pedir confirmación", async () => {
    const { user } = montar();
    await irAlPasoDePerfiles(user);
    await guardarPerfilDeFrontend(user);

    await user.click(await screen.findByRole("button", { name: "Quitar perfil 1" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("list", { name: "Perfiles cargados" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
    expect(screen.getByLabelText(/^Qué necesitan/)).toHaveFocus();
  });
});

describe("el paso en la URL", () => {
  test("atrás en el navegador vuelve al paso anterior con lo cargado", async () => {
    const { user, router } = montar();
    await completarProyecto(user);
    await router.navigate(-1);
    expect(await paso("El proyecto")).toHaveFocus();
    expect(screen.getByLabelText(/^Título/)).toHaveValue(PEDIDO_ESPERADO.titulo);
    expect(
      screen.getByRole("list", { name: /Pasos/ }).querySelector('[aria-current="step"]'),
    ).toHaveTextContent("1. El proyecto");
  });

  test.each(["2", "3"])(
    "entrar o recargar en ?paso=%s sin datos vuelve al paso 1",
    async (numero) => {
      const { router } = montar(`/colectivo/proyectos/nuevo?paso=${numero}`);
      expect(await paso("El proyecto")).toBeVisible();
      await waitFor(() => expect(router.state.location.search).toBe("?paso=1"));
    },
  );

  test.each(["0", "7", "x"])(
    "un paso inválido (%s) se toma como el 1",
    async (numero) => {
      montar(`/colectivo/proyectos/nuevo?paso=${numero}`);
      expect(await paso("El proyecto")).toBeVisible();
    },
  );
});

describe("salir sin publicar", () => {
  test("sin datos cargados sale directo", async () => {
    const { user, router } = montar();
    await user.click(
      await screen.findByRole("link", { name: "Volver al panel del colectivo" }),
    );
    expect(
      await screen.findByRole("heading", { name: "Panel del colectivo" }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/colectivo/resumen");
  });

  test("con datos cargados pregunta, y se puede seguir editando o salir", async () => {
    const { user, router } = montar();
    await user.type(await screen.findByLabelText(/^Título/), "Turnos");
    const volver = screen.getByRole("link", { name: "Volver al panel del colectivo" });

    await user.click(volver);
    const dialogo = await screen.findByRole("dialog", { name: "¿Salir sin publicar?" });
    await user.click(within(dialogo).getByRole("button", { name: "Seguir editando" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/colectivo/proyectos/nuevo");
    expect(screen.getByLabelText(/^Título/)).toHaveValue("Turnos");

    await user.click(volver);
    const otraVez = await screen.findByRole("dialog", { name: "¿Salir sin publicar?" });
    await user.click(within(otraVez).getByRole("button", { name: "Salir sin publicar" }));
    expect(
      await screen.findByRole("heading", { name: "Panel del colectivo" }),
    ).toBeInTheDocument();
  });

  test("cambiar de paso no dispara el aviso", async () => {
    const { user } = montar();
    await completarProyecto(user);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
