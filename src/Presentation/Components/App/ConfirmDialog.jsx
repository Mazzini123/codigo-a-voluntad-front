import { useEffect, useId, useRef } from "react";
import { Boton } from "./Boton.jsx";
import { Icono } from "./Icono.jsx";
import estilos from "./ConfirmDialog.module.css";

export function ConfirmDialog({
  abierto,
  titulo,
  descripcion,
  textoConfirmar,
  textoEnviando,
  textoCancelar = "Cancelar",
  enviando = false,
  permanente = true,
  peligroso = permanente,
  alConfirmar,
  alCancelar,
  destinoDeFoco,
  children,
}) {
  const refDialogo = useRef(null);
  const refCancelar = useRef(null);
  const refFocoPrevio = useRef(null);
  const idTitulo = useId();
  const idDescripcion = useId();

  useEffect(() => {
    const dialogo = refDialogo.current;
    if (abierto && !dialogo.open) {
      refFocoPrevio.current = document.activeElement;
      dialogo.showModal();
      refCancelar.current?.focus();
    }
    if (!abierto && dialogo.open) {
      dialogo.close();
      const destino = destinoDeFoco?.() ?? refFocoPrevio.current;
      destino?.focus?.();
    }
  }, [abierto, destinoDeFoco]);

  function alPresionarEscape(evento) {
    evento.preventDefault();
    if (!enviando) alCancelar();
  }

  return (
    <dialog
      ref={refDialogo}
      className={estilos.dialogo}
      aria-labelledby={idTitulo}
      aria-describedby={idDescripcion}
      onCancel={alPresionarEscape}
    >
      <div className={estilos.cuerpo}>
        <h2 id={idTitulo}>{titulo}</h2>
        <p id={idDescripcion}>{descripcion}</p>
        {children}
        {permanente && (
          <p className={estilos.permanente}>
            <Icono nombre="aviso" />
            Esta acción no se puede deshacer.
          </p>
        )}
        <div className={estilos.acciones}>
          <Boton ref={refCancelar} onClick={alCancelar} disabled={enviando}>
            {textoCancelar}
          </Boton>
          <Boton
            variante={peligroso ? "peligrosoConfirmar" : "primario"}
            onClick={alConfirmar}
            enviando={enviando}
            textoEnviando={textoEnviando}
          >
            {textoConfirmar}
          </Boton>
        </div>
      </div>
    </dialog>
  );
}
