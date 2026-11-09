import { ROL_CUENTA } from "@/Application/Domain/Enums/ROL_CUENTA.js";
import { colectivoDependencies } from "@/Presentation/Dependencies/colectivoDependencies.js";
import { useAltaDePerfil } from "@/Presentation/Hooks/perfil/useAltaDePerfil.js";

export function useCrearColectivo(dependencies = colectivoDependencies) {
  return useAltaDePerfil({
    crearPerfil: dependencies.crearColectivo,
    rol: ROL_CUENTA.COLECTIVO,
    mensaje: "Perfil del colectivo creado.",
  });
}
