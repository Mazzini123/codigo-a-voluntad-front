import { ROL_CUENTA } from "@/Application/Domain/Enums/ROL_CUENTA.js";
import { colaboradorDependencies } from "@/Presentation/Dependencies/colaboradorDependencies.js";
import { useAltaDePerfil } from "@/Presentation/Hooks/perfil/useAltaDePerfil.js";

export function useCrearColaboradora(dependencies = colaboradorDependencies) {
  return useAltaDePerfil({
    crearPerfil: dependencies.crearColaborador,
    rol: ROL_CUENTA.COLABORADORA,
    mensaje: "Perfil creado.",
  });
}
