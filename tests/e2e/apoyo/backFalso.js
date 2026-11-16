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
const sinContenido = () => new Respuesta(204, null);

function paginar(lista, consulta) {
  const porPagina = Number(consulta.get("limit")) || 12;
  const numero = Number(consulta.get("page")) || 1;
  return {
    data: lista.slice((numero - 1) * porPagina, numero * porPagina),
    meta: {
      page: numero,
      per_page: porPagina,
      total: lista.length,
      total_pages: Math.ceil(lista.length / porPagina),
    },
  };
}

const CUPO_DE_DESTACADOS = 6;
const ADMINISTRACION_SIMULADA = {
  usuarioId: "cuenta-simulada",
  contextoId: "contexto-administracion-simulado",
};

function crearEstadoInicial() {
  const proyectoAjeno = unProyecto("p1");
  return {
    proyectos: new Map([["p1", { ...proyectoAjeno, colectivoId: "cl-fiorito" }]]),
    colectivos: new Map([["cl-fiorito", unColectivo("cl-fiorito")]]),
    colaboradores: new Map(),
    destacados: new Map(),
    revisiones: new Map(),
    auditoria: [],
    fallas: new Set(),
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
  if (estado.destacados.has(proyecto.id)) copia.destacado = true;
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

function proyectosListados(estado, consulta) {
  const etiqueta = consulta.get("etiqueta");
  const filtroDeEstado = consulta.get("estado");
  const lista = [...estado.proyectos.values()]
    .filter((p) => !filtroDeEstado || p.estado === filtroDeEstado)
    .filter((p) => !etiqueta || p.etiquetas.includes(etiqueta))
    .map((p) => sinColectivo(p, estado));
  return [...lista.filter((p) => p.destacado), ...lista.filter((p) => !p.destacado)];
}

function auditar(estado, accion, entidad, detalle) {
  estado.auditoria.push({
    id: `aud-${++estado.secuencia}`,
    ...ADMINISTRACION_SIMULADA,
    accion,
    entidad,
    detalle,
    fecha: new Date().toISOString(),
  });
}

function destacar(estado, id, { hasta }) {
  const proyecto = estado.proyectos.get(id);
  if (!proyecto) return null;
  if (proyecto.estado !== "ABIERTO")
    return new Respuesta(422, { message: "No es elegible." });
  const cambio = estado.destacados.has(id);
  if (!cambio && estado.destacados.size >= CUPO_DE_DESTACADOS)
    return new Respuesta(409, { message: "Cupo completo." });
  const destacado = {
    desde: estado.destacados.get(id)?.desde ?? new Date().toISOString(),
    hasta: `${hasta.slice(0, 10)}T23:59:59.000-03:00`,
  };
  estado.destacados.set(id, destacado);
  auditar(
    estado,
    "PROYECTO_DESTACADO",
    { tipo: "PROYECTO", id },
    { hasta: destacado.hasta, cambio },
  );
  return { id, destacado };
}

function resolverRevision(estado, id, { estado: resolucion, nota }) {
  const revision = estado.revisiones.get(id);
  if (!revision) return null;
  if (revision.estado !== "PENDIENTE")
    return new Respuesta(409, { message: "Ya resuelta." });
  if (!["REVISADA", "DESCARTADA"].includes(resolucion))
    return new Respuesta(400, { message: "Estado inválido." });
  Object.assign(revision, {
    estado: resolucion,
    nota: nota || null,
    resueltaPor: ADMINISTRACION_SIMULADA.usuarioId,
    resueltaEn: new Date().toISOString(),
  });
  auditar(estado, "REVISION_RESUELTA", { tipo: "REVISION", id }, { estado: resolucion });
  return revision;
}

function filtrarAuditoria(estado, consulta) {
  const igual = (campo, valor) => !consulta.get(campo) || valor === consulta.get(campo);
  const desde = Date.parse(consulta.get("desde") ?? "") || -Infinity;
  const hasta = Date.parse(consulta.get("hasta") ?? "") || Infinity;
  return estado.auditoria
    .filter(
      (a) =>
        igual("accion", a.accion) &&
        igual("entidadTipo", a.entidad?.tipo) &&
        igual("entidadId", a.entidad?.id) &&
        Date.parse(a.fecha) >= desde &&
        Date.parse(a.fecha) <= hasta,
    )
    .sort((a, b) => Date.parse(b.fecha) - Date.parse(a.fecha));
}

function rutasDeAdministracion(estado) {
  return [
    [
      "GET",
      /^\/proyectos\/destacados$/,
      () =>
        [...estado.destacados.keys()]
          .filter((id) => estado.proyectos.has(id))
          .map((id) => sinColectivo(estado.proyectos.get(id), estado)),
    ],
    [
      "PUT",
      /^\/administracion\/proyectos\/([^/]+)\/destacado$/,
      ([id], cuerpo) => destacar(estado, id, cuerpo),
    ],
    [
      "DELETE",
      /^\/administracion\/proyectos\/([^/]+)\/destacado$/,
      ([id]) => {
        if (!estado.destacados.delete(id)) return null;
        auditar(estado, "PROYECTO_DESTACADO_QUITADO", { tipo: "PROYECTO", id }, null);
        return sinContenido();
      },
    ],
    [
      "GET",
      /^\/administracion\/revisiones$/,
      (_, __, consulta) =>
        paginar(
          [...estado.revisiones.values()].filter(
            (r) =>
              (!consulta.get("estado") || r.estado === consulta.get("estado")) &&
              (!consulta.get("motivo") || r.motivo === consulta.get("motivo")),
          ),
          consulta,
        ),
    ],
    [
      "POST",
      /^\/administracion\/revisiones\/([^/]+)\/resolucion$/,
      ([id], cuerpo) => resolverRevision(estado, id, cuerpo),
    ],
    [
      "GET",
      /^\/administracion\/auditoria$/,
      (_, __, consulta) => paginar(filtrarAuditoria(estado, consulta), consulta),
    ],
  ];
}

function rutas(estado) {
  const nuevoId = (prefijo) => `${prefijo}-${++estado.secuencia}`;
  return [
    ...rutasDeAdministracion(estado),
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
      (_, __, consulta) =>
        consulta.get("estado")
          ? paginar(proyectosListados(estado, consulta), consulta)
          : pagina(proyectosListados(estado, consulta)),
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
    if (estado.fallas.has(`${metodo} ${camino}`))
      return route.fulfill({
        status: 500,
        contentType: "application/json",
        body: '{"message":"Falla simulada."}',
      });
    for (const [verbo, patron, atender] of tabla) {
      const coincide = verbo === metodo && camino.match(patron);
      if (!coincide) continue;
      const resultado = atender(
        coincide.slice(1),
        pedido.postDataJSON?.() ?? null,
        url.searchParams,
      );
      const { status, cuerpo } =
        resultado instanceof Respuesta
          ? resultado
          : new Respuesta(resultado == null ? 404 : 200, resultado);
      if (status === 204) return route.fulfill({ status });
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
