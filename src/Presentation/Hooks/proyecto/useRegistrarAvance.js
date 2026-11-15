import { useCallback, useState } from "react";
import { avanceDependencies } from "@/Presentation/Dependencies/avanceDependencies.js";
import {
  avisoDeAvanceRegistrado,
  MENSAJE_AVANCE_RECHAZADO,
  MENSAJE_SOLO_DUENO,
} from "@/Presentation/Formatos/avance.js";
import {
  armarAvance,
  erroresDeAvanceDesdeIssues,
  validarAvance,
} from "@/Presentation/Formularios/proyecto/formularioAvance.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

const MENSAJES = Object.freeze({
  403: MENSAJE_SOLO_DUENO,
  409: MENSAJE_AVANCE_RECHAZADO,
  422: MENSAJE_AVANCE_RECHAZADO,
});
const SIN_CAMBIOS = Object.freeze({
  porcentaje: "",
  urlSistema: undefined,
  urlRepositorio: undefined,
});
const SIN_ERRORES = Object.freeze({});

export function useRegistrarAvance(
  proyectoId,
  alRegistrar,
  { porcentajeActual, urlSistema, urlRepositorio },
  dependencias = avanceDependencies,
) {
  const avisar = useAvisos();
  const [cambios, setCambios] = useState(SIN_CAMBIOS);
  const [intentos, setIntentos] = useState(0);
  const [confirmando, setConfirmando] = useState(false);
  const [recargando, setRecargando] = useState(false);

  const registrarTarea = useCallback(
    (signal, request) => dependencias.registrarAvance(proyectoId, request, { signal }),
    [proyectoId, dependencias],
  );
  const { ejecutar, enviando, error, reiniciar } = useMutacion(registrarTarea, {
    mensajes: MENSAJES,
  });

  const valores = {
    porcentaje: cambios.porcentaje,
    urlSistema: cambios.urlSistema ?? urlSistema ?? "",
    urlRepositorio: cambios.urlRepositorio ?? urlRepositorio ?? "",
  };
  const erroresDelCliente =
    intentos > 0 ? validarAvance(valores, porcentajeActual) : SIN_ERRORES;
  const errores = error
    ? { ...erroresDeAvanceDesdeIssues(error.issues), ...erroresDelCliente }
    : erroresDelCliente;

  function cambiar(campo, valor) {
    setCambios((actuales) => ({ ...actuales, [campo]: valor }));
  }

  function pedirConfirmacion() {
    if (Object.keys(validarAvance(valores, porcentajeActual)).length > 0) {
      setIntentos((actuales) => actuales + 1);
      return;
    }
    reiniciar();
    setIntentos(0);
    setConfirmando(true);
  }

  function cancelar() {
    setConfirmando(false);
  }

  async function confirmar() {
    const request = armarAvance(valores);
    const resultado = await ejecutar(request);
    if (!resultado.ok) {
      setConfirmando(false);
      return;
    }
    avisar.exito(avisoDeAvanceRegistrado(request.porcentajeConcrecion));
    setRecargando(true);
    try {
      await alRegistrar();
    } finally {
      setRecargando(false);
    }
    setCambios(SIN_CAMBIOS);
    setConfirmando(false);
  }

  return {
    valores,
    errores,
    intentos,
    errorDelServidor: error,
    ocupado: enviando || recargando,
    confirmando,
    porcentajeAConfirmar: armarAvance(valores).porcentajeConcrecion,
    cambiar,
    pedirConfirmacion,
    cancelar,
    confirmar,
  };
}
