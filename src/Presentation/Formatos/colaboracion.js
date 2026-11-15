import { COLABORACION_ESTADO as ESTADO } from "@/Application/Domain/Enums/COLABORACION_ESTADO.js";
import { postulanteVisible } from "@/Application/Domain/Reglas/postulacion.js";
import { nombreVisible } from "@/Presentation/Formatos/colaboradora.js";

export const ESTADOS = Object.freeze([
  { valor: "", texto: "Todas" },
  { valor: ESTADO.PENDIENTE, texto: "Pendientes", singular: "Pendiente" },
  { valor: ESTADO.ACEPTADA, texto: "Aceptadas", singular: "Aceptada" },
  { valor: ESTADO.RECHAZADA, texto: "Rechazadas", singular: "Rechazada" },
  { valor: ESTADO.FINALIZADA, texto: "Finalizadas", singular: "Finalizada" },
  { valor: ESTADO.DESVINCULADA, texto: "Desvinculadas", singular: "Desvinculada" },
  { valor: ESTADO.RETIRADA, texto: "Retiradas", singular: "Retirada" },
]);

export const MENSAJE_COLABORACION_PROPIA =
  "Esta colaboración es de tu propio perfil de colaboradora, así que no podés gestionarla desde el colectivo.";

const LARGO_MAXIMO_DEL_PERFIL = 90;

export function filtroDeEstadoValido(solicitado) {
  return ESTADOS.some(({ valor }) => valor === solicitado) ? solicitado : "";
}

export function textoDeEstado(estado) {
  return (
    ESTADOS.find(({ valor }) => valor === estado)?.singular ?? "Estado no disponible"
  );
}

const TIPO_DE_SELLO_POR_ESTADO = Object.freeze({
  [ESTADO.PENDIENTE]: "pendiente",
  [ESTADO.ACEPTADA]: "aceptada",
  [ESTADO.RECHAZADA]: "rechazada",
  [ESTADO.FINALIZADA]: "finalizado",
});

export function selloDePostulacion(estado) {
  return {
    tipo: TIPO_DE_SELLO_POR_ESTADO[estado] ?? "cerrada",
    texto: textoDeEstado(estado),
  };
}

export function tituloDelGrupo(perfil, indice) {
  return perfil.titulo || recortar(perfil.descripcion ?? "") || `Perfil ${indice + 1}`;
}

export function textoEncajeDelPostulante({ tiene, total }) {
  return `Tiene ${tiene} de ${total} ${total === 1 ? "habilidad requerida" : "habilidades requeridas"}`;
}

export function confirmacionDeAceptar(colaboracion) {
  if (colaboracion?.esPublica === false) {
    return {
      titulo: "¿Aceptar la postulación anónima?",
      descripcion:
        "La persona pasa a colaborar en este perfil y ocupa un lugar. Como su contribución es anónima, no se comparten datos de contacto.",
    };
  }
  const nombre = nombreDelPostulante(colaboracion);
  return {
    titulo: `¿Aceptar a ${nombre}?`,
    descripcion: `${nombre} pasa a colaborar en este perfil y ocupa un lugar. Vas a poder ver sus datos de contacto para coordinar el trabajo.`,
  };
}

export function nombreDelPostulante(colaboracion) {
  if (colaboracion?.esPublica === false) return "Postulación anónima";
  return nombreVisible(postulanteVisible(colaboracion)) || "Persona sin nombre";
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
