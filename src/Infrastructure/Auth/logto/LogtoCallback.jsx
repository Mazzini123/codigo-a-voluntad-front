import { useHandleSignInCallback } from "@logto/react";
import { useEffect, useState } from "react";

const ESPERA_DE_CALLBACK_MS = 1000;

export function LogtoCallback({ alCompletar, alFallar }) {
  const [procesado, setProcesado] = useState(false);
  const [sinRespuesta, setSinRespuesta] = useState(false);
  const { isLoading, error } = useHandleSignInCallback(() => setProcesado(true));
  const parametros = new URLSearchParams(window.location.search);
  const incompleto = !parametros.has("code") || !parametros.has("state");
  const fallo =
    !procesado && (Boolean(error) || sinRespuesta || (!isLoading && incompleto));

  useEffect(() => {
    if (procesado || isLoading || error || incompleto) return undefined;
    const espera = setTimeout(() => setSinRespuesta(true), ESPERA_DE_CALLBACK_MS);
    return () => clearTimeout(espera);
  }, [procesado, isLoading, error, incompleto]);

  useEffect(() => {
    if (procesado) alCompletar();
  }, [procesado, alCompletar]);

  useEffect(() => {
    if (fallo) alFallar();
  }, [fallo, alFallar]);

  return null;
}
