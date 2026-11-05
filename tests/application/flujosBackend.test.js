import axios from "axios";
import { crearHabilidadDependencies } from "../../src/Presentation/Dependencies/habilidadDependencies.js";
import { crearColectivoDependencies } from "../../src/Presentation/Dependencies/colectivoDependencies.js";
import { crearColaboradorDependencies } from "../../src/Presentation/Dependencies/colaboradorDependencies.js";
import { crearProyectoDependencies } from "../../src/Presentation/Dependencies/proyectoDependencies.js";
import { crearPerfilDependencies } from "../../src/Presentation/Dependencies/perfilDependencies.js";
import { crearColaboracionDependencies } from "../../src/Presentation/Dependencies/colaboracionDependencies.js";
import { crearValoracionDependencies } from "../../src/Presentation/Dependencies/valoracionDependencies.js";
import { crearReclutamientoDependencies } from "../../src/Presentation/Dependencies/reclutamientoDependencies.js";
import { crearNotificacionDependencies } from "../../src/Presentation/Dependencies/notificacionDependencies.js";
import { crearLogroDependencies } from "../../src/Presentation/Dependencies/logroDependencies.js";
import { crearAvanceDependencies } from "../../src/Presentation/Dependencies/avanceDependencies.js";
import { crearEstadisticaDependencies } from "../../src/Presentation/Dependencies/estadisticaDependencies.js";
import { crearTimelineDependencies } from "../../src/Presentation/Dependencies/timelineDependencies.js";
import { crearHealthDependencies } from "../../src/Presentation/Dependencies/healthDependencies.js";

const factories = {
  Habilidad: crearHabilidadDependencies,
  Colectivo: crearColectivoDependencies,
  Colaborador: crearColaboradorDependencies,
  Proyecto: crearProyectoDependencies,
  Perfil: crearPerfilDependencies,
  Colaboracion: crearColaboracionDependencies,
  Valoracion: crearValoracionDependencies,
  Reclutamiento: crearReclutamientoDependencies,
  Notificacion: crearNotificacionDependencies,
  Logro: crearLogroDependencies,
  Avance: crearAvanceDependencies,
  Estadistica: crearEstadisticaDependencies,
  Timeline: crearTimelineDependencies,
  Health: crearHealthDependencies,
};

// Contratos públicos de la API: verbos, paths, queries y bodies por operación.
const cases = [
  {
    module: "Habilidad",
    operation: "listarHabilidades",
    method: "get",
    url: "/habilidades",
    args: [
      {
        page: 2,
        limit: 5,
      },
    ],
    query: {
      page: 2,
      limit: 5,
    },
    empty: false,
  },
  {
    module: "Habilidad",
    operation: "crearHabilidad",
    method: "post",
    url: "/habilidades",
    args: [
      {
        titulo: "React",
        descripcion: "Interfaces",
      },
    ],
    body: {
      titulo: "React",
      descripcion: "Interfaces",
    },
    empty: false,
  },
  {
    module: "Colectivo",
    operation: "listarColectivos",
    method: "get",
    url: "/colectivos",
    args: [
      {
        page: 2,
        limit: 5,
        etiqueta: "educacion",
      },
    ],
    query: {
      page: 2,
      limit: 5,
      etiqueta: "educacion",
    },
    empty: false,
  },
  {
    module: "Colectivo",
    operation: "obtenerColectivo",
    method: "get",
    url: "/colectivos/colectivoId-1",
    args: ["colectivoId-1"],
    empty: false,
  },
  {
    module: "Colectivo",
    operation: "crearColectivo",
    method: "post",
    url: "/colectivos",
    args: [
      {
        nombre: "Colectivo",
        descripcion: "Software comunitario",
        tipoColectivo: "ONG",
        ubicacion: {
          tipoUbicacion: "CABA",
        },
        etiquetas: ["educacion"],
        redesSociales: [],
        mediosDeContacto: [],
      },
    ],
    body: {
      nombre: "Colectivo",
      descripcion: "Software comunitario",
      tipoColectivo: "ONG",
      ubicacion: {
        tipoUbicacion: "CABA",
      },
      etiquetas: ["educacion"],
      redesSociales: [],
      mediosDeContacto: [],
    },
    empty: false,
  },
  {
    module: "Colectivo",
    operation: "actualizarColectivo",
    method: "put",
    url: "/colectivos/colectivoId-1",
    args: [
      "colectivoId-1",
      {
        descripcion: "Nueva descripción",
        ubicacion: null,
      },
    ],
    body: {
      descripcion: "Nueva descripción",
      ubicacion: null,
    },
    empty: false,
  },
  {
    module: "Colectivo",
    operation: "darDeBajaColectivo",
    method: "post",
    url: "/colectivos/colectivoId-1/baja",
    args: ["colectivoId-1"],
    empty: false,
  },
  {
    module: "Colaborador",
    operation: "listarColaboradores",
    method: "get",
    url: "/colaboradores",
    args: [
      {
        page: 2,
        limit: 5,
      },
    ],
    query: {
      page: 2,
      limit: 5,
    },
    empty: false,
  },
  {
    module: "Colaborador",
    operation: "obtenerColaborador",
    method: "get",
    url: "/colaboradores/colaboradorId-1",
    args: ["colaboradorId-1"],
    empty: false,
  },
  {
    module: "Colaborador",
    operation: "crearColaborador",
    method: "post",
    url: "/colaboradores",
    args: [
      {
        cuentaGit: "persona",
        codigosHabilidades: ["react"],
        mediosDeContacto: [
          {
            tipo: "EMAIL",
            valor: "persona@example.com",
          },
        ],
      },
    ],
    body: {
      cuentaGit: "persona",
      codigosHabilidades: ["react"],
      mediosDeContacto: [
        {
          tipo: "EMAIL",
          valor: "persona@example.com",
        },
      ],
    },
    empty: false,
  },
  {
    module: "Colaborador",
    operation: "actualizarColaborador",
    method: "put",
    url: "/colaboradores/colaboradorId-1",
    args: [
      "colaboradorId-1",
      {
        presentacion: null,
        recibeMensajeriaInterna: false,
      },
    ],
    body: {
      presentacion: null,
      recibeMensajeriaInterna: false,
    },
    empty: false,
  },
  {
    module: "Colaborador",
    operation: "agregarPronombre",
    method: "post",
    url: "/colaboradores/colaboradorId-1/pronombres",
    args: [
      "colaboradorId-1",
      {
        pronombre: "elle",
      },
    ],
    body: {
      pronombre: "elle",
    },
    empty: false,
  },
  {
    module: "Colaborador",
    operation: "quitarPronombre",
    method: "delete",
    url: "/colaboradores/colaboradorId-1/pronombres/elle",
    args: ["colaboradorId-1", "elle"],
    empty: false,
  },
  {
    module: "Colaborador",
    operation: "agregarHabilidadAColaborador",
    method: "post",
    url: "/colaboradores/colaboradorId-1/habilidades",
    args: [
      "colaboradorId-1",
      {
        codigoHabilidad: "react",
      },
    ],
    body: {
      codigoHabilidad: "react",
    },
    empty: false,
  },
  {
    module: "Colaborador",
    operation: "quitarHabilidadDeColaborador",
    method: "delete",
    url: "/colaboradores/colaboradorId-1/habilidades/react",
    args: ["colaboradorId-1", "react"],
    empty: false,
  },
  {
    module: "Colaborador",
    operation: "agregarMedioDeContacto",
    method: "post",
    url: "/colaboradores/colaboradorId-1/medios-de-contacto",
    args: [
      "colaboradorId-1",
      {
        tipo: "EMAIL",
        valor: "persona@example.com",
      },
    ],
    body: {
      tipo: "EMAIL",
      valor: "persona@example.com",
    },
    empty: false,
  },
  {
    module: "Colaborador",
    operation: "quitarMedioDeContacto",
    method: "delete",
    url: "/colaboradores/colaboradorId-1/medios-de-contacto/EMAIL/persona%40example.com",
    args: ["colaboradorId-1", "EMAIL", "persona@example.com"],
    empty: true,
  },
  {
    module: "Proyecto",
    operation: "listarProyectos",
    method: "get",
    url: "/proyectos",
    args: [
      {
        page: 2,
        limit: 5,
        etiqueta: "educacion",
      },
    ],
    query: {
      page: 2,
      limit: 5,
      etiqueta: "educacion",
    },
    empty: false,
  },
  {
    module: "Proyecto",
    operation: "obtenerProyecto",
    method: "get",
    url: "/proyectos/proyectoId-1",
    args: ["proyectoId-1"],
    empty: false,
  },
  {
    module: "Proyecto",
    operation: "crearProyecto",
    method: "post",
    url: "/colectivos/colectivoId-1/proyectos",
    args: [
      "colectivoId-1",
      {
        titulo: "Proyecto",
        descripcion: "Portal",
        perfiles: [
          {
            descripcion: "Frontend",
            codigosHabilidadesRequeridas: ["react"],
            compromiso: {
              cantidadHoras: 4,
              periodo: "HS_SEMANALES",
            },
          },
        ],
        modoAceptacion: "REVISION_MANUAL",
        limiteVacantes: 2,
        fechaCierre: null,
      },
    ],
    body: {
      titulo: "Proyecto",
      descripcion: "Portal",
      perfiles: [
        {
          descripcion: "Frontend",
          codigosHabilidadesRequeridas: ["react"],
          compromiso: {
            cantidadHoras: 4,
            periodo: "HS_SEMANALES",
          },
        },
      ],
      modoAceptacion: "REVISION_MANUAL",
      limiteVacantes: 2,
      fechaCierre: null,
    },
    empty: false,
  },
  {
    module: "Proyecto",
    operation: "listarProyectosDeColectivo",
    method: "get",
    url: "/colectivos/colectivoId-1/proyectos",
    args: ["colectivoId-1"],
    empty: false,
  },
  {
    module: "Proyecto",
    operation: "actualizarProyecto",
    method: "put",
    url: "/proyectos/proyectoId-1",
    args: [
      "proyectoId-1",
      {
        limiteVacantes: null,
        fechaCierre: null,
      },
    ],
    body: {
      limiteVacantes: null,
      fechaCierre: null,
    },
    empty: false,
  },
  {
    module: "Proyecto",
    operation: "finalizarProyecto",
    method: "post",
    url: "/proyectos/proyectoId-1/finalizacion",
    args: ["proyectoId-1"],
    empty: false,
  },
  {
    module: "Perfil",
    operation: "listarPerfiles",
    method: "get",
    url: "/proyectos/proyectoId-1/perfiles",
    args: ["proyectoId-1"],
    empty: false,
  },
  {
    module: "Perfil",
    operation: "obtenerPerfil",
    method: "get",
    url: "/proyectos/proyectoId-1/perfiles/perfilId-1",
    args: ["proyectoId-1", "perfilId-1"],
    empty: false,
  },
  {
    module: "Perfil",
    operation: "crearPerfil",
    method: "post",
    url: "/proyectos/proyectoId-1/perfiles",
    args: [
      "proyectoId-1",
      {
        descripcion: "Frontend",
        codigosHabilidadesRequeridas: ["react"],
        compromiso: {
          cantidadHoras: 4,
          periodo: "HS_SEMANALES",
        },
      },
    ],
    body: {
      descripcion: "Frontend",
      codigosHabilidadesRequeridas: ["react"],
      compromiso: {
        cantidadHoras: 4,
        periodo: "HS_SEMANALES",
      },
    },
    empty: false,
  },
  {
    module: "Perfil",
    operation: "actualizarPerfil",
    method: "put",
    url: "/proyectos/proyectoId-1/perfiles/perfilId-1",
    args: [
      "proyectoId-1",
      "perfilId-1",
      {
        modalidadColaboracion: "GRATUITA",
      },
    ],
    body: {
      modalidadColaboracion: "GRATUITA",
    },
    empty: false,
  },
  {
    module: "Perfil",
    operation: "eliminarPerfil",
    method: "delete",
    url: "/proyectos/proyectoId-1/perfiles/perfilId-1",
    args: ["proyectoId-1", "perfilId-1"],
    empty: true,
  },
  {
    module: "Perfil",
    operation: "agregarHabilidadRequerida",
    method: "post",
    url: "/proyectos/proyectoId-1/perfiles/perfilId-1/habilidades-requeridas",
    args: [
      "proyectoId-1",
      "perfilId-1",
      {
        codigoHabilidad: "react",
      },
    ],
    body: {
      codigoHabilidad: "react",
    },
    empty: false,
  },
  {
    module: "Perfil",
    operation: "quitarHabilidadRequerida",
    method: "delete",
    url: "/proyectos/proyectoId-1/perfiles/perfilId-1/habilidades-requeridas/react",
    args: ["proyectoId-1", "perfilId-1", "react"],
    empty: false,
  },
  {
    module: "Perfil",
    operation: "agregarHabilidadOpcional",
    method: "post",
    url: "/proyectos/proyectoId-1/perfiles/perfilId-1/habilidades-opcionales",
    args: [
      "proyectoId-1",
      "perfilId-1",
      {
        codigoHabilidad: "react",
      },
    ],
    body: {
      codigoHabilidad: "react",
    },
    empty: false,
  },
  {
    module: "Perfil",
    operation: "quitarHabilidadOpcional",
    method: "delete",
    url: "/proyectos/proyectoId-1/perfiles/perfilId-1/habilidades-opcionales/react",
    args: ["proyectoId-1", "perfilId-1", "react"],
    empty: false,
  },
  {
    module: "Colaboracion",
    operation: "registrarColaboracion",
    method: "post",
    url: "/proyectos/proyectoId-1/colaboraciones",
    args: [
      "proyectoId-1",
      {
        colaboradorId: "persona",
        esPublica: false,
      },
    ],
    body: {
      colaboradorId: "persona",
      esPublica: false,
    },
    empty: false,
  },
  {
    module: "Colaboracion",
    operation: "listarColaboracionesDeProyecto",
    method: "get",
    url: "/proyectos/proyectoId-1/colaboraciones",
    args: ["proyectoId-1"],
    empty: false,
  },
  {
    module: "Colaboracion",
    operation: "listarColaboracionesDeColaborador",
    method: "get",
    url: "/colaboradores/colaboradorId-1/colaboraciones",
    args: ["colaboradorId-1"],
    empty: false,
  },
  {
    module: "Colaboracion",
    operation: "aceptarPostulacion",
    method: "post",
    url: "/proyectos/proyectoId-1/colaboraciones/colaboracionId-1/aceptacion",
    args: ["proyectoId-1", "colaboracionId-1"],
    empty: false,
  },
  {
    module: "Colaboracion",
    operation: "rechazarPostulacion",
    method: "post",
    url: "/proyectos/proyectoId-1/colaboraciones/colaboracionId-1/rechazo",
    args: ["proyectoId-1", "colaboracionId-1"],
    empty: false,
  },
  {
    module: "Colaboracion",
    operation: "finalizarColaboracion",
    method: "post",
    url: "/proyectos/proyectoId-1/colaboraciones/colaboracionId-1/finalizacion",
    args: ["proyectoId-1", "colaboracionId-1"],
    empty: false,
  },
  {
    module: "Valoracion",
    operation: "valorarColaboracion",
    method: "post",
    url: "/proyectos/proyectoId-1/colaboraciones/colaboracionId-1/valoraciones",
    args: [
      "proyectoId-1",
      "colaboracionId-1",
      {
        autor: "COLECTIVO",
        puntaje: 5,
        comentario: "Gran aporte",
      },
    ],
    body: {
      autor: "COLECTIVO",
      puntaje: 5,
      comentario: "Gran aporte",
    },
    empty: false,
  },
  {
    module: "Valoracion",
    operation: "obtenerValoracionesDeColectivo",
    method: "get",
    url: "/colectivos/colectivoId-1/valoraciones",
    args: ["colectivoId-1"],
    empty: false,
  },
  {
    module: "Valoracion",
    operation: "obtenerValoracionesDeColaborador",
    method: "get",
    url: "/colaboradores/colaboradorId-1/valoraciones",
    args: ["colaboradorId-1"],
    empty: false,
  },
  {
    module: "Reclutamiento",
    operation: "buscarColaboradorasPotenciales",
    method: "get",
    url: "/proyectos/proyectoId-1/perfiles/perfilId-1/colaboradoras-potenciales",
    args: [
      "proyectoId-1",
      "perfilId-1",
      {
        page: 2,
        limit: 5,
      },
    ],
    query: {
      page: 2,
      limit: 5,
    },
    empty: false,
  },
  {
    module: "Reclutamiento",
    operation: "buscarProyectosPotenciales",
    method: "get",
    url: "/colaboradores/colaboradorId-1/proyectos-potenciales",
    args: [
      "colaboradorId-1",
      {
        page: 2,
        limit: 5,
      },
    ],
    query: {
      page: 2,
      limit: 5,
    },
    empty: false,
  },
  {
    module: "Reclutamiento",
    operation: "invitarColaborador",
    method: "post",
    url: "/proyectos/proyectoId-1/perfiles/perfilId-1/invitaciones",
    args: [
      "proyectoId-1",
      "perfilId-1",
      {
        colaboradorId: "persona",
        mensaje: "Te invitamos",
      },
    ],
    body: {
      colaboradorId: "persona",
      mensaje: "Te invitamos",
    },
    empty: false,
  },
  {
    module: "Notificacion",
    operation: "listarNotificaciones",
    method: "get",
    url: "/colaboradores/colaboradorId-1/notificaciones",
    args: [
      "colaboradorId-1",
      {
        page: 2,
        limit: 5,
      },
    ],
    query: {
      page: 2,
      limit: 5,
    },
    empty: false,
  },
  {
    module: "Notificacion",
    operation: "marcarNotificacionComoLeida",
    method: "post",
    url: "/colaboradores/colaboradorId-1/notificaciones/notificacionId-1/lectura",
    args: ["colaboradorId-1", "notificacionId-1"],
    empty: false,
  },
  {
    module: "Logro",
    operation: "listarLogros",
    method: "get",
    url: "/proyectos/proyectoId-1/logros",
    args: ["proyectoId-1"],
    empty: false,
  },
  {
    module: "Logro",
    operation: "obtenerLogro",
    method: "get",
    url: "/proyectos/proyectoId-1/logros/logroId-1",
    args: ["proyectoId-1", "logroId-1"],
    empty: false,
  },
  {
    module: "Logro",
    operation: "crearLogro",
    method: "post",
    url: "/proyectos/proyectoId-1/logros",
    args: [
      "proyectoId-1",
      {
        titulo: "Primera entrega",
        descripcion: "Lista",
      },
    ],
    body: {
      titulo: "Primera entrega",
      descripcion: "Lista",
    },
    empty: false,
  },
  {
    module: "Logro",
    operation: "actualizarLogro",
    method: "put",
    url: "/proyectos/proyectoId-1/logros/logroId-1",
    args: [
      "proyectoId-1",
      "logroId-1",
      {
        titulo: "Nueva entrega",
        descripcion: "Actualizada",
      },
    ],
    body: {
      titulo: "Nueva entrega",
      descripcion: "Actualizada",
    },
    empty: false,
  },
  {
    module: "Logro",
    operation: "eliminarLogro",
    method: "delete",
    url: "/proyectos/proyectoId-1/logros/logroId-1",
    args: ["proyectoId-1", "logroId-1"],
    empty: true,
  },
  {
    module: "Avance",
    operation: "listarAvances",
    method: "get",
    url: "/proyectos/proyectoId-1/avances",
    args: ["proyectoId-1"],
    empty: false,
  },
  {
    module: "Avance",
    operation: "obtenerAvance",
    method: "get",
    url: "/proyectos/proyectoId-1/avances/avanceId-1",
    args: ["proyectoId-1", "avanceId-1"],
    empty: false,
  },
  {
    module: "Avance",
    operation: "registrarAvance",
    method: "post",
    url: "/proyectos/proyectoId-1/avances",
    args: [
      "proyectoId-1",
      {
        porcentajeConcrecion: 50,
        urlSistema: "https://example.com",
        urlRepositorio: "https://example.com/repo",
      },
    ],
    body: {
      porcentajeConcrecion: 50,
      urlSistema: "https://example.com",
      urlRepositorio: "https://example.com/repo",
    },
    empty: false,
  },
  {
    module: "Estadistica",
    operation: "obtenerEstadisticasGlobales",
    method: "get",
    url: "/estadisticas",
    args: [],
    empty: false,
  },
  {
    module: "Estadistica",
    operation: "obtenerEstadisticasDeColectivo",
    method: "get",
    url: "/colectivos/colectivoId-1/estadisticas",
    args: ["colectivoId-1"],
    empty: false,
  },
  {
    module: "Timeline",
    operation: "obtenerTimelineDeColectivo",
    method: "get",
    url: "/colectivos/colectivoId-1/timeline",
    args: ["colectivoId-1"],
    empty: false,
  },
  {
    module: "Health",
    operation: "consultarHealth",
    method: "get",
    url: "/health",
    args: [],
    empty: false,
  },
];

function respuesta(config, data, status = 200) {
  return { config, data, status, statusText: "OK", headers: {} };
}

function armarCliente(data, status = 200) {
  const adapter = vi.fn(async (config) => respuesta(config, data, status));
  const http = axios.create({ baseURL: "/api", adapter });
  return { http, adapter };
}

test.each(cases)(
  "$module.$operation usa el endpoint y request de backend",
  async (entry) => {
    const payload = entry.empty ? undefined : { datos: "JSON original de backend" };
    const { http, adapter } = armarCliente(payload, entry.empty ? 204 : 200);
    const dependencies = factories[entry.module](http);
    const controller = new AbortController();
    const result = await dependencies[entry.operation](...entry.args, {
      signal: controller.signal,
    });
    expect(adapter).toHaveBeenCalledTimes(1);
    const config = adapter.mock.calls[0][0];
    expect(config).toMatchObject({
      baseURL: "/api",
      method: entry.method,
      url: entry.url,
      signal: controller.signal,
    });
    expect(config.params).toEqual(entry.query);
    expect(config.data === undefined ? undefined : JSON.parse(config.data)).toEqual(
      entry.body,
    );
    expect(result).toBe(payload);
  },
);

test("codifica todos los segmentos dinámicos, incluidos contacto, pronombre e ids anidados", async () => {
  const { http, adapter } = armarCliente(undefined, 204);
  const colaborador = crearColaboradorDependencies(http);
  await colaborador.quitarMedioDeContacto("persona/1", "EMAIL", "a+b@example.com/?#");
  expect(adapter.mock.lastCall[0].url).toBe(
    "/colaboradores/persona%2F1/medios-de-contacto/EMAIL/a%2Bb%40example.com%2F%3F%23",
  );
  await colaborador.quitarPronombre("persona/1", "él/elle");
  expect(adapter.mock.lastCall[0].url).toBe(
    "/colaboradores/persona%2F1/pronombres/%C3%A9l%2Felle",
  );
  await crearPerfilDependencies(http).quitarHabilidadRequerida(
    "proyecto/1",
    "perfil?2",
    "c++/node",
  );
  expect(adapter.mock.lastCall[0].url).toBe(
    "/proyectos/proyecto%2F1/perfiles/perfil%3F2/habilidades-requeridas/c%2B%2B%2Fnode",
  );
});

test("conserva el sobre paginado, habilidades embebidas y campos anónimos sin adaptación", async () => {
  const payload = {
    data: [
      {
        id: "proyecto",
        vacantesLibres: 1,
        perfiles: [
          { id: "perfil", habilidadesRequeridas: [{ codigo: "react", titulo: "React" }] },
        ],
        colaboraciones: [{ id: "colaboracion", colaborador: null, esPublica: false }],
      },
    ],
    meta: { page: 1, per_page: 10, total: 1, total_pages: 1 },
  };
  const { http, adapter } = armarCliente(payload);
  const result = await crearProyectoDependencies(http).listarProyectos();
  expect(result).toBe(payload);
  expect(result.data[0].colaboraciones[0].colaborador).toBeNull();
  expect(adapter.mock.lastCall[0].params).toEqual({});
});

test("distingue listas simples, resúmenes de valoración, timeline y estadísticas", async () => {
  const values = [
    { module: "Logro", operation: "listarLogros", args: ["proyecto"], data: [] },
    {
      module: "Colaboracion",
      operation: "listarColaboracionesDeColaborador",
      args: ["persona"],
      data: [
        { proyectoId: "proyecto", colaboracion: { id: "aporte", colaborador: null } },
      ],
    },
    {
      module: "Valoracion",
      operation: "obtenerValoracionesDeColectivo",
      args: ["colectivo"],
      data: { cantidad: 0, promedio: null, valoraciones: [] },
    },
    {
      module: "Timeline",
      operation: "obtenerTimelineDeColectivo",
      args: ["colectivo"],
      data: [{ tipo: "ALTA_DEL_COLECTIVO", fecha: "2026-01-01T00:00:00.000Z" }],
    },
    {
      module: "Estadistica",
      operation: "obtenerEstadisticasGlobales",
      args: [],
      data: { colectivos: { total: 0 }, generadoEn: "2026-01-01T00:00:00.000Z" },
    },
  ];
  for (const entry of values) {
    const { http } = armarCliente(entry.data);
    expect(await factories[entry.module](http)[entry.operation](...entry.args)).toBe(
      entry.data,
    );
  }
});

test("propaga el error de backend con status y detalles de validación", async () => {
  const http = axios.create({
    adapter: async (config) => {
      throw new axios.AxiosError(
        "Validación",
        "ERR_BAD_REQUEST",
        config,
        null,
        respuesta(
          config,
          {
            message: "Datos invalidos",
            issues: [
              {
                path: ["perfiles"],
                message: "Debe incluir un perfil",
                code: "too_small",
              },
            ],
          },
          400,
        ),
      );
    },
  });
  await expect(
    crearProyectoDependencies(http).crearProyecto("colectivo", { titulo: "Proyecto" }),
  ).rejects.toMatchObject({
    response: {
      status: 400,
      data: {
        message: "Datos invalidos",
        issues: [expect.objectContaining({ path: ["perfiles"] })],
      },
    },
  });
});

test("no reintenta ni oculta conflictos al postularse", async () => {
  const adapter = vi.fn(async (config) => {
    throw new axios.AxiosError(
      "Conflict",
      "ERR_BAD_REQUEST",
      config,
      null,
      respuesta(config, { message: "Sin vacantes" }, 409),
    );
  });
  const dependencies = crearColaboracionDependencies(axios.create({ adapter }));
  await expect(
    dependencies.registrarColaboracion("proyecto", { colaboradorId: "persona" }),
  ).rejects.toMatchObject({ response: { status: 409 } });
  expect(adapter).toHaveBeenCalledTimes(1);
});

test("propaga cancelación sin iniciar transporte si la señal ya está cancelada", async () => {
  const { http, adapter } = armarCliente({});
  const controller = new AbortController();
  controller.abort();
  await expect(
    crearReclutamientoDependencies(http).buscarColaboradorasPotenciales(
      "proyecto",
      "perfil",
      {},
      { signal: controller.signal },
    ),
  ).rejects.toMatchObject({ code: "ERR_CANCELED" });
  expect(adapter).not.toHaveBeenCalled();
});

test("permite cancelar una consulta en vuelo", async () => {
  let terminar;
  const adapter = vi.fn(
    (config) =>
      new Promise((resolve) => {
        terminar = () => resolve(respuesta(config, []));
      }),
  );
  const controller = new AbortController();
  const promise = crearTimelineDependencies(
    axios.create({ adapter }),
  ).obtenerTimelineDeColectivo("colectivo", { signal: controller.signal });
  controller.abort();
  terminar();
  await expect(promise).rejects.toMatchObject({ code: "ERR_CANCELED" });
});

test("cada composición usa su instancia HTTP sin mezclar dependencias", async () => {
  const first = armarCliente({ id: "primero" });
  const second = armarCliente({ id: "segundo" });
  expect(
    await crearColectivoDependencies(first.http).obtenerColectivo("colectivo"),
  ).toEqual({ id: "primero" });
  expect(
    await crearColectivoDependencies(second.http).obtenerColectivo("colectivo"),
  ).toEqual({ id: "segundo" });
  expect(first.adapter).toHaveBeenCalledTimes(1);
  expect(second.adapter).toHaveBeenCalledTimes(1);
});
