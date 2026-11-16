import { useCallback, useMemo } from "react";
import { estaPublicado } from "@/Application/Domain/Reglas/publicacion.js";
import { proyectoDependencies } from "@/Presentation/Dependencies/proyectoDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";

const SIN_PUBLICACIONES = new Map();

function traeDatosDeGestion(proyecto) {
  return "publicacion" in proyecto && "baja" in proyecto;
}

function idsSinPublicacion(proyectos) {
  return (proyectos ?? [])
    .filter((proyecto) => !estaPublicado(proyecto) && !traeDatosDeGestion(proyecto))
    .map(({ id }) => id);
}

function datosDeGestion(detalle) {
  return { publicacion: detalle?.publicacion ?? null, baja: detalle?.baja ?? null };
}

async function publicacionesDe(ids, signal, dependencies) {
  const resultados = await Promise.allSettled(
    ids.map((id) => dependencies.obtenerProyecto(id, { signal })),
  );
  return new Map(
    resultados.flatMap((resultado, indice) =>
      resultado.status === "fulfilled"
        ? [[ids[indice], datosDeGestion(resultado.value)]]
        : [],
    ),
  );
}

export function usePublicacionesSinPublicar(
  proyectos,
  dependencies = proyectoDependencies,
) {
  const clave = idsSinPublicacion(proyectos).join(",");
  const tarea = useCallback(
    (signal) =>
      clave
        ? publicacionesDe(clave.split(","), signal, dependencies)
        : Promise.resolve(SIN_PUBLICACIONES),
    [clave, dependencies],
  );
  const { datos } = useConsulta(tarea);
  return useMemo(() => datos ?? SIN_PUBLICACIONES, [datos]);
}
