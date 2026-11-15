import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CODIGO_ERROR } from "@/Application/Domain/Enums/CODIGO_ERROR.js";
import { mensajeDeMembresia } from "@/Presentation/Formatos/membresia.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useSolicitarIngreso } from "@/Presentation/Hooks/membresia/useSolicitarIngreso.js";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { RUTA_MIS_SOLICITUDES } from "@/Presentation/Routes/rutas.js";

const MENSAJE_POR_DEFECTO = "No pudimos enviar tu pedido. Probá de nuevo.";

export function usePedirIngresoAlRegistrarse(colectivo, { alYaPedido } = {}) {
  const solicitud = useSolicitarIngreso(colectivo.id);
  const { recargarCuenta } = useAuth();
  const avisar = useAvisos();
  const navigate = useNavigate();
  const { ejecutar } = solicitud;

  const pedir = useCallback(async () => {
    const resultado = await ejecutar();
    if (resultado.ignorada) return;
    if (resultado.ok) {
      await recargarCuenta();
      avisar.exito(`Le avisamos a ${colectivo.nombre}. Vas a entrar cuando te acepten.`);
      navigate(RUTA_MIS_SOLICITUDES);
      return;
    }
    avisar.error(mensajeDeMembresia(resultado.error, MENSAJE_POR_DEFECTO));
    if (resultado.error?.codigo === CODIGO_ERROR.SOLICITUD_PENDIENTE) alYaPedido?.();
  }, [ejecutar, recargarCuenta, avisar, navigate, colectivo.nombre, alYaPedido]);

  return { pedir, enviando: solicitud.enviando };
}
