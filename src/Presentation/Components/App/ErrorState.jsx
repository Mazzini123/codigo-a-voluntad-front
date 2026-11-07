import { useEffect, useRef, useState } from "react";
import { Boton } from "./Boton.jsx";
import { Icono } from "./Icono.jsx";
import estilos from "./ErrorState.module.css";

const MENSAJE_POR_DEFECTO = "Algo salió mal. Probá de nuevo.";
const CONTROLES_DE_TEXTO =
  'textarea, input:not([type="checkbox"], [type="radio"], [type="button"], [type="submit"], [type="reset"])';

function estaEscribiendo() {
  return Boolean(document.activeElement?.matches?.(CONTROLES_DE_TEXTO));
}

export function ErrorState({ titulo, error, alReintentar, nivel = 2, enfocar = true }) {
  const refTitulo = useRef(null);
  const huboReintento = useRef(false);
  const [reintentando, setReintentando] = useState(false);
  const Titulo = `h${nivel}`;
  const puedeReintentar = Boolean(alReintentar) && error?.esReintentable !== false;

  useEffect(() => {
    if (!enfocar) return;
    if (huboReintento.current || !estaEscribiendo()) refTitulo.current?.focus();
  }, [enfocar, error]);

  async function reintentar() {
    huboReintento.current = true;
    setReintentando(true);
    try {
      await alReintentar();
    } finally {
      setReintentando(false);
    }
  }

  return (
    <div role="alert" className={estilos.error}>
      <Icono nombre="alerta" tamano={24} className={estilos.icono} />
      <div className={estilos.contenido}>
        <Titulo ref={refTitulo} tabIndex={-1}>
          {titulo}
        </Titulo>
        <p>{error?.mensaje ?? MENSAJE_POR_DEFECTO}</p>
        {puedeReintentar && (
          <Boton
            icono="reintentar"
            className={estilos.accion}
            onClick={reintentar}
            enviando={reintentando}
            textoEnviando="Reintentando…"
          >
            Reintentar
          </Boton>
        )}
      </div>
    </div>
  );
}
