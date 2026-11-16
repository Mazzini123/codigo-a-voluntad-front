import { useState } from "react";
import { DialogoDeConfirmacion } from "@/Presentation/Components/App/dialogos/DialogoDeConfirmacion.jsx";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { ErrorDeAccion } from "@/Presentation/Components/Proyecto/avance/ErrorDeAccion.jsx";
import { usePedirPublicacion } from "@/Presentation/Hooks/proyecto/usePedirPublicacion.js";
import estilos from "./PedirPublicacion.module.css";

export function PedirPublicacion({
  proyecto,
  alCambiar,
  destinoDeFoco,
  variante = "secundario",
}) {
  const [confirmando, setConfirmando] = useState(false);
  const { pidiendo, error, pedir, limpiar } = usePedirPublicacion(proyecto.id, alCambiar);

  function abrir() {
    limpiar();
    setConfirmando(true);
  }

  async function confirmar() {
    setConfirmando(false);
    if (await pedir()) destinoDeFoco?.()?.focus();
  }

  return (
    <div className={estilos.accion}>
      <Boton
        variante={variante}
        enviando={pidiendo}
        textoEnviando="Pidiendo publicación…"
        aria-label={`Pedir publicación de ${proyecto.titulo}`}
        onClick={abrir}
      >
        Pedir publicación
      </Boton>
      {error && <ErrorDeAccion error={error} />}
      <DialogoDeConfirmacion
        abierto={confirmando}
        permanente={false}
        titulo="¿Pedir la publicación?"
        descripcion="Administración va a revisar el proyecto antes de publicarlo. Mientras tanto no vas a poder editarlo; si pide cambios, vuelve a ser un borrador con su nota."
        textoConfirmar="Pedir publicación"
        alConfirmar={confirmar}
        alCancelar={() => setConfirmando(false)}
      />
    </div>
  );
}
