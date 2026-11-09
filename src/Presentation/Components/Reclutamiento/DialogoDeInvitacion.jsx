import { DialogoDeConfirmacion } from "@/Presentation/Components/App/dialogos/DialogoDeConfirmacion.jsx";
import { Campo } from "@/Presentation/Components/App/ui/Campo.jsx";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import { TextoOculto } from "@/Presentation/Components/App/ui/TextoOculto.jsx";
import {
  AVISO_DE_CARACTERES,
  caracteresRestantes,
  LIMITE_DE_MENSAJE,
} from "@/Presentation/Formularios/reclutamiento/invitacion.js";
import { nombreVisible } from "@/Presentation/Formatos/colaboradora.js";
import {
  descripcionDeInvitacion,
  textoDeCaracteresRestantes,
} from "@/Presentation/Formatos/reclutamiento.js";
import estilos from "./DialogoDeInvitacion.module.css";

const ERROR_POR_DEFECTO = "No pudimos enviar la invitación. Probá de nuevo.";

export function DialogoDeInvitacion({
  colaborador,
  perfil,
  proyecto,
  mensaje,
  errorDelMensaje,
  errorDeEnvio,
  enviando,
  alCambiarMensaje,
  alEnviar,
  alCancelar,
  destinoDeFoco,
}) {
  const restantes = caracteresRestantes(mensaje);
  const texto = textoDeCaracteresRestantes(restantes);
  return (
    <DialogoDeConfirmacion
      abierto={Boolean(colaborador)}
      titulo={`Invitar a «${nombreVisible(colaborador)}»`}
      descripcion={descripcionDeInvitacion(perfil, proyecto)}
      textoConfirmar="Enviar invitación"
      textoEnviando="Enviando…"
      enviando={enviando}
      permanente={false}
      alConfirmar={alEnviar}
      alCancelar={alCancelar}
      destinoDeFoco={destinoDeFoco}
    >
      <Campo
        etiqueta="Mensaje"
        multilinea
        rows={5}
        value={mensaje}
        error={errorDelMensaje}
        ayuda={`Hasta ${LIMITE_DE_MENSAJE} caracteres.`}
        disabled={enviando}
        onChange={(evento) => alCambiarMensaje(evento.target.value)}
      />
      <p
        aria-hidden="true"
        className={restantes < 0 ? estilos.excedido : estilos.contador}
      >
        {texto}
      </p>
      <TextoOculto aria-live="polite">
        {restantes <= AVISO_DE_CARACTERES ? texto : ""}
      </TextoOculto>
      {errorDeEnvio && (
        <p role="alert" className={estilos.error}>
          <Icono nombre="alerta" />
          {errorDeEnvio.mensaje ?? ERROR_POR_DEFECTO}
        </p>
      )}
    </DialogoDeConfirmacion>
  );
}
