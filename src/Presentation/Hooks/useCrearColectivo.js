import { useCallback } from "react";
import { ROL_CUENTA } from "../../Application/Domain/Enums/ROL_CUENTA.js";
import { colectivoDependencies } from "../Dependencies/colectivoDependencies.js";
import { useAsync } from "./useAsync.js";
import { useAuth } from "./useAuth.js";
import { useAvisos } from "./useAvisos.js";

export function useCrearColectivo(dependencies = colectivoDependencies) {
  const { recargarCuenta, asociarPerfil } = useAuth();
  const avisar = useAvisos();
  const crearColectivo = useCallback(
    async (signal, request) => {
      const colectivo = await dependencies.crearColectivo(request, { signal });
      await asociarPerfil(ROL_CUENTA.COLECTIVO, colectivo.id);
      avisar.exito("Perfil del colectivo creado.");
      await recargarCuenta();
      return colectivo;
    },
    [dependencies, asociarPerfil, recargarCuenta, avisar],
  );
  const { cargando, error, ejecutar } = useAsync(crearColectivo, { inmediato: false });
  return { crear: ejecutar, creando: cargando, error };
}
