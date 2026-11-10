import { CODIGO_ERROR } from "@/Application/Domain/Enums/CODIGO_ERROR.js";
import { ESTADOS } from "@/Presentation/Formatos/colaboracion.js";

export function actividadEnCurso(error) {
  if (error?.codigo !== CODIGO_ERROR.ACTIVIDAD_EN_CURSO) return null;
  const detalle = Array.isArray(error.detalle) ? error.detalle : [];
  return detalle.map((item) => ({
    id: item.colaboracionId ?? `${item.proyectoId}-${item.estado}`,
    proyecto: item.proyecto || "Proyecto sin título",
    estado: ESTADOS.find(({ valor }) => valor === item.estado)?.singular ?? "En curso",
  }));
}
