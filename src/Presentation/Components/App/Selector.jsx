import { useId } from "react";
import { AyudaYError, EtiquetaDeCampo } from "./Campo.jsx";
import { describir } from "./campoAccesible.js";
import estilosDeCampo from "./Campo.module.css";

export function Selector({
  etiqueta,
  opciones,
  obligatorio = false,
  ayuda,
  error,
  textoVacio,
  id: idRecibido,
  ...control
}) {
  const idGenerado = useId();
  const id = idRecibido ?? idGenerado;
  return (
    <div className={estilosDeCampo.campo}>
      <EtiquetaDeCampo htmlFor={id} obligatorio={obligatorio}>
        {etiqueta}
      </EtiquetaDeCampo>
      <select
        id={id}
        className={`${estilosDeCampo.control} ${error ? estilosDeCampo.conError : ""}`}
        aria-invalid={error ? true : undefined}
        aria-required={obligatorio || undefined}
        aria-describedby={describir(id, { ayuda, error })}
        {...control}
      >
        {textoVacio && <option value="">{textoVacio}</option>}
        {opciones.map(({ valor, texto }) => (
          <option key={valor} value={valor}>
            {texto}
          </option>
        ))}
      </select>
      <AyudaYError id={id} ayuda={ayuda} error={error} />
    </div>
  );
}
