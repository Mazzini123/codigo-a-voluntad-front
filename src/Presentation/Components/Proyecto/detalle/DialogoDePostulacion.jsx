import { DialogoDeConfirmacion } from "@/Presentation/Components/App/dialogos/DialogoDeConfirmacion.jsx";
import { GrupoDeOpciones } from "@/Presentation/Components/App/ui/GrupoDeOpciones.jsx";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import { textoPrivacidadDePostulacion } from "@/Presentation/Formatos/proyecto.js";
import estilos from "./DialogoDePostulacion.module.css";

const CON_NOMBRE = "nombre";
const ANONIMA = "anonima";
const OPCIONES = [
  { valor: CON_NOMBRE, texto: "Con mi nombre" },
  { valor: ANONIMA, texto: "Contribución anónima" },
];
const ERROR_POR_DEFECTO = "No pudimos enviar tu postulación. Probá de nuevo.";

export function DialogoDePostulacion({
  perfil,
  proyecto,
  esPublica,
  enviando,
  error,
  alCambiarVisibilidad,
  alEnviar,
  alCancelar,
  destinoDeFoco,
}) {
  return (
    <DialogoDeConfirmacion
      abierto={Boolean(perfil)}
      titulo="¿Te postulás a este perfil?"
      descripcion={
        <>
          <span className={estilos.recortada}>{perfil?.descripcion}</span>{" "}
          <span className={estilos.recortada}>Proyecto: {proyecto.titulo}.</span>
        </>
      }
      textoConfirmar="Enviar postulación"
      textoEnviando="Enviando…"
      enviando={enviando}
      permanente={false}
      alConfirmar={alEnviar}
      alCancelar={alCancelar}
      destinoDeFoco={destinoDeFoco}
    >
      <GrupoDeOpciones
        leyenda="¿Cómo querés aparecer en el proyecto?"
        opciones={OPCIONES}
        valor={esPublica ? CON_NOMBRE : ANONIMA}
        alCambiar={(valor) => alCambiarVisibilidad(valor === CON_NOMBRE)}
        ayuda="Si elegís anónima, en el proyecto se va a ver «Contribución anónima» en lugar de tu nombre."
      />
      <p className={estilos.info}>
        <Icono nombre="info" />
        {textoPrivacidadDePostulacion(perfil)}
      </p>
      {error && (
        <p role="alert" className={estilos.error}>
          <Icono nombre="alerta" />
          {error.mensaje ?? ERROR_POR_DEFECTO}
        </p>
      )}
    </DialogoDeConfirmacion>
  );
}
