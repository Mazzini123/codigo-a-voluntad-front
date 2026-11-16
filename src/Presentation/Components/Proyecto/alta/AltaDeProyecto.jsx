import { useEffect, useId, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAvisoCambiosSinGuardar } from "@/Presentation/Hooks/comunes/useAvisoCambiosSinGuardar.js";
import { useCatalogoDeHabilidades } from "@/Presentation/Hooks/habilidad/useCatalogoDeHabilidades.js";
import { DialogoDeConfirmacion } from "@/Presentation/Components/App/dialogos/DialogoDeConfirmacion.jsx";
import { IndicadorDePasos } from "@/Presentation/Components/App/navegacion/IndicadorDePasos.jsx";
import {
  PASOS_DEL_ALTA,
  proyectoARequest,
  proyectoEstaVacio,
  proyectoVacio,
} from "@/Presentation/Formularios/proyecto/formularioProyecto.js";
import { PasoDeRevision } from "./PasoDeRevision.jsx";
import { PasoDePerfiles } from "./PasoDePerfiles.jsx";
import { PasoDelProyecto } from "./PasoDelProyecto.jsx";
import { usePerfilesDelAlta } from "@/Presentation/Hooks/proyecto/usePerfilesDelAlta.js";
import { useAceptacionDeTerminos } from "@/Presentation/Hooks/terminos/useAceptacionDeTerminos.js";
import { pasoMaximoPermitido } from "@/Presentation/Formularios/proyecto/validarProyecto.js";
import estilos from "./AltaDeProyecto.module.css";

const NUEVA_VERSION_PUBLICADA = Object.freeze({
  titulo: "¿Publicar esta versión?",
  descripcion:
    "La publicación anterior pudo haberse guardado. Revisá Mis proyectos antes de publicar esta versión.",
  textoConfirmar: "Publicar esta versión",
});

const NUEVA_VERSION_DE_BORRADOR = Object.freeze({
  titulo: "¿Guardar esta versión como borrador?",
  descripcion:
    "El borrador anterior pudo haberse guardado. Revisá Mis proyectos antes de guardar esta versión.",
  textoConfirmar: "Guardar esta versión",
});

function pasoPedido(parametros) {
  const numero = Number(parametros.get("paso"));
  return Number.isInteger(numero) && numero >= 1 && numero <= PASOS_DEL_ALTA.length
    ? numero
    : 1;
}

export function AltaDeProyecto({
  publicando,
  guardandoBorrador,
  esBorrador,
  error,
  confirmandoNuevaVersion,
  terminos: estadoDeTerminos,
  alPublicar,
  alGuardarBorrador,
  alReiniciarError,
}) {
  const idBase = useId();
  const [parametros, setParametros] = useSearchParams();
  const [proyecto, setProyecto] = useState(proyectoVacio);
  const estadoDePerfiles = usePerfilesDelAlta();
  const catalogo = useCatalogoDeHabilidades();
  const refTitulo = useRef(null);
  const pasoAnterior = useRef(null);
  const terminos = useAceptacionDeTerminos(estadoDeTerminos);

  const { perfiles } = estadoDePerfiles;
  const pedido = pasoPedido(parametros);
  const maximo = pasoMaximoPermitido(proyecto, perfiles);
  const paso = Math.min(pedido, maximo);

  const hayDatos =
    !proyectoEstaVacio(proyecto) || perfiles.length > 0 || estadoDePerfiles.hayBorrador;
  const salida = useAvisoCambiosSinGuardar(hayDatos && !publicando && !guardandoBorrador);

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

  const enviarAlta = esBorrador ? alGuardarBorrador : alPublicar;
  const nuevaVersion = esBorrador ? NUEVA_VERSION_DE_BORRADOR : NUEVA_VERSION_PUBLICADA;

  function irAPaso(numero) {
    setParametros({ paso: String(numero) });
  }

  function volverAEditar(numero) {
    alReiniciarError();
    irAPaso(numero);
  }

  function pedidoDelAlta() {
    return terminos.conAceptacion(proyectoARequest(proyecto, perfiles));
  }

  function enviarSiAcepto(enviar) {
    if (terminos.validar()) enviar(pedidoDelAlta());
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
          guardandoBorrador={guardandoBorrador}
          error={error}
          terminos={terminos}
          alPublicar={() => enviarSiAcepto(alPublicar)}
          alGuardarBorrador={() => enviarSiAcepto(alGuardarBorrador)}
          alEditarProyecto={() => volverAEditar(1)}
          alEditarPerfiles={() => volverAEditar(2)}
        />
      )}

      <DialogoDeConfirmacion
        abierto={paso === 3 && confirmandoNuevaVersion}
        permanente={false}
        titulo={nuevaVersion.titulo}
        descripcion={nuevaVersion.descripcion}
        textoConfirmar={nuevaVersion.textoConfirmar}
        alConfirmar={() =>
          enviarAlta(pedidoDelAlta(), {
            confirmarNuevaVersion: true,
          })
        }
        alCancelar={alReiniciarError}
      />

      <DialogoDeConfirmacion
        abierto={salida.preguntando}
        permanente={false}
        peligroso
        titulo="¿Salir sin publicar?"
        descripcion="Los datos que cargaste se van a perder: el proyecto se guarda recién en el último paso, al publicarlo o al guardarlo como borrador."
        textoConfirmar="Salir sin publicar"
        textoCancelar="Seguir editando"
        alConfirmar={salida.salir}
        alCancelar={salida.quedarse}
      />
    </div>
  );
}
