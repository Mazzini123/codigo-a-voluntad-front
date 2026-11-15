import { useRef } from "react";
import { DialogoDeConfirmacion } from "@/Presentation/Components/App/dialogos/DialogoDeConfirmacion.jsx";
import { Campo } from "@/Presentation/Components/App/ui/Campo.jsx";
import { ErrorDeAccion } from "@/Presentation/Components/Proyecto/avance/ErrorDeAccion.jsx";
import { useEnfocarPrimerError } from "@/Presentation/Hooks/comunes/useEnfocarPrimerError.js";
import estilos from "./DialogoDeLogro.module.css";

export function DialogoDeLogro({
  dialogo,
  formulario,
  errores,
  intentos,
  errorDelServidor,
  ocupado,
  alCambiar,
  alGuardar,
  alCancelar,
  destinoDeFoco,
}) {
  const refCampos = useRef(null);
  const editando = Boolean(dialogo.logro);
  const errorDeEnvio = errorDelServidor?.status === 409 ? null : errorDelServidor;
  useEnfocarPrimerError(refCampos, intentos, errorDelServidor);

  return (
    <DialogoDeConfirmacion
      abierto={dialogo.abierto}
      titulo={editando ? "Editar el logro" : "Cargar un logro"}
      descripcion="Se muestra en la página pública de avance del proyecto."
      textoConfirmar={editando ? "Guardar cambios" : "Cargar logro"}
      textoEnviando="Guardando…"
      enviando={ocupado}
      permanente={false}
      alConfirmar={alGuardar}
      alCancelar={alCancelar}
      destinoDeFoco={destinoDeFoco}
    >
      <div ref={refCampos} className={estilos.campos}>
        <Campo
          etiqueta="Título"
          obligatorio
          value={formulario.titulo}
          error={errores.titulo}
          disabled={ocupado}
          onChange={(evento) => alCambiar("titulo", evento.target.value)}
        />
        <Campo
          etiqueta="Descripción"
          obligatorio
          multilinea
          rows={5}
          value={formulario.descripcion}
          error={errores.descripcion}
          disabled={ocupado}
          onChange={(evento) => alCambiar("descripcion", evento.target.value)}
        />
        {errorDeEnvio && <ErrorDeAccion error={errorDeEnvio} />}
      </div>
    </DialogoDeConfirmacion>
  );
}
