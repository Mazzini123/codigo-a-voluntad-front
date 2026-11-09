import { COLABORACION_ESTADO } from "@/Application/Domain/Enums/COLABORACION_ESTADO.js";
import { PROYECTO_ESTADO } from "@/Application/Domain/Enums/PROYECTO_ESTADO.js";
import {
  perfilesAbiertos,
  postulacionesPendientes,
} from "@/Application/Domain/Reglas/busquedaDePerfil.js";

export function filasDelPanel(proyectos, hoy) {
  return proyectos?.map((proyecto) => ({
    proyecto,
    abiertos: Array.isArray(proyecto.perfiles)
      ? perfilesAbiertos(proyecto, hoy).length
      : null,
    pendientes: postulacionesPendientes(proyecto),
  }));
}

export function totalSiCompleto(filas, campo) {
  if (filas.some((fila) => fila[campo] === null)) return null;
  return filas.reduce((total, fila) => total + fila[campo], 0);
}

export function proyectosActivos(filas) {
  return filas.filter(({ proyecto }) => proyecto.estado === PROYECTO_ESTADO.ABIERTO)
    .length;
}

export function filasParaElResumen(filas, maximo) {
  const abiertas = filas.filter(
    ({ proyecto }) => proyecto.estado === PROYECTO_ESTADO.ABIERTO,
  );
  const otras = filas.filter(
    ({ proyecto }) => proyecto.estado !== PROYECTO_ESTADO.ABIERTO,
  );
  return [...abiertas, ...otras].slice(0, maximo);
}

export function postulacionesPorRevisar(filas) {
  const postulaciones = filas
    .filter(({ pendientes }) => pendientes > 0)
    .flatMap(({ proyecto }) =>
      proyecto.colaboraciones
        .filter(({ estado }) => estado === COLABORACION_ESTADO.PENDIENTE)
        .map((colaboracion) => ({
          proyecto,
          colaboracion,
          perfil: proyecto.perfiles?.find(({ id }) => id === colaboracion.perfil),
        })),
    )
    .sort(
      (a, b) =>
        (Date.parse(b.colaboracion.fecha) || 0) - (Date.parse(a.colaboracion.fecha) || 0),
    );
  return { completo: totalSiCompleto(filas, "pendientes") !== null, postulaciones };
}
