import { useId } from "react";
import { Icono } from "./Icono.jsx";
import estilos from "./Boton.module.css";

export function Boton({
  variante = "secundario",
  type = "button",
  icono,
  enviando = false,
  textoEnviando,
  motivoDeshabilitado,
  disabled = false,
  className,
  children,
  ...resto
}) {
  const idMotivo = useId();
  const mostrarMotivo = disabled && !enviando && Boolean(motivoDeshabilitado);
  const clases = [estilos.boton, estilos[variante], className].filter(Boolean).join(" ");

  const boton = (
    <button
      type={type}
      className={clases}
      disabled={disabled || enviando}
      aria-busy={enviando || undefined}
      aria-describedby={mostrarMotivo ? idMotivo : undefined}
      {...resto}
    >
      {enviando ? (
        <span className={estilos.indicador} aria-hidden="true" />
      ) : (
        icono && <Icono nombre={icono} />
      )}
      {enviando && textoEnviando ? textoEnviando : children}
    </button>
  );

  if (!mostrarMotivo) return boton;
  return (
    <span className={estilos.contenedor}>
      {boton}
      <span id={idMotivo} className={estilos.motivo}>
        {motivoDeshabilitado}
      </span>
    </span>
  );
}
