import { useEffect, useId, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAvisoCambiosSinGuardar } from "../../Hooks/useAvisoCambiosSinGuardar.js";
import { useCatalogoDeHabilidades } from "../../Hooks/useCatalogoDeHabilidades.js";
import { ConfirmDialog } from "../App/ConfirmDialog.jsx";
import { IndicadorDePasos } from "../App/IndicadorDePasos.jsx";
import {
  PASOS_DEL_ALTA,
  proyectoARequest,
  proyectoEstaVacio,
  proyectoVacio,
} from "./formularioProyecto.js";
import { PasoDeRevision } from "./PasoDeRevision.jsx";
import { PasoDePerfiles } from "./PasoDePerfiles.jsx";
import { PasoDelProyecto } from "./PasoDelProyecto.jsx";
import { usePerfilesDelAlta } from "./usePerfilesDelAlta.js";
import { pasoMaximoPermitido } from "./validarProyecto.js";
import estilos from "./AltaDeProyecto.module.css";

function pasoPedido(parametros) {
  const numero = Number(parametros.get("paso"));
  return Number.isInteger(numero) && numero >= 1 && numero <= PASOS_DEL_ALTA.length
    ? numero
    : 1;
}

export function AltaDeProyecto({ publicando, error, alPublicar, alReiniciarError }) {
  const idBase = useId();
  const [parametros, setParametros] = useSearchParams();
  const [proyecto, setProyecto] = useState(proyectoVacio);
  const estadoDePerfiles = usePerfilesDelAlta();
  const catalogo = useCatalogoDeHabilidades();
  const refTitulo = useRef(null);
  const pasoAnterior = useRef(null);

  const { perfiles } = estadoDePerfiles;
  const pedido = pasoPedido(parametros);
  const maximo = pasoMaximoPermitido(proyecto, perfiles);
  const paso = Math.min(pedido, maximo);

  const hayDatos =
    !proyectoEstaVacio(proyecto) || perfiles.length > 0 || estadoDePerfiles.hayBorrador;
  const salida = useAvisoCambiosSinGuardar(hayDatos && !publicando);

  useEffect(() => {
    if (pedido > maximo) setParametros({ paso: String(maximo) }, { replace: true });
  }, [pedido, maximo, setParametros]);

  useEffect(() => {
    if (pasoAnterior.current === null) {
      pasoAnterior.current = paso;
      return;
    }
    if (pasoAnterior.current === paso) return;
    pasoAnterior.current = paso;
    refTitulo.current?.focus();
  }, [paso]);

  function irAPaso(numero) {
    setParametros({ paso: String(numero) });
  }

  function volverAEditar(numero) {
    alReiniciarError();
    irAPaso(numero);
  }

  function cambiarProyecto(cambio) {
    setProyecto((actual) => ({ ...actual, ...cambio }));
  }

  return (
    <div className={estilos.alta}>
      <IndicadorDePasos
        pasos={PASOS_DEL_ALTA}
        actual={paso}
        etiqueta="Pasos para publicar el proyecto"
      />

      {paso === 1 && (
        <PasoDelProyecto
          idBase={idBase}
          refTitulo={refTitulo}
          proyecto={proyecto}
          alCambiar={cambiarProyecto}
          alSiguiente={() => irAPaso(2)}
        />
      )}
      {paso === 2 && (
        <PasoDePerfiles
          idBase={idBase}
          refTitulo={refTitulo}
          catalogo={catalogo}
          estadoDePerfiles={estadoDePerfiles}
          alAtras={() => irAPaso(1)}
          alSiguiente={() => irAPaso(3)}
        />
      )}
      {paso === 3 && (
        <PasoDeRevision
          refTitulo={refTitulo}
          proyecto={proyecto}
          perfiles={perfiles}
          publicando={publicando}
          error={error}
          alPublicar={() => alPublicar(proyectoARequest(proyecto, perfiles))}
          alEditarProyecto={() => volverAEditar(1)}
          alEditarPerfiles={() => volverAEditar(2)}
        />
      )}

      <ConfirmDialog
        abierto={salida.preguntando}
        permanente={false}
        peligroso
        titulo="¿Salir sin publicar?"
        descripcion="Los datos que cargaste se van a perder: los borradores no se guardan."
        textoConfirmar="Salir sin publicar"
        textoCancelar="Seguir editando"
        alConfirmar={salida.salir}
        alCancelar={salida.quedarse}
      />
    </div>
  );
}
