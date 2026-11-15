import { useCallback, useState } from "react";
import { useConsulta } from "./useConsulta.js";

export function normalizarPagina(datos) {
  // El transporte de demostración también admite los fixtures previos.
  return Array.isArray(datos)
    ? {
        data: datos,
        meta: {
          page: 1,
          per_page: datos.length,
          total: datos.length,
          total_pages: datos.length ? 1 : 0,
        },
      }
    : datos;
}

export function usePagina(tarea, limite = 20) {
  const [seleccion, seleccionar] = useState({ tarea, numero: 1 });
  const numero = seleccion.tarea === tarea ? seleccion.numero : 1;
  const obtener = useCallback(
    (signal) => tarea({ page: numero, limit: limite }, signal),
    [tarea, numero, limite],
  );
  const consulta = useConsulta(obtener);
  const pagina = normalizarPagina(consulta.datos);
  return {
    ...consulta,
    items: pagina?.data ?? null,
    meta: pagina?.meta,
    pagina: numero,
    cambiarPagina: (valor) => seleccionar({ tarea, numero: valor }),
  };
}
