import { TIPO_CONTEXTO } from "@/Application/Domain/Enums/TIPO_CONTEXTO.js";
import { ROL_CUENTA } from "@/Application/Domain/Enums/ROL_CUENTA.js";
import { colaboradorDependencies } from "@/Presentation/Dependencies/colaboradorDependencies.js";
import { useAltaDePerfil } from "@/Presentation/Hooks/perfil/useAltaDePerfil.js";

export function useCrearColaboradora(dependencies = colaboradorDependencies) {
  return useAltaDePerfil({
    crearPerfil: dependencies.crearColaborador,
    rol: ROL_CUENTA.COLABORADORA,
    tipo: TIPO_CONTEXTO.COLABORADOR,
    unico: true,
    mensaje: "Perfil creado.",
  });
}
