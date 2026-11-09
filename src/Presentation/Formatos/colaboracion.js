import { COLABORACION_ESTADO as ESTADO } from "@/Application/Domain/Enums/COLABORACION_ESTADO.js";

export const ESTADOS = Object.freeze([
  { valor: "", texto: "Todas" },
  { valor: ESTADO.PENDIENTE, texto: "Pendientes", singular: "Pendiente" },
  { valor: ESTADO.ACEPTADA, texto: "Aceptadas", singular: "Aceptada" },
  { valor: ESTADO.RECHAZADA, texto: "Rechazadas", singular: "Rechazada" },
  { valor: ESTADO.FINALIZADA, texto: "Finalizadas", singular: "Finalizada" },
  { valor: ESTADO.DESVINCULADA, texto: "Desvinculadas", singular: "Desvinculada" },
  { valor: ESTADO.RETIRADA, texto: "Retiradas", singular: "Retirada" },
]);

const LARGO_MAXIMO_DEL_PERFIL = 90;

export function filtroDeEstadoValido(solicitado) {
  return ESTADOS.some(({ valor }) => valor === solicitado) ? solicitado : "";
}

export function textoDeEstado(estado) {
  return (
    ESTADOS.find(({ valor }) => valor === estado)?.singular ?? "Estado no disponible"
  );
}

export function textoDeContribucion(esPublica) {
  return esPublica === false ? "Contribución anónima" : "Contribución pública";
}

export function fechaValida(fechaIso) {
  return Boolean(fechaIso) && Number.isFinite(Date.parse(fechaIso));
}

export function ordenarPorFechaDescendente(registros) {
  const marca = ({ colaboracion }) =>
    fechaValida(colaboracion.fecha) ? Date.parse(colaboracion.fecha) : -Infinity;
  return [...registros].sort((a, b) => marca(b) - marca(a));
}

export function datosDelPerfil(proyecto, perfilId, resumen = null) {
  if (resumen) {
    return {
      titulo: resumen.titulo || "Perfil",
      descripcion: resumen.descripcion ?? "",
    };
  }
  if (!proyecto) return null;
  const indice = (proyecto.perfiles ?? []).findIndex(({ id }) => id === perfilId);
  if (indice < 0) return { titulo: "Perfil eliminado", descripcion: "" };
  const encontrado = proyecto.perfiles[indice];
  return {
    titulo: encontrado.titulo || `Perfil ${indice + 1}`,
    descripcion: encontrado.descripcion ?? "",
  };
}

function recortar(texto) {
  const limpio = texto.trim().replace(/\s+/g, " ");
  if (limpio.length <= LARGO_MAXIMO_DEL_PERFIL) return limpio;
  return `${limpio.slice(0, LARGO_MAXIMO_DEL_PERFIL).trimEnd()}…`;
}

function textoDelPerfilEnLaBaja(perfil) {
  if (!perfil || perfil.titulo === "Perfil eliminado") return "";
  return `, en el perfil «${recortar(perfil.descripcion) || perfil.titulo}»`;
}

export function descripcionDeLaBaja({ proyecto, perfil, esPublica }) {
  const nombre = proyecto?.titulo ? `«${proyecto.titulo}»` : "este proyecto";
  const consecuencia =
    esPublica === false
      ? "Como tu contribución es anónima, no figura en tu perfil público."
      : "Va a figurar como desvinculada en tu perfil público.";
  return `Dejás de participar en ${nombre}${textoDelPerfilEnLaBaja(perfil)}. ${consecuencia}`;
}

export function descripcionDelRetiro({ proyecto, perfil }) {
  const nombre = proyecto?.titulo ? `«${proyecto.titulo}»` : "este proyecto";
  const destino =
    perfil?.titulo && perfil.titulo !== "Perfil eliminado"
      ? `, perfil «${perfil.titulo}»`
      : "";
  return `Retirás tu postulación a ${nombre}${destino}. Si cambiás de idea, vas a poder postularte de nuevo.`;
}

export function avisoDeRetiro(proyecto) {
  return proyecto?.titulo
    ? `Retiraste tu postulación a «${proyecto.titulo}».`
    : "Retiraste tu postulación.";
}

export function avisoDeBaja(proyecto) {
  return proyecto?.titulo
    ? `Te diste de baja del proyecto «${proyecto.titulo}».`
    : "Te diste de baja del proyecto.";
}
