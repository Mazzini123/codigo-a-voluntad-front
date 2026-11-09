import { useMemo } from "react";
import { colectivoDependencies } from "@/Presentation/Dependencies/colectivoDependencies.js";
import { useMediosPrivados } from "@/Presentation/Hooks/perfil/useMediosPrivados.js";

export function useMediosDeColectivo(colectivoId, dependencias = colectivoDependencies) {
  const operaciones = useMemo(
    () => ({
      listar: (opciones) => dependencias.listarMediosDeContacto(colectivoId, opciones),
      agregar: (medio, opciones) =>
        dependencias.agregarMedioDeContacto(colectivoId, medio, opciones),
      quitar: ({ tipo, valor }, opciones) =>
        dependencias.quitarMedioDeContacto(colectivoId, tipo, valor, opciones),
    }),
    [colectivoId, dependencias],
  );
  return useMediosPrivados(operaciones);
}
