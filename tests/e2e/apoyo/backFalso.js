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

function sinColectivo(proyecto) {
  const copia = { ...proyecto };
  delete copia.colectivoId;
  return copia;
}

function proyectosDe(estado, colectivoId) {
  return [...estado.proyectos.values()]
    .filter((proyecto) => proyecto.colectivoId === colectivoId)
    .map(sinColectivo);
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
};

function rutas(estado) {
  const nuevoId = (prefijo) => `${prefijo}-${++estado.secuencia}`;
  return [
    ["GET", /^\/habilidades$/, () => pagina(CATALOGO)],
    [
      "GET",
      /^\/proyectos$/,
      () => pagina([...estado.proyectos.values()].map(sinColectivo)),
    ],
    [
      "GET",
      /^\/proyectos\/([^/]+)$/,
      ([id]) =>
        estado.proyectos.has(id) ? sinColectivo(estado.proyectos.get(id)) : null,
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
      /^\/proyectos\/([^/]+)\/colaboraciones\/([^/]+)\/(aceptacion|rechazo|desvinculacion)$/,
      ([id, colaboracionId, accion]) => {
        const colaboracion = estado.proyectos
          .get(id)
          ?.colaboraciones.find((candidata) => candidata.id === colaboracionId);
        if (!colaboracion) return null;
        colaboracion.estado = ACCIONES[accion];
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
    ["GET", /^\/colectivos\/([^/]+)\/proyectos$/, ([id]) => proyectosDe(estado, id)],
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
      () => pagina([...estado.proyectos.values()].map(sinColectivo)),
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
