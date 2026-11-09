import { useMemo } from "react";
import { colaboradorDependencies } from "@/Presentation/Dependencies/colaboradorDependencies.js";
import { useMediosPrivados } from "@/Presentation/Hooks/perfil/useMediosPrivados.js";

export function useMediosDeColaboradora(
  colaboradoraId,
  dependencias = colaboradorDependencies,
) {
  const operaciones = useMemo(
    () => ({
      listar: (opciones) => dependencias.listarMediosDeContacto(colaboradoraId, opciones),
      agregar: (medio, opciones) =>
        dependencias.agregarMedioDeContacto(colaboradoraId, medio, opciones),
      quitar: ({ tipo, valor }, opciones) =>
        dependencias.quitarMedioDeContacto(colaboradoraId, tipo, valor, opciones),
    }),
    [colaboradoraId, dependencias],
  );
  return useMediosPrivados(operaciones);
}
