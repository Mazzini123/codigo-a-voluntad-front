import { act, screen, waitFor, within } from "@testing-library/react";
import axios from "axios";
import { Navigate, Route } from "react-router-dom";
import { MarcoDeLaApp } from "@/Presentation/Components/App/layout/MarcoDeLaApp.jsx";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { ProyectoPage } from "./ProyectoPage.jsx";
import { ProyectosPage } from "./ProyectosPage.jsx";
import { montarRutas } from "@/test/montarRutas.jsx";

const habilidad = (codigo, titulo) => ({ codigo, titulo });

function unProyecto() {
  return {
    id: "p1",
    titulo: "Sistema de turnos del comedor",
    descripcion: "Una app para ordenar las entregas.\nSegunda línea.",
    estado: "ABIERTO",
    etiquetas: ["salud"],
    porcentajeConcrecion: 40,
    urlSistema: "https://turnos.example.org",
    urlRepositorio: "https://github.com/comedor/turnos",
    fechaCreacion: "2026-11-03T15:00:00Z",
    perfiles: [
      {
        id: "pe1",
        descripcion: "Desarrolladora frontend",
        busquedaAbierta: true,
        fechaCierreBusqueda: "2099-11-30T23:00:00Z",
        limiteColaboraciones: 3,
        modoAceptacion: "REVISION_MANUAL",
        compromiso: { cantidadHoras: 5, periodo: "HS_MENSUALES" },
        modalidadColaboracion: "GRATUITA",
        habilidadesRequeridas: [habilidad("react", "React"), habilidad("css", "CSS")],
        habilidadesOpcionales: [habilidad("figma", "Figma")],
      },
      {
        id: "pe2",
        descripcion: "Tester",
        busquedaAbierta: false,
        fechaCierreBusqueda: null,
        limiteColaboraciones: null,
        modoAceptacion: "TODO_SUMA",
        compromiso: { cantidadHoras: 10, periodo: "HS_SEMANALES" },
        modalidadColaboracion: "OFRECE_INCENTIVO_ECONOMICO",
        habilidadesRequeridas: [habilidad("cypress", "Cypress")],
        habilidadesOpcionales: [],
      },
      {
        id: "pe3",
        descripcion: "Analista de datos",
        busquedaAbierta: true,
        fechaCierreBusqueda: null,
        limiteColaboraciones: null,
        modoAceptacion: "TODO_SUMA",
        compromiso: { cantidadHoras: 15, periodo: "HS_MENSUALES" },
        modalidadColaboracion: "GRATUITA",
        habilidadesRequeridas: [habilidad("pandas", "Pandas")],
        habilidadesOpcionales: [],
      },
    ],
    colaboraciones: [
      {
        id: "c1",
        perfil: "pe1",
        estado: "ACEPTADA",
        esPublica: true,
        colaborador: { id: "co9", nombreFantasia: "Ana" },
      },
      {
        id: "c2",
        perfil: "pe1",
        estado: "ACEPTADA",
        esPublica: false,
        colaborador: null,
      },
      {
        id: "c3",
        perfil: "pe1",
        estado: "PENDIENTE",
        esPublica: true,
        colaborador: { id: "co8", nombreFantasia: "Pendiente" },
      },
    ],
  };
}

const adaptadorOriginal = axiosClient.defaults.adapter;
let transporte;
let proyecto;
let postulacionesDeCo1;
let respuestaAlPostular;
let proyectosDelColectivo;

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

function pagina(lista) {
  return {
    data: lista,
    meta: { page: 1, per_page: 12, total: lista.length, total_pages: 1 },
  };
}

beforeEach(() => {
  proyecto = unProyecto();
  postulacionesDeCo1 = [];
  respuestaAlPostular = null;
  proyectosDelColectivo = [];
  transporte = vi.fn(async (config) => {
    if (config.method === "get" && config.url === "/proyectos")
      return respuesta(config, pagina([proyecto]));
    if (config.method === "get" && config.url === "/proyectos/p1")
      return respuesta(config, proyecto);
    if (config.method === "get" && config.url === "/colectivos/cl1")
      return respuesta(config, {
        id: "cl1",
        nombre: "Asamblea de Fiorito",
        proyectos: proyectosDelColectivo,
      });
    if (config.url === "/colaboradores/co1")
      return respuesta(config, { id: "co1", habilidades: [habilidad("react", "React")] });
    if (config.url === "/colaboradores/co1/colaboraciones")
      return respuesta(config, postulacionesDeCo1);
    if (config.url === "/colaboradores/co1/proyectos-potenciales")
      return respuesta(config, pagina([proyecto]));
    if (config.method === "post" && config.url === "/proyectos/p1/colaboraciones") {
      if (respuestaAlPostular?.status) {
        return falla(config, respuestaAlPostular.status, respuestaAlPostular.data);
      }
      const pedido = JSON.parse(config.data);
      const nueva = {
        id: "nueva",
        perfil: pedido.perfilId,
        estado: respuestaAlPostular?.estado ?? "PENDIENTE",
        esPublica: pedido.esPublica,
        colaborador: { id: "co1", nombreFantasia: "Yo" },
      };
      postulacionesDeCo1 = [{ proyectoId: "p1", colaboracion: nueva }];
      return respuesta(config, nueva, 201);
    }
    return falla(config, 404, { message: "No existe." });
  });
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptadorOriginal;
});

const COLABORADORA = { id: "cuenta-2", rol: "COLABORADORA", perfilId: "co1" };
const COLECTIVO = { id: "cuenta-1", rol: "COLECTIVO", perfilId: "cl1" };
const SIN_PERFIL = { id: "cuenta-3", rol: null, perfilId: null };

function montar(ruta, cuenta = null) {
  return montarRutas(
    <Route element={<MarcoDeLaApp />}>
      <Route path="/" element={<Navigate to="/proyectos" replace />} />
      <Route path="/proyectos" element={<ProyectosPage />} />
      <Route path="/proyectos/:id" element={<ProyectoPage />} />
      <Route path="/login" element={<h1>Ingresar</h1>} />
      <Route path="/bienvenida" element={<h1>Bienvenida</h1>} />
    </Route>,
    { ruta, cuenta, dependencies: { obtenerCuentaActual: async () => cuenta } },
  );
}

async function perfil(nombre) {
  return screen.findByRole("article", { name: nombre });
}

async function abrirDialogoDeFrontend(user) {
  const frontend = await perfil("Desarrolladora frontend");
  const boton = await within(frontend).findByRole("button", { name: "Postularme" });
  await user.click(boton);
  return { boton, dialogo: screen.getByRole("dialog") };
}

describe("ver el proyecto", () => {
  test("cambiar el id descarta el detalle y el diálogo anteriores mientras carga", async () => {
    let responderSegundo;
    const segundo = new Promise((resolve) => {
      responderSegundo = resolve;
    });
    const responder = transporte.getMockImplementation();
    transporte.mockImplementation(async (config) =>
      config.url === "/proyectos/p2"
        ? respuesta(config, await segundo)
        : responder(config),
    );
    const { router, user } = montar("/proyectos/p1", COLABORADORA);
    await abrirDialogoDeFrontend(user);

    await act(async () => router.navigate("/proyectos/p2"));
    expect(screen.queryByText(proyecto.titulo)).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    responderSegundo({ ...proyecto, id: "p2", titulo: "Segundo proyecto" });
    expect(
      await screen.findByRole("heading", { name: "Segundo proyecto" }),
    ).toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("agrupa abiertos e histórico sin alterar el orden y permite desplegarlo", async () => {
    proyecto.perfiles[0].limiteColaboraciones = 2;
    const { user } = montar("/proyectos/p1");
    await perfil("Analista de datos");
    const historico = screen
      .getByText("Perfiles que ya no reciben postulaciones (2)")
      .closest("details");
    expect(historico).not.toHaveAttribute("open");
    expect(
      within(historico)
        .getAllByRole("article")
        .map((el) => el.getAttribute("aria-labelledby")),
    ).toEqual(["perfil-pe1", "perfil-pe2"]);
    expect(within(historico).getByText("Límite alcanzado")).toBeInTheDocument();
    expect(within(historico).getByText("Cerrada")).toBeInTheDocument();
    await user.click(historico.querySelector("summary"));
    expect(historico).toHaveAttribute("open");
  });

  test.each(["ABIERTO", "FINALIZADO"])(
    "sin búsquedas abiertas permite consultar todos los perfiles: %s",
    async (estado) => {
      proyecto.estado = estado;
      proyecto.perfiles.forEach((perfil) => {
        perfil.busquedaAbierta = false;
      });
      montar("/proyectos/p1");
      const historico = (
        await screen.findByText("Perfiles que ya no reciben postulaciones (3)")
      ).closest("details");
      expect(historico).toHaveAttribute("open");
      expect(
        screen.getByText(
          estado === "FINALIZADO"
            ? "Este proyecto ya finalizó. Podés consultar sus perfiles."
            : "No hay perfiles con búsqueda abierta.",
        ),
      ).toBeVisible();
    },
  );

  test("el histórico conserva la postulación propia", async () => {
    postulacionesDeCo1 = [
      {
        proyectoId: "p1",
        colaboracion: { id: "x", perfil: "pe2", estado: "ACEPTADA", esPublica: true },
      },
    ];
    const { user } = montar("/proyectos/p1", COLABORADORA);
    const resumen = await screen.findByText(
      "Perfiles que ya no reciben postulaciones (1)",
    );
    await user.click(resumen);
    expect(
      await within(resumen.closest("details")).findByText("Tu postulación fue aceptada"),
    ).toBeVisible();
  });
  test("muestra el encabezado, el avance y los enlaces", async () => {
    montar("/proyectos/p1");
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Sistema de turnos del comedor",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByText("Abierto").length).toBeGreaterThan(0);
    expect(screen.getByText(/Publicado el/)).toHaveTextContent("3 de noviembre de 2026");
    expect(
      within(screen.getByRole("list", { name: "Etiquetas" })).getByText("salud"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Una app para ordenar las entregas\./)).toBeInTheDocument();
    expect(screen.getByLabelText("Avance: 40 %")).toHaveAttribute("value", "40");
    expect(screen.getByRole("link", { name: /Ver el sistema/ })).toHaveAttribute(
      "href",
      "https://turnos.example.org",
    );
    expect(screen.getByRole("link", { name: /Ver el repositorio/ })).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(screen.getByRole("link", { name: "Volver a la búsqueda" })).toHaveAttribute(
      "href",
      "/proyectos",
    );
  });

  test("cada perfil muestra sello, habilidades agrupadas, datos y quiénes colaboran", async () => {
    montar("/proyectos/p1");
    const frontend = await perfil("Desarrolladora frontend");
    expect(within(frontend).getByText("Abierta hasta el 30/11")).toBeInTheDocument();
    const requeridas = within(frontend).getByRole("list", { name: "Requeridas" });
    expect(within(requeridas).getByText("React")).toBeInTheDocument();
    expect(within(requeridas).getByText("CSS")).toBeInTheDocument();
    const opcionales = within(frontend).getByRole("list", { name: "Opcionales" });
    expect(within(opcionales).getByText(/Figma/)).toBeInTheDocument();
    expect(within(frontend).getByText("5 h por mes")).toBeInTheDocument();
    expect(
      within(frontend).getByText("Colaboración sin remuneración"),
    ).toBeInTheDocument();
    expect(within(frontend).getByText("Hasta 3 colaboraciones")).toBeInTheDocument();
    expect(within(frontend).getByText("1 vacante disponible")).toBeInTheDocument();
    expect(
      within(frontend).getByText("El colectivo revisa cada postulación"),
    ).toBeInTheDocument();
    expect(within(frontend).getByRole("link", { name: "Ana" })).toHaveAttribute(
      "href",
      "/colaboradoras/co9",
    );
    expect(within(frontend).getByText("Contribución anónima")).toBeInTheDocument();
    expect(within(frontend).queryByText("Pendiente")).not.toBeInTheDocument();

    const tester = await perfil("Tester");
    expect(within(tester).getByText("Cerrada")).toBeInTheDocument();
    expect(within(tester).getByText("Sin límite")).toBeInTheDocument();
    expect(
      within(tester).getByText("Todavía nadie ocupa este perfil."),
    ).toBeInTheDocument();
    expect(within(tester).queryByRole("list", { name: "Opcionales" })).toBeNull();
  });

  test("muestra los logros y el historial sin inventar un porcentaje general", async () => {
    delete proyecto.porcentajeConcrecion;
    proyecto.logros = [{ id: "l1", titulo: "Primer relevamiento", fecha: "2026-11-03" }];
    proyecto.avances = [{ id: "a1", porcentajeConcrecion: 25, fecha: "2026-11-03" }];
    const { user } = montar("/proyectos/p1");
    const avance = await screen.findByRole("region", { name: "Avance del proyecto" });
    expect(within(avance).getByText("Primer relevamiento")).toBeVisible();
    expect(within(avance).queryByRole("progressbar")).not.toBeInTheDocument();
    await user.click(within(avance).getByText("Historial de avances (1)"));
    expect(within(avance).getByText("Avance registrado: 25 %")).toBeVisible();
  });

  test("los niveles de título van en orden", async () => {
    montar("/proyectos/p1");
    await perfil("Tester");
    const niveles = screen
      .getAllByRole("heading")
      .map((titulo) => Number(titulo.tagName.slice(1)));
    for (let i = 1; i < niveles.length; i += 1) {
      expect(niveles[i] - niveles[i - 1]).toBeLessThanOrEqual(1);
    }
    expect(
      screen.getByRole("heading", { level: 2, name: "Perfiles del proyecto" }),
    ).toBeInTheDocument();
  });

  test("con sesión de colaboradora marca las habilidades que tiene", async () => {
    montar("/proyectos/p1", COLABORADORA);
    const frontend = await perfil("Desarrolladora frontend");
    expect(await within(frontend).findByText(". La tenés")).toBeInTheDocument();
  });

  test("la descripción con Markdown se ve con formato y sus enlaces avisan", async () => {
    proyecto.descripcion =
      "Necesitamos:\n\n- Turnos\n- **Avisos**\n\nMás info en [el sitio](https://comedor.org).";
    montar("/proyectos/p1");
    const sobre = await screen.findByRole("region", { name: "Sobre este proyecto" });
    expect(await within(sobre).findByRole("list")).toHaveTextContent(/Turnos\s*Avisos/);
    expect(within(sobre).getByText("Avisos").tagName).toBe("STRONG");
    expect(
      within(sobre).getByRole("link", {
        name: /^el sitio\s*\(se abre en otra pestaña\)$/,
      }),
    ).toHaveAttribute("href", "https://comedor.org");
  });

  test("un proyecto sin perfiles lo explica", async () => {
    proyecto.perfiles = [];
    montar("/proyectos/p1");
    expect(
      await screen.findByText("Este proyecto todavía no cargó perfiles."),
    ).toBeInTheDocument();
  });

  test("un proyecto finalizado no ofrece postularse", async () => {
    proyecto.estado = "FINALIZADO";
    montar("/proyectos/p1", COLABORADORA);
    const frontend = await perfil("Desarrolladora frontend");
    expect(within(frontend).getByText("Finalizado")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Postularme" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /postularme/i })).not.toBeInTheDocument();
  });

  test("un proyecto que no existe lleva de vuelta a la búsqueda", async () => {
    transporte.mockImplementationOnce(async (config) =>
      falla(config, 404, { message: "No existe." }),
    );
    montar("/proyectos/nada");
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "No encontramos este proyecto",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver a la búsqueda" })).toHaveAttribute(
      "href",
      "/proyectos",
    );
  });

  test("si falla ofrece Reintentar", async () => {
    transporte.mockImplementationOnce(async (config) => falla(config, 500));
    const { user } = montar("/proyectos/p1");
    expect(await screen.findByText("No pudimos cargar el proyecto")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Sistema de turnos del comedor",
      }),
    ).toBeInTheDocument();
  });
});

describe("quién ve qué acción", () => {
  test("el visitante va a /login y el ingreso vuelve a este proyecto", async () => {
    const { user, router } = montar("/proyectos/p1");
    const frontend = await perfil("Desarrolladora frontend");
    await user.click(
      within(frontend).getByRole("link", { name: "Ingresar para postularme" }),
    );
    expect(await screen.findByRole("heading", { name: "Ingresar" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/login");
    expect(router.state.location.state.desde).toEqual({
      pathname: "/proyectos/p1",
      search: "",
      hash: "",
    });
  });

  test("la cuenta sin perfil va a elegir su tipo de cuenta", async () => {
    montar("/proyectos/p1", SIN_PERFIL);
    const frontend = await perfil("Desarrolladora frontend");
    expect(
      await within(frontend).findByRole("link", { name: "Completar mi perfil" }),
    ).toHaveAttribute("href", "/bienvenida");
  });

  test("el colectivo no ve Postularme", async () => {
    montar("/proyectos/p1", COLECTIVO);
    await perfil("Desarrolladora frontend");
    await waitFor(() =>
      expect(screen.queryByRole("link", { name: /postularme/i })).not.toBeInTheDocument(),
    );
    expect(screen.queryByRole("button", { name: "Postularme" })).not.toBeInTheDocument();
  });

  test("un perfil cerrado deshabilita Postularme y explica el motivo", async () => {
    montar("/proyectos/p1", COLABORADORA);
    const tester = await perfil("Tester");
    const boton = await within(tester).findByRole("button", { name: "Postularme" });
    expect(boton).toBeDisabled();
    expect(boton).toHaveAccessibleDescription("La búsqueda de este perfil está cerrada.");
  });

  test("un perfil con el límite alcanzado lo dice", async () => {
    proyecto.perfiles[0].limiteColaboraciones = 2;
    montar("/proyectos/p1", COLABORADORA);
    const frontend = await perfil("Desarrolladora frontend");
    expect(
      await within(frontend).findByText(
        "Este perfil ya completó su límite de colaboraciones.",
      ),
    ).toBeInTheDocument();
    expect(within(frontend).getByRole("button", { name: "Postularme" })).toBeDisabled();
  });

  test("con una postulación ve su estado en ese perfil y puede postularse a los otros", async () => {
    postulacionesDeCo1 = [
      {
        proyectoId: "p1",
        colaboracion: { id: "x", perfil: "pe1", estado: "PENDIENTE", esPublica: true },
      },
      {
        proyectoId: "otro",
        colaboracion: { id: "y", perfil: "pe3", estado: "ACEPTADA", esPublica: true },
      },
    ];
    montar("/proyectos/p1", COLABORADORA);
    const frontend = await perfil("Desarrolladora frontend");
    expect(
      await within(frontend).findByText("Tu postulación está pendiente"),
    ).toBeInTheDocument();
    expect(within(frontend).queryByRole("button", { name: "Postularme" })).toBeNull();
    const analista = await perfil("Analista de datos");
    expect(within(analista).getByRole("button", { name: "Postularme" })).toBeEnabled();
  });

  test.each([
    ["ACEPTADA", "Tu postulación fue aceptada"],
    ["RECHAZADA", "Tu postulación fue rechazada"],
  ])("la postulación %s se muestra con texto", async (estado, texto) => {
    postulacionesDeCo1 = [
      {
        proyectoId: "p1",
        colaboracion: { id: "x", perfil: "pe3", estado, esPublica: true },
      },
    ];
    montar("/proyectos/p1", COLABORADORA);
    const analista = await perfil("Analista de datos");
    expect(await within(analista).findByText(texto)).toBeInTheDocument();
  });

  test("si fallan las postulaciones propias igual se muestran los botones", async () => {
    transporte.mockImplementation(async (config) => {
      if (config.url === "/colaboradores/co1/colaboraciones") return falla(config, 500);
      if (config.url === "/proyectos/p1") return respuesta(config, proyecto);
      return respuesta(config, { id: "co1", habilidades: [] });
    });
    montar("/proyectos/p1", COLABORADORA);
    const analista = await perfil("Analista de datos");
    expect(
      await within(analista).findByRole("button", { name: "Postularme" }),
    ).toBeEnabled();
  });
});

describe("postularse", () => {
  test("al llenar vacantes el diálogo avisa que se comparte el contacto al enviar", async () => {
    proyecto.perfiles[0].modoAceptacion = "HASTA_LLENAR_VACANTES";
    const { user } = montar("/proyectos/p1", COLABORADORA);
    const { dialogo } = await abrirDialogoDeFrontend(user);
    expect(dialogo).toHaveTextContent(
      "Este perfil acepta automáticamente: al enviar, el colectivo va a ver tus datos de contacto.",
    );
    expect(dialogo).not.toHaveTextContent("solo si el colectivo acepta");
  });

  test("abre un diálogo con foco en Cancelar y avisa que el contacto se comparte al aceptar", async () => {
    const { user } = montar("/proyectos/p1", COLABORADORA);
    const { dialogo } = await abrirDialogoDeFrontend(user);
    expect(dialogo).toHaveAccessibleName("¿Te postulás a este perfil?");
    expect(dialogo).toHaveAccessibleDescription(
      "Desarrolladora frontend Proyecto: Sistema de turnos del comedor.",
    );
    expect(within(dialogo).getByRole("button", { name: "Cancelar" })).toHaveFocus();
    expect(within(dialogo).getByRole("radio", { name: "Con mi nombre" })).toBeChecked();
    expect(
      within(dialogo).getByText(
        "Tus datos de contacto se comparten solo si el colectivo acepta tu postulación.",
      ),
    ).toBeInTheDocument();
    expect(dialogo).not.toHaveTextContent("Esta acción no se puede deshacer.");
  });

  test("Cancelar y Esc cierran y devuelven el foco a Postularme", async () => {
    const { user } = montar("/proyectos/p1", COLABORADORA);
    const { boton } = await abrirDialogoDeFrontend(user);
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(boton).toHaveFocus();

    await user.click(boton);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(boton).toHaveFocus();
    expect(
      transporte.mock.calls.filter(([config]) => config.method === "post"),
    ).toHaveLength(0);
  });

  test("envía con el nombre, avisa y muestra el estado en el perfil", async () => {
    const { user } = montar("/proyectos/p1", COLABORADORA);
    await abrirDialogoDeFrontend(user);
    await user.click(screen.getByRole("button", { name: "Enviar postulación" }));

    expect(
      await screen.findByText("Te postulaste. El colectivo va a revisar tu postulación."),
    ).toBeInTheDocument();
    const envio = transporte.mock.calls
      .map(([config]) => config)
      .find((config) => config.method === "post");
    expect(JSON.parse(envio.data)).toEqual({
      colaboradorId: "co1",
      perfilId: "pe1",
      esPublica: true,
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const frontend = await perfil("Desarrolladora frontend");
    expect(
      await within(frontend).findByText("Tu postulación está pendiente"),
    ).toBeInTheDocument();
    expect(within(frontend).queryByRole("button", { name: "Postularme" })).toBeNull();
  });

  test.each(["/proyectos/p1", "/colaboradores/co1/colaboraciones"])(
    "si falla %s después del POST, conserva el detalle y reintenta solo esa lectura",
    async (rutaConFallo) => {
      let postGuardado = false;
      let intentosDeLectura = 0;
      let terminarLectura;
      const lecturaPendiente = new Promise((resolve) => {
        terminarLectura = resolve;
      });
      const original = transporte.getMockImplementation();
      transporte.mockImplementation(async (config) => {
        if (config.method === "post") {
          const resultado = await original(config);
          postGuardado = true;
          return resultado;
        }
        if (postGuardado && config.url === rutaConFallo) {
          intentosDeLectura += 1;
          if (intentosDeLectura === 1) {
            await lecturaPendiente;
            return falla(config, 500);
          }
          if (rutaConFallo.endsWith("/colaboraciones")) {
            postulacionesDeCo1[0].colaboracion.estado = "ACEPTADA";
          }
        }
        return original(config);
      });

      const { user } = montar("/proyectos/p1", COLABORADORA);
      await abrirDialogoDeFrontend(user);
      await user.click(screen.getByRole("button", { name: "Enviar postulación" }));
      const frontend = await perfil("Desarrolladora frontend");
      expect(
        await within(frontend).findByText("Tu postulación está pendiente"),
      ).toBeVisible();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(
        within(frontend).queryByRole("button", { name: "Postularme" }),
      ).not.toBeInTheDocument();

      terminarLectura();
      const aviso = await screen.findByText(
        "Tu postulación se registró. No pudimos actualizar el estado.",
      );
      expect(screen.getByRole("heading", { name: proyecto.titulo })).toBeVisible();
      expect(within(frontend).getByText("Tu postulación está pendiente")).toBeVisible();

      const llamadasAntesDelReintento = transporte.mock.calls.length;
      await user.click(screen.getByRole("button", { name: "Actualizar estado" }));
      await waitFor(() => expect(aviso).not.toBeInTheDocument());
      expect(
        transporte.mock.calls
          .slice(llamadasAntesDelReintento)
          .map(([{ method, url }]) => [method, url]),
      ).toEqual([["get", rutaConFallo]]);
      expect(
        transporte.mock.calls.filter(([config]) => config.method === "post"),
      ).toHaveLength(1);
      const estadoActualizado = rutaConFallo.endsWith("/colaboraciones")
        ? "Tu postulación fue aceptada"
        : "Tu postulación está pendiente";
      expect(within(frontend).getByText(estadoActualizado)).toBeVisible();
    },
  );

  test("el título del diálogo es corto aunque la descripción del perfil sea larga", async () => {
    proyecto.perfiles[0].descripcion = "Desarrollo de la API de donaciones. "
      .repeat(8)
      .trim();
    const { user } = montar("/proyectos/p1", COLABORADORA);
    const frontend = await screen.findByRole("article", {
      name: proyecto.perfiles[0].descripcion,
    });
    await user.click(within(frontend).getByRole("button", { name: "Postularme" }));
    const dialogo = screen.getByRole("dialog");
    expect(dialogo).toHaveAccessibleName("¿Te postulás a este perfil?");
    expect(dialogo).toHaveAccessibleDescription(
      expect.stringContaining(proyecto.perfiles[0].descripcion),
    );
  });

  test("al postularse con el teclado, el foco queda en el estado de la postulación", async () => {
    const { user } = montar("/proyectos/p1", COLABORADORA);
    const frontend = await perfil("Desarrolladora frontend");
    const boton = await within(frontend).findByRole("button", { name: "Postularme" });
    boton.focus();
    await user.keyboard("{Enter}");
    expect(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Cancelar" }),
    ).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Enviar postulación" })).toHaveFocus();
    await user.keyboard("{Enter}");

    const estado = await within(frontend).findByText("Tu postulación está pendiente");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    const destino = estado.closest('[tabindex="-1"]');
    expect(destino).not.toBeNull();
    expect(destino).toHaveFocus();
  });

  test("puede elegir una contribución anónima", async () => {
    const original = transporte.getMockImplementation();
    transporte.mockImplementation(async (config) => {
      if (config.url === "/colaboradores/co1/colaboraciones") {
        return respuesta(
          config,
          postulacionesDeCo1.filter(({ colaboracion }) => colaboracion.esPublica),
        );
      }
      return original(config);
    });
    const { user } = montar("/proyectos/p1", COLABORADORA);
    await abrirDialogoDeFrontend(user);
    await user.click(screen.getByRole("radio", { name: "Contribución anónima" }));
    await user.click(screen.getByRole("button", { name: "Enviar postulación" }));
    await screen.findByText("Te postulaste. El colectivo va a revisar tu postulación.");
    const envio = transporte.mock.calls
      .map(([config]) => config)
      .find((config) => config.method === "post");
    expect(JSON.parse(envio.data).esPublica).toBe(false);
    const frontend = await perfil("Desarrolladora frontend");
    expect(
      await within(frontend).findByText("Tu postulación está pendiente"),
    ).toBeVisible();
    expect(
      within(frontend).queryByRole("button", { name: "Postularme" }),
    ).not.toBeInTheDocument();
  });

  test("si al postularse el perfil pasa al histórico, lo abre y enfoca la confirmación visible", async () => {
    respuestaAlPostular = { estado: "ACEPTADA" };
    let postGuardado = false;
    let terminarLectura;
    const lecturaPendiente = new Promise((resolve) => {
      terminarLectura = resolve;
    });
    const original = transporte.getMockImplementation();
    transporte.mockImplementation(async (config) => {
      if (postGuardado && config.url === "/proyectos/p1") await lecturaPendiente;
      const resultado = await original(config);
      if (config.method === "post") {
        postGuardado = true;
        proyecto = {
          ...proyecto,
          perfiles: proyecto.perfiles.map((perfil) =>
            perfil.id === "pe1" ? { ...perfil, busquedaAbierta: false } : perfil,
          ),
        };
      }
      return resultado;
    });
    const { user } = montar("/proyectos/p1", COLABORADORA);
    await abrirDialogoDeFrontend(user);
    await user.click(screen.getByRole("button", { name: "Enviar postulación" }));
    const primeraConfirmacion = await screen.findByText("Tu postulación fue aceptada");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(primeraConfirmacion.closest("details")).toBeNull();
    expect(primeraConfirmacion.closest('[tabindex="-1"]')).toHaveFocus();

    terminarLectura();
    await waitFor(() => {
      const confirmacion = screen.getByText("Tu postulación fue aceptada");
      expect(confirmacion.closest("details")).toHaveAttribute("open");
      expect(confirmacion).toBeVisible();
      expect(confirmacion.closest('[tabindex="-1"]')).toHaveFocus();
    });
  });

  test("si el perfil la acepta sola lo dice", async () => {
    respuestaAlPostular = { estado: "ACEPTADA" };
    const { user } = montar("/proyectos/p1", COLABORADORA);
    await abrirDialogoDeFrontend(user);
    await user.click(screen.getByRole("button", { name: "Enviar postulación" }));
    expect(
      await screen.findByText("Listo: ya sos parte de este perfil."),
    ).toBeInTheDocument();
  });

  test.each([
    [409, "Ya te postulaste a este perfil.", "Ya te postulaste a este proyecto."],
    [
      400,
      "No cumplís las habilidades requeridas.",
      "No pudimos registrar tu postulación. Puede que la búsqueda de este perfil ya haya cerrado.",
    ],
  ])(
    "si el back responde %i deja el diálogo abierto con un mensaje propio, no el del back",
    async (status, textoDelBack, message) => {
      respuestaAlPostular = { status, data: { message: textoDelBack } };
      const { user } = montar("/proyectos/p1", COLABORADORA);
      const { boton } = await abrirDialogoDeFrontend(user);
      await user.click(screen.getByRole("button", { name: "Enviar postulación" }));

      const dialogo = screen.getByRole("dialog");
      const alerta = await within(dialogo).findByRole("alert");
      expect(alerta).toHaveTextContent(message);
      expect(alerta).not.toHaveTextContent(textoDelBack);
      expect(
        within(dialogo).getByRole("button", { name: "Enviar postulación" }),
      ).toBeEnabled();
      expect(within(dialogo).getByRole("button", { name: "Cancelar" })).toBeEnabled();

      await user.click(within(dialogo).getByRole("button", { name: "Cancelar" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(boton).toHaveFocus();

      await user.click(boton);
      expect(within(screen.getByRole("dialog")).queryByRole("alert")).toBeNull();
    },
  );

  test("mientras envía muestra Enviando… y bloquea el diálogo", async () => {
    let terminar;
    const respuestaNormal = transporte.getMockImplementation();
    transporte.mockImplementation((config) =>
      config.method === "post"
        ? new Promise((resolve) => {
            terminar = () => resolve(respuesta(config, { estado: "PENDIENTE" }, 201));
          })
        : respuestaNormal(config),
    );
    const { user } = montar("/proyectos/p1", COLABORADORA);
    await abrirDialogoDeFrontend(user);
    await user.click(screen.getByRole("button", { name: "Enviar postulación" }));
    const enviando = await screen.findByRole("button", { name: "Enviando…" });
    expect(enviando).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    await user.keyboard("{Escape}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    terminar();
    await screen.findByText("Te postulaste. El colectivo va a revisar tu postulación.");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});

describe("búsqueda, detalle y postulación", () => {
  test("una colaboradora recorre el camino completo", async () => {
    const { user, router } = montar("/proyectos?vista=todos", COLABORADORA);

    await screen.findByText("1 proyecto encontrado");
    await user.click(screen.getByRole("link", { name: "Sistema de turnos del comedor" }));
    expect(router.state.location.pathname).toBe("/proyectos/p1");

    const { boton } = await abrirDialogoDeFrontend(user);
    expect(boton).toBeEnabled();
    await user.click(screen.getByRole("radio", { name: "Contribución anónima" }));
    await user.click(screen.getByRole("button", { name: "Enviar postulación" }));
    expect(
      await screen.findByText("Te postulaste. El colectivo va a revisar tu postulación."),
    ).toBeInTheDocument();
    const frontend = await perfil("Desarrolladora frontend");
    expect(
      await within(frontend).findByText("Tu postulación está pendiente"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Volver a la búsqueda" }));
    expect(router.state.location.pathname).toBe("/proyectos");
    expect(router.state.location.search).toBe("?vista=todos");
    expect(await screen.findByText("1 proyecto encontrado")).toBeInTheDocument();
  });

  test("de la tarjeta al detalle, el foco llega al título aunque el proyecto tarde en cargar", async () => {
    const original = transporte.getMockImplementation();
    transporte.mockImplementation(async (config) => {
      if (config.method === "get" && config.url === "/proyectos/p1")
        await new Promise((resolver) => setTimeout(resolver, 80));
      return original(config);
    });
    const { user } = montar("/proyectos");
    await user.click(
      await screen.findByRole("link", { name: "Sistema de turnos del comedor" }),
    );
    const titulo = await screen.findByRole("heading", {
      level: 1,
      name: "Sistema de turnos del comedor",
    });
    await waitFor(() => expect(titulo).toHaveFocus());
  });

  test("Volver a la búsqueda conserva la etiqueta", async () => {
    const { user, router } = montar("/proyectos?etiqueta=salud");
    await user.click(
      await screen.findByRole("link", { name: "Sistema de turnos del comedor" }),
    );
    await screen.findByRole("heading", { level: 1 });
    await user.click(screen.getByRole("link", { name: "Volver a la búsqueda" }));
    expect(router.state.location.search).toBe("?etiqueta=salud");
  });
});

describe("acción de cada perfil según quién mira", () => {
  test("un visitante ve un enlace a ingresar y por qué", async () => {
    montar("/proyectos/p1");
    const frontend = await perfil("Desarrolladora frontend");
    expect(
      within(frontend).getByRole("link", { name: "Ingresar para postularme" }),
    ).toHaveAttribute("href", "/login");
    expect(
      within(frontend).getByText("Ingresá como colaboradora para postularte."),
    ).toBeInTheDocument();
  });

  test("un colectivo en un proyecto ajeno ve una sola vez que las postulaciones son para colaboradoras", async () => {
    montar("/proyectos/p1", COLECTIVO);
    const frontend = await perfil("Desarrolladora frontend");
    const nota = await screen.findByText("Las postulaciones son para colaboradoras.");
    expect(screen.getAllByText("Las postulaciones son para colaboradoras.")).toHaveLength(
      1,
    );
    expect(frontend).not.toContainElement(nota);
    expect(
      nota.compareDocumentPosition(frontend) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      screen.queryByText("Este proyecto es de tu colectivo"),
    ).not.toBeInTheDocument();
    expect(
      within(frontend).queryByRole("button", { name: "Postularme" }),
    ).not.toBeInTheDocument();
  });

  test("un colectivo en su propio proyecto ve la franja de dueño y ninguna nota repetida", async () => {
    proyectosDelColectivo = [
      { id: "p1", titulo: "Sistema de turnos", estado: "ABIERTO" },
    ];
    montar("/proyectos/p1", COLECTIVO);
    await perfil("Desarrolladora frontend");
    expect(
      await screen.findByText("Este proyecto es de tu colectivo"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ir al panel del colectivo" }),
    ).toHaveAttribute("href", "/colectivo/resumen");
    expect(
      screen.queryByText("Las postulaciones son para colaboradoras."),
    ).not.toBeInTheDocument();
  });

  test("una colaboradora no ve la franja ni la nota de colectivo", async () => {
    montar("/proyectos/p1", COLABORADORA);
    await perfil("Desarrolladora frontend");
    await waitFor(() =>
      expect(
        screen.getAllByRole("button", { name: "Postularme" }).length,
      ).toBeGreaterThan(0),
    );
    expect(
      screen.queryByText("Este proyecto es de tu colectivo"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Las postulaciones son para colaboradoras."),
    ).not.toBeInTheDocument();
  });

  test("una colaboradora ve el encaje de cada perfil abierto", async () => {
    montar("/proyectos/p1", COLABORADORA);
    const frontend = await perfil("Desarrolladora frontend");
    expect(
      await within(frontend).findByText("Tenés 1 de 2 habilidades requeridas"),
    ).toBeInTheDocument();
  });

  test("una postulación rechazada se muestra con su sello", async () => {
    postulacionesDeCo1 = [
      {
        proyectoId: "p1",
        colaboracion: {
          id: "x",
          perfil: "pe1",
          estado: "RECHAZADA",
          esPublica: true,
          colaborador: { id: "co1", nombreFantasia: "Yo" },
        },
      },
    ];
    montar("/proyectos/p1", COLABORADORA);
    const frontend = await perfil("Desarrolladora frontend");
    expect(
      await within(frontend).findByText("Tu postulación fue rechazada"),
    ).toBeInTheDocument();
  });
});
