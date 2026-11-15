import { useCallback } from "react";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

const MENSAJES_DE_AGREGAR = Object.freeze({
  409: "Ya cargaste ese medio de contacto.",
  400: "Revisá el dato de contacto.",
});

const MENSAJES_DE_QUITAR = Object.freeze({
  404: "Ese medio de contacto ya no está cargado.",
});

export function useMediosPrivados({ listar, agregar, quitar }) {
  const consultar = useCallback((signal) => listar({ signal }), [listar]);
  const consulta = useConsulta(consultar);

  const tareaDeAgregar = useCallback(
    (signal, medio) => agregar(medio, { signal }),
    [agregar],
  );
  const tareaDeQuitar = useCallback(
    (signal, medio) => quitar(medio, { signal }),
    [quitar],
  );
  const agregando = useMutacion(tareaDeAgregar, { mensajes: MENSAJES_DE_AGREGAR });
  const quitando = useMutacion(tareaDeQuitar, { mensajes: MENSAJES_DE_QUITAR });

  async function ejecutarYRecargar(operacion, medio) {
    const resultado = await operacion.ejecutar(medio);
    if (resultado.ignorada) return null;
    if (
      resultado.ok ||
      resultado.error?.status === 404 ||
      resultado.error?.status === 409
    )
      await consulta.reintentar();
    return resultado;
  }

  return {
    medios: consulta.datos,
    error: consulta.error,
    cargando: consulta.cargando && !consulta.datos,
    reintentar: consulta.reintentar,
    agregar: (medio) => ejecutarYRecargar(agregando, medio),
    quitar: (medio) => ejecutarYRecargar(quitando, medio),
    procesando: agregando.enviando || quitando.enviando,
  };
}
