import { useId, useMemo, useRef, useState } from "react";
import { idDeCampo } from "@/Presentation/Formularios/comunes/formulario.js";
import { itemsDelResumen } from "@/Presentation/Formularios/comunes/resumenDeErrores.js";
import { useAvisoCambiosSinGuardar } from "@/Presentation/Hooks/comunes/useAvisoCambiosSinGuardar.js";
import { useEnfocarPrimerError } from "@/Presentation/Hooks/comunes/useEnfocarPrimerError.js";

export function useFormularioDePerfil({
  crearEstadoInicial,
  validar,
  cambios,
  aRequest,
  erroresDesdeIssues,
  esAlta,
  enviando,
  errorEnvio,
  alEnviar,
}) {
  const [original] = useState(crearEstadoInicial);
  const [estado, setEstado] = useState(original);
  const [visibles, setVisibles] = useState(() => new Set());
  const [pedidoDeFoco, setPedidoDeFoco] = useState(0);
  const refFormulario = useRef(null);
  const idBase = useId();

  const pendientes = useMemo(
    () => cambios(original, estado),
    [cambios, original, estado],
  );
  const hayCambios = Object.keys(pendientes).length > 0;
  const haySinGuardar = esAlta
    ? JSON.stringify(original) !== JSON.stringify(estado)
    : hayCambios;
  const salida = useAvisoCambiosSinGuardar(haySinGuardar && !enviando);

  const deServidor = useMemo(
    () => erroresDesdeIssues(errorEnvio?.issues, estado).errores,
    [erroresDesdeIssues, errorEnvio, estado],
  );
  const errores = useMemo(() => {
    const locales = Object.entries(validar(estado, { esAlta })).filter(([clave]) =>
      visibles.has(clave),
    );
    return { ...deServidor, ...Object.fromEntries(locales) };
  }, [validar, deServidor, estado, esAlta, visibles]);
  const sinCampo =
    errorEnvio && Object.keys(deServidor).length === 0 ? errorEnvio.mensaje : null;
  const resumen = useMemo(
    () => itemsDelResumen(errores, estado, idBase),
    [errores, estado, idBase],
  );

  useEnfocarPrimerError(refFormulario, pedidoDeFoco, errorEnvio);

  function actualizar(cambio) {
    setEstado((previo) => ({ ...previo, ...cambio }));
  }

  function enviar(evento) {
    evento.preventDefault();
    if (enviando) return;
    const encontrados = validar(estado, { esAlta });
    if (Object.keys(encontrados).length > 0) {
      setVisibles(new Set(Object.keys(encontrados)));
      setPedidoDeFoco((pedido) => pedido + 1);
      return;
    }
    alEnviar(esAlta ? aRequest(estado) : pendientes);
  }

  return {
    estado,
    setEstado,
    actualizar,
    idBase,
    idDe: (clave) => idDeCampo(idBase, clave),
    refFormulario,
    errores,
    resumen,
    sinCampo,
    hayCambios,
    salida,
    enviar,
  };
}
