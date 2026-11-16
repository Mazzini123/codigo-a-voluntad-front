import { useCallback } from "react";
import { administracionDependencies } from "@/Presentation/Dependencies/administracionDependencies.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";
import { useTerminosVigentes } from "@/Presentation/Hooks/terminos/useTerminosVigentes.js";

export function useTerminosDeAdministracion(dependencias = administracionDependencies) {
  const vigentes = useTerminosVigentes();
  const tarea = useCallback(
    (signal, texto) => dependencias.publicarTerminos(texto, { signal }),
    [dependencias],
  );
  const mutacion = useMutacion(tarea);
  const { recargar } = vigentes;

  const publicar = useCallback(
    async (texto) => {
      const resultado = await mutacion.ejecutar(texto);
      if (resultado.ignorada) return null;
      if (resultado.ok || resultado.error?.status === 409) await recargar();
      return resultado;
    },
    [mutacion, recargar],
  );

  return { vigentes, publicar, publicando: mutacion.enviando };
}
