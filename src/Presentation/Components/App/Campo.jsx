import { useId } from "react";
import { Icono } from "./Icono.jsx";
import { describir, idsDeCampo } from "./campoAccesible.js";
import estilos from "./Campo.module.css";

export function EtiquetaDeCampo({ htmlFor, obligatorio, children }) {
  return (
    <label htmlFor={htmlFor} className={estilos.etiqueta}>
      {children}
      {obligatorio && " (obligatorio)"}
    </label>
  );
}

export function AyudaYError({ id, ayuda, error }) {
  const ids = idsDeCampo(id);
  return (
    <>
      {ayuda && (
        <p id={ids.ayuda} className={estilos.ayuda}>
          {ayuda}
        </p>
      )}
      {error && (
        <p id={ids.error} className={estilos.error}>
          <Icono nombre="alerta" tamano={16} />
          {error}
        </p>
      )}
    </>
  );
}

export function Campo({
  etiqueta,
  obligatorio = false,
  ayuda,
  error,
  multilinea = false,
  id: idRecibido,
  ...control
}) {
  const idGenerado = useId();
  const id = idRecibido ?? idGenerado;
  const Control = multilinea ? "textarea" : "input";
  return (
    <div className={estilos.campo}>
      <EtiquetaDeCampo htmlFor={id} obligatorio={obligatorio}>
        {etiqueta}
      </EtiquetaDeCampo>
      <Control
        id={id}
        className={`${estilos.control} ${error ? estilos.conError : ""}`}
        aria-invalid={error ? true : undefined}
        aria-required={obligatorio || undefined}
        aria-describedby={describir(id, { ayuda, error })}
        {...control}
      />
      <AyudaYError id={id} ayuda={ayuda} error={error} />
    </div>
  );
}
