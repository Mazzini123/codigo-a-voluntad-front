import { CATALOGO, unColectivo, unProyecto } from "./datos.js";

function pagina(lista) {
  return {
    data: lista,
    meta: {
      page: 1,
      per_page: Math.max(lista.length, 12),
      total: lista.length,
      total_pages: 1,
    },
  };
}

class Respuesta {
  constructor(status, cuerpo) {
    this.status = status;
    this.cuerpo = cuerpo;
  }
}

const creado = (cuerpo) => new Respuesta(201, cuerpo);

function crearEstadoInicial() {
  const proyectoAjeno = unProyecto("p1");
  return {
    proyectos: new Map([["p1", { ...proyectoAjeno, colectivoId: "cl-fiorito" }]]),
    colectivos: new Map([["cl-fiorito", unColectivo("cl-fiorito")]]),
    colaboradores: new Map(),
    secuencia: 0,
  };
}

function sinColectivo(proyecto, estado) {
  const copia = { ...proyecto };
  copia.colectivo = {
    ...copia.colectivo,
    id: proyecto.colectivoId,
    nombre:
      estado.colectivos.get(proyecto.colectivoId)?.nombre ??
      copia.colectivo?.nombre ??
      "Colectivo",
  };
  delete copia.colectivoId;
  return copia;
}

function proyectosDe(estado, colectivoId) {
  return [...estado.proyectos.values()]
    .filter((proyecto) => proyecto.colectivoId === colectivoId)
    .map((proyecto) => sinColectivo(proyecto, estado));
}

function colaboracionesDe(estado, colaboradorId) {
  return [...estado.proyectos.values()].flatMap((proyecto) =>
    proyecto.colaboraciones
      .filter((colaboracion) => colaboracion.colaborador?.id === colaboradorId)
      .map((colaboracion) => ({ proyectoId: proyecto.id, colaboracion })),
  );
}

const ACCIONES = {
  aceptacion: "ACEPTADA",
  rechazo: "RECHAZADA",
  desvinculacion: "DESVINCULADA",
  finalizacion: "FINALIZADA",
};

function estadisticas(estado, colectivoId) {
  const proyectos = [...estado.proyectos.values()].filter(
    (p) => !colectivoId || p.colectivoId === colectivoId,
  );
  const colaboraciones = proyectos.flatMap((p) => p.colaboraciones);
  const cantidad = (valor) => colaboraciones.filter((c) => c.estado === valor).length;
  return {
    colectivos: {
      total: estado.colectivos.size,
      activos: [...estado.colectivos.values()].filter((c) => !c.fechaBaja).length,
    },
    proyectos: {
      total: proyectos.length,
      abiertos: proyectos.filter((p) => p.estado === "ABIERTO").length,
      finalizados: proyectos.filter((p) => p.estado === "FINALIZADO").length,
    },
    colaboradores: { total: estado.colaboradores.size },
    colaboraciones: {
      total: colaboraciones.length,
      pendientes: cantidad("PENDIENTE"),
      aceptadas: cantidad("ACEPTADA"),
      finalizadas: cantidad("FINALIZADA"),
    },
    visualizaciones: proyectos.reduce((total, p) => total + p.visualizaciones, 0),
    avancePromedio: proyectos.length
      ? proyectos.reduce((total, p) => total + p.porcentajeConcrecion, 0) /
        proyectos.length
      : 0,
    logros: proyectos.reduce((total, p) => total + p.logros.length, 0),
    porProyecto: proyectos.map((p) => ({
      ...p,
      logros: p.logros.length,
      colaboraciones: p.colaboraciones.length,
    })),
    habilidadesMasRequeridas: [{ codigo: "react", cantidad: proyectos.length }],
    habilidadesMasOfrecidas: [],
    generadoEn: "2026-11-09T12:00:00Z",
  };
}

function valoraciones(estado, id, esColectivo) {
  const filas = [...estado.proyectos.values()]
    .filter((p) => !esColectivo || p.colectivoId === id)
    .flatMap((p) =>
      p.colaboraciones
        .filter((c) => esColectivo || (c.esPublica && c.colaborador?.id === id))
        .map((c) => ({
          ...(esColectivo ? c.valoracionDelColaborador : c.valoracionDelColectivo),
          proyecto: { id: p.id, titulo: p.titulo },
          ...(esColectivo
            ? { autor: c.esPublica ? c.colaborador : null }
            : {
                colectivo: {
                  id: p.colectivoId,
                  nombre: estado.colectivos.get(p.colectivoId)?.nombre,
                },
              }),
        }))
        .filter((v) => v.puntaje),
    );
  return {
    cantidad: filas.length,
    promedio: filas.length
      ? filas.reduce((n, v) => n + v.puntaje, 0) / filas.length
      : null,
    valoraciones: filas,
  };
}

function rutas(estado) {
  const nuevoId = (prefijo) => `${prefijo}-${++estado.secuencia}`;
  return [
    ["GET", /^\/catalogos\/provincias$/, () => ["Buenos Aires"]],
    ["GET", /^\/estadisticas$/, () => estadisticas(estado)],
    ["GET", /^\/colectivos\/([^/]+)\/estadisticas$/, ([id]) => estadisticas(estado, id)],
    [
      "GET",
      /^\/colectivos\/([^/]+)\/medios-de-contacto$/,
      ([id]) => estado.colectivos.get(id)?.mediosDeContacto ?? [],
    ],
    [
      "GET",
      /^\/colectivos\/([^/]+)\/timeline$/,
      ([id]) => {
        const c = estado.colectivos.get(id);
        if (!c) return null;
        return [
          { tipo: "ALTA_DEL_COLECTIVO", fecha: c.fechaAlta },
          ...proyectosDe(estado, id).map((p) => ({
            tipo: "PROYECTO_CREADO",
            fecha: p.fechaCreacion,
            proyecto: { id: p.id, titulo: p.titulo },
          })),
          ...(c.fechaBaja ? [{ tipo: "BAJA_DEL_COLECTIVO", fecha: c.fechaBaja }] : []),
        ].sort((a, b) => Date.parse(a.fecha) - Date.parse(b.fecha));
      },
    ],
    [
      "GET",
      /^\/colectivos\/([^/]+)\/valoraciones$/,
      ([id]) => valoraciones(estado, id, true),
    ],
    [
      "GET",
      /^\/colaboradores\/([^/]+)\/valoraciones$/,
      ([id]) => valoraciones(estado, id, false),
    ],
    [
      "POST",
      /^\/colectivos\/([^/]+)\/baja$/,
      ([id]) => {
        const c = estado.colectivos.get(id);
        if (!c) return null;
        if (c.fechaBaja)
          return new Respuesta(409, { message: "Ya estaba dado de baja." });
        c.fechaBaja = new Date().toISOString();
        c.cuentaId = null;
        c.mediosDeContacto = [];
        c.redesSociales = [];
        for (const p of estado.proyectos.values())
          if (p.colectivoId === id && p.estado === "ABIERTO") {
            p.estado = "FINALIZADO";
            p.fechaFinalizacion = c.fechaBaja;
            for (const colaboracion of p.colaboraciones) {
              if (colaboracion.estado === "PENDIENTE") colaboracion.estado = "RECHAZADA";
              else if (colaboracion.estado === "ACEPTADA") {
                colaboracion.estado = "FINALIZADA";
                colaboracion.fechaFin = c.fechaBaja;
              }
            }
          }
        return c;
      },
    ],
    [
      "POST",
      /^\/proyectos\/([^/]+)\/colaboraciones\/([^/]+)\/valoraciones$/,
      ([id, colaboracionId], cuerpo) => {
        const c = estado.proyectos
          .get(id)
          ?.colaboraciones.find((c) => c.id === colaboracionId);
        if (!c) return null;
        const campo =
          cuerpo.autor === "COLECTIVO"
            ? "valoracionDelColectivo"
            : "valoracionDelColaborador";
        if (c.estado !== "FINALIZADA" || c[campo])
          return new Respuesta(409, { message: "No se puede valorar." });
        if (
          !Number.isInteger(cuerpo.puntaje) ||
          cuerpo.puntaje < 1 ||
          cuerpo.puntaje > 5 ||
          (cuerpo.comentario?.length ?? 0) > 280
        )
          return new Respuesta(400, { message: "Valoración inválida." });
        c[campo] = {
          puntaje: cuerpo.puntaje,
          comentario: cuerpo.comentario,
          fecha: new Date().toISOString(),
        };
        return creado(c[campo]);
      },
    ],
    ["GET", /^\/habilidades$/, () => pagina(CATALOGO)],
    [
      "GET",
      /^\/proyectos$/,
      () =>
        pagina(
          [...estado.proyectos.values()].map((proyecto) =>
            sinColectivo(proyecto, estado),
          ),
        ),
    ],
    [
      "GET",
      /^\/proyectos\/([^/]+)$/,
      ([id]) =>
        estado.proyectos.has(id) ? sinColectivo(estado.proyectos.get(id), estado) : null,
    ],
    [
      "GET",
      /^\/proyectos\/([^/]+)\/colaboraciones$/,
      ([id]) => estado.proyectos.get(id)?.colaboraciones ?? null,
    ],
    [
      "POST",
      /^\/proyectos\/([^/]+)\/colaboraciones$/,
      ([id], cuerpo) => {
        const proyecto = estado.proyectos.get(id);
        const colaboradora = estado.colaboradores.get(cuerpo.colaboradorId);
        const colaboracion = {
          id: nuevoId("col"),
          perfil: cuerpo.perfilId,
          colaborador: {
            id: colaboradora.id,
            nombreFantasia: colaboradora.nombreFantasia,
            nombre: colaboradora.nombre,
          },
          esPublica: cuerpo.esPublica,
          fecha: new Date().toISOString(),
          estado: "PENDIENTE",
          fechaResolucion: null,
          fechaFin: null,
          valoracionDelColectivo: null,
          valoracionDelColaborador: null,
        };
        proyecto.colaboraciones.push(colaboracion);
        return creado(colaboracion);
      },
    ],
    [
      "POST",
      /^\/proyectos\/([^/]+)\/colaboraciones\/([^/]+)\/(aceptacion|rechazo|desvinculacion|finalizacion)$/,
      ([id, colaboracionId, accion]) => {
        const colaboracion = estado.proyectos
          .get(id)
          ?.colaboraciones.find((candidata) => candidata.id === colaboracionId);
        if (!colaboracion) return null;
        if (accion === "finalizacion" && colaboracion.estado !== "ACEPTADA")
          return new Respuesta(409, { message: "No está aceptada." });
        colaboracion.estado = ACCIONES[accion];
        if (accion === "finalizacion") colaboracion.fechaFin = new Date().toISOString();
        colaboracion.fechaResolucion = new Date().toISOString();
        return colaboracion;
      },
    ],
    [
      "GET",
      /^\/colectivos\/([^/]+)$/,
      ([id]) =>
        estado.colectivos.has(id)
          ? { ...estado.colectivos.get(id), proyectos: proyectosDe(estado, id) }
          : null,
    ],
    [
      "GET",
      /^\/colectivos\/([^/]+)\/proyectos$/,
      ([id]) => pagina(proyectosDe(estado, id)),
    ],
    [
      "GET",
      /^\/colectivos\/([^/]+)\/postulaciones$/,
      ([id]) =>
        pagina(
          proyectosDe(estado, id).flatMap((proyecto) =>
            proyecto.colaboraciones
              .filter((c) => c.estado === "PENDIENTE")
              .map((colaboracion) => ({
                proyecto: { id: proyecto.id, titulo: proyecto.titulo },
                perfil: proyecto.perfiles.find((p) => p.id === colaboracion.perfil),
                colaboracion,
              })),
          ),
        ),
    ],
    [
      "POST",
      /^\/colectivos$/,
      (_, cuerpo) => {
        const colectivo = unColectivo(nuevoId("cl"), {
          ...cuerpo,
          mediosDeContacto: undefined,
        });
        estado.colectivos.set(colectivo.id, colectivo);
        return creado(colectivo);
      },
    ],
    [
      "POST",
      /^\/colectivos\/([^/]+)\/proyectos$/,
      ([colectivoId], cuerpo) => {
        const id = nuevoId("p");
        const habilidades = (codigos = []) =>
          codigos.map((codigo) =>
            CATALOGO.find((habilidad) => habilidad.codigo === codigo),
          );
        const perfiles = (cuerpo.perfiles ?? []).map(
          (
            { codigosHabilidadesRequeridas, codigosHabilidadesOpcionales, ...perfil },
            indice,
          ) => ({
            id: `${id}-pe${indice + 1}`,
            versionEdicion: "1",
            busquedaAbierta: true,
            fechaCierreBusqueda: null,
            ...perfil,
            habilidadesRequeridas: habilidades(codigosHabilidadesRequeridas),
            habilidadesOpcionales: habilidades(codigosHabilidadesOpcionales),
          }),
        );
        const proyecto = unProyecto(id, {
          ...cuerpo,
          colectivo: {
            id: colectivoId,
            nombre: estado.colectivos.get(colectivoId)?.nombre,
          },
          perfiles,
          porcentajeConcrecion: 0,
          urlRepositorio: cuerpo.urlRepositorio ?? null,
          visualizaciones: 0,
        });
        estado.proyectos.set(id, { ...proyecto, colectivoId });
        return creado(proyecto);
      },
    ],
    ["GET", /^\/colaboradores\/([^/]+)$/, ([id]) => estado.colaboradores.get(id) ?? null],
    [
      "GET",
      /^\/colaboradores\/([^/]+)\/colaboraciones$/,
      ([id]) => colaboracionesDe(estado, id),
    ],
    [
      "GET",
      /^\/colaboradores\/([^/]+)\/proyectos-potenciales$/,
      () =>
        pagina(
          [...estado.proyectos.values()].map((proyecto) =>
            sinColectivo(proyecto, estado),
          ),
        ),
    ],
  ];
}

export async function conBackFalso(page, preparar = () => {}) {
  const estado = crearEstadoInicial();
  preparar(estado);
  const tabla = rutas(estado);
  const noAtendidos = [];
  await page.route("**/api/**", async (route) => {
    const pedido = route.request();
    const url = new URL(pedido.url());
    const camino = url.pathname.replace(/^\/api/, "");
    const metodo = pedido.method();
    for (const [verbo, patron, atender] of tabla) {
      const coincide = verbo === metodo && camino.match(patron);
      if (!coincide) continue;
      const resultado = atender(coincide.slice(1), pedido.postDataJSON?.() ?? null);
      const { status, cuerpo } =
        resultado instanceof Respuesta
          ? resultado
          : new Respuesta(resultado == null ? 404 : 200, resultado);
      return route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(cuerpo ?? { message: "No existe." }),
      });
    }
    noAtendidos.push(`${metodo} ${camino}`);
    return route.fulfill({
      status: 404,
      contentType: "application/json",
      body: '{"message":"No existe."}',
    });
  });
  return { estado, noAtendidos };
}
