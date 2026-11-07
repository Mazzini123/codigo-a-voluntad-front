import { useCallback } from "react";
import { ROL_CUENTA } from "../../Application/Domain/Enums/ROL_CUENTA.js";
import { colaboradorDependencies } from "../Dependencies/colaboradorDependencies.js";
import { useAsync } from "./useAsync.js";
import { useAuth } from "./useAuth.js";
import { useAvisos } from "./useAvisos.js";

export function useCrearColaboradora(dependencies = colaboradorDependencies) {
  const { recargarCuenta, asociarPerfil } = useAuth();
  const avisar = useAvisos();
  const crearColaboradora = useCallback(
    async (signal, request) => {
      const colaboradora = await dependencies.crearColaborador(request, { signal });
      await asociarPerfil(ROL_CUENTA.COLABORADORA, colaboradora.id);
      avisar.exito("Perfil creado.");
      await recargarCuenta();
      return colaboradora;
    },
    [dependencies, asociarPerfil, recargarCuenta, avisar],
  );
  const { cargando, error, ejecutar } = useAsync(crearColaboradora, { inmediato: false });
  return { crear: ejecutar, creando: cargando, error };
}
