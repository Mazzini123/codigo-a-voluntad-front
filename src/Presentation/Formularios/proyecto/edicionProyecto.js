import { finDelDia, hoyEnArgentina, perfilARequest } from "./formularioProyecto.js";

function fechaParaCampo(valor) {
  if (!valor) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? "" : hoyEnArgentina(fecha);
}

export function datosEditablesDelProyecto(proyecto) {
  return {
    titulo: proyecto.titulo,
    descripcion: proyecto.descripcion,
    etiquetas: proyecto.etiquetas ?? [],
    fechaCierre: fechaParaCampo(proyecto.fechaCierre),
  };
}

export function datosEditablesDelPerfil(perfil) {
  return {
    versionEdicion: perfil.versionEdicion,
    descripcion: perfil.descripcion,
    requeridas: perfil.habilidadesRequeridas ?? [],
    opcionales: perfil.habilidadesOpcionales ?? [],
    horas: String(perfil.compromiso.cantidadHoras),
    periodo: perfil.compromiso.periodo,
    modalidad: perfil.modalidadColaboracion,
    modoAceptacion: perfil.modoAceptacion,
    limite: String(perfil.limiteColaboraciones ?? ""),
    fechaCierreBusqueda: fechaParaCampo(perfil.fechaCierreBusqueda),
  };
}

function diferencia(anterior, siguiente) {
  return Object.fromEntries(
    Object.entries(siguiente).filter(
      ([clave, valor]) => JSON.stringify(anterior[clave]) !== JSON.stringify(valor),
    ),
  );
}

export function cambiosDelProyecto(original, borrador) {
  const cambios = diferencia(original, {
    ...borrador,
    titulo: borrador.titulo.trim(),
    descripcion: borrador.descripcion.trim(),
  });
  if ("fechaCierre" in cambios) {
    cambios.fechaCierre = borrador.fechaCierre ? finDelDia(borrador.fechaCierre) : null;
  }
  return cambios;
}

export function cambiosDelPerfil(original, borrador) {
  const anterior = perfilARequest(original);
  const siguiente = perfilARequest(borrador);
  const cambios = diferencia(
    { ...anterior, fechaCierreBusqueda: anterior.fechaCierreBusqueda ?? null },
    { ...siguiente, fechaCierreBusqueda: siguiente.fechaCierreBusqueda ?? null },
  );
  if (
    "codigosHabilidadesRequeridas" in cambios ||
    "codigosHabilidadesOpcionales" in cambios
  ) {
    cambios.codigosHabilidadesRequeridas = siguiente.codigosHabilidadesRequeridas;
    cambios.codigosHabilidadesOpcionales = siguiente.codigosHabilidadesOpcionales;
  }
  return cambios;
}

export function crearEstadoDeAdministracion() {
  return { edicion: null, confirmacion: null };
}

export function administracionDelProyecto(estado, accion) {
  switch (accion.tipo) {
    case "abrir":
      return {
        edicion: {
          tipo: accion.queSeEdita,
          original: accion.original,
          borrador: accion.original,
          perfilId: accion.perfilId,
        },
        confirmacion: null,
      };
    case "cambiar":
      if (!estado.edicion) return estado;
      return {
        ...estado,
        edicion: {
          ...estado.edicion,
          borrador: { ...estado.edicion.borrador, ...accion.campos },
        },
      };
    case "cerrar":
      return crearEstadoDeAdministracion();
    case "pedirConfirmacion":
      return { ...estado, confirmacion: accion.cual };
    case "cancelarConfirmacion":
      return { ...estado, confirmacion: null };
    default:
      throw new Error(`Acción desconocida: ${accion.tipo}`);
  }
}
