import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { normalizarPagina } from "./usePagina.js";

export function useMasResultados(iniciales, metaInicial, tarea) {
  const [extra, guardar] = useState(null);
  const pedido = useRef(null);
  const actual = extra?.base === iniciales ? extra : null;
  const meta = actual?.meta ?? metaInicial;
  useEffect(
    () => () => {
      pedido.current?.abort();
      pedido.current = null;
    },
    [iniciales, tarea],
  );
  const cargarMas = useCallback(async () => {
    if (pedido.current || !meta || meta.page >= meta.total_pages) return;
    const control = new AbortController();
    pedido.current = control;
    guardar((anterior) => ({
      ...(anterior?.base === iniciales ? anterior : { base: iniciales, items: [] }),
      cargando: true,
      error: null,
    }));
    try {
      const pagina = normalizarPagina(
        await tarea({ page: meta.page + 1, limit: meta.per_page }, control.signal),
      );
      if (control.signal.aborted) return;
      guardar((anterior) => {
        const anteriores = anterior?.base === iniciales ? anterior.items : [];
        const ids = new Set([...(iniciales ?? []), ...anteriores].map((i) => i.id));
        return {
          base: iniciales,
          items: [...anteriores, ...pagina.data.filter((i) => !ids.has(i.id))],
          meta: pagina.meta,
          cargando: false,
        };
      });
    } catch (error) {
      if (!control.signal.aborted)
        guardar((anterior) => ({ ...anterior, error, cargando: false }));
    } finally {
      if (pedido.current === control) pedido.current = null;
    }
  }, [iniciales, meta, tarea]);
  const items = useMemo(
    () => [...(iniciales ?? []), ...(actual?.items ?? [])],
    [iniciales, actual?.items],
  );
  return {
    items,
    meta,
    cargarMas,
    hayMas: Boolean(meta && meta.page < meta.total_pages),
    cargando: actual?.cargando ?? false,
    error: actual?.error,
  };
}
