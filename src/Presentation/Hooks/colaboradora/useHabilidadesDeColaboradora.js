import { useCallback, useState } from "react";
import { colaboradorDependencies } from "@/Presentation/Dependencies/colaboradorDependencies.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

export function useHabilidadesDeColaboradora(
  colaboradoraId,
  alGuardar,
  dependencies = colaboradorDependencies,
) {
  const avisar = useAvisos();
  const [pendiente, setPendiente] = useState(null);
  const [guardado, setGuardado] = useState(false);
  const cambiarHabilidad = useCallback(
    (signal, habilidad, agregar) =>
      agregar
        ? dependencies.agregarHabilidadAColaborador(
            colaboradoraId,
            { codigoHabilidad: habilidad.codigo },
            { signal },
          )
        : dependencies.quitarHabilidadDeColaborador(colaboradoraId, habilidad.codigo, {
            signal,
          }),
    [colaboradoraId, dependencies],
  );
  const { ejecutar } = useMutacion(cambiarHabilidad);

  const guardar = useCallback(
    async (habilidad, agregar) => {
      setPendiente(habilidad.codigo);
      setGuardado(false);
      const { ok, ignorada, datos, error } = await ejecutar(habilidad, agregar);
      if (ignorada) return;
      if (ok) {
        alGuardar(datos);
        setGuardado(true);
      } else {
        const accion = agregar ? "agregar" : "quitar";
        avisar.error(
          `No pudimos ${accion} ${habilidad.titulo}. ${error?.mensaje ?? ""}`.trim(),
        );
      }
      setPendiente(null);
    },
    [ejecutar, alGuardar, avisar],
  );

  return {
    pendiente,
    guardado,
    agregar: (habilidad) => guardar(habilidad, true),
    quitar: (habilidad) => guardar(habilidad, false),
  };
}
