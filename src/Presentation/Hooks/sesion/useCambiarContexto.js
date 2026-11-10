import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";
import { inicioPorContexto } from "@/Presentation/Routes/rutas.js";
import { useAuth } from "./useAuth.js";

export function useCambiarContexto() {
  const { seleccionarContexto } = useAuth();
  const navigate = useNavigate();
  const tarea = useCallback(
    async (_signal, contexto) => {
      await seleccionarContexto(contexto.id);
      return contexto;
    },
    [seleccionarContexto],
  );
  const mutacion = useMutacion(tarea);
  const { ejecutar } = mutacion;

  const cambiar = useCallback(
    async (contexto) => {
      const resultado = await ejecutar(contexto);
      if (resultado.ok) navigate(inicioPorContexto(contexto), { replace: true });
      return resultado;
    },
    [ejecutar, navigate],
  );

  return { ...mutacion, cambiar };
}
