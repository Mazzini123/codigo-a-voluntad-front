import { numeroEstadistico } from "@/Presentation/Formatos/estadistica.js";

const textos = {
  ALTA_DEL_COLECTIVO: () => "El colectivo se sumó a la plataforma.",
  BAJA_DEL_COLECTIVO: () => "El colectivo se dio de baja. Su historia sigue visible.",
  PROYECTO_CREADO: () => "Publicó un proyecto.",
  PROYECTO_FINALIZADO: () => "Finalizó un proyecto.",
  LOGRO: (evento) => `Registró un logro: ${evento.logro.titulo}.`,
  AVANCE: (evento) =>
    `El proyecto alcanzó un ${numeroEstadistico(evento.avance.porcentajeConcrecion)} % de avance.`,
  COLABORACION_CERRADA: (evento) =>
    `${evento.colaborador?.nombre ?? "Una persona colaboradora"} terminó su colaboración.`,
};

export function textoDeEvento(evento) {
  return textos[evento.tipo]?.(evento) ?? "Se registró una actividad del colectivo.";
}
