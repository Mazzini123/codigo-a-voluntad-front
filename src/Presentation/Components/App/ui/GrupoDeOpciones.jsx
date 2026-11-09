import { useId } from "react";
import { AyudaYError } from "./Campo.jsx";
import { describir } from "./campoAccesible.js";
import estilosDeCampo from "./Campo.module.css";

export function GrupoDeOpciones({
  leyenda,
  opciones,
  valor,
  alCambiar,
  obligatorio = false,
  ayuda,
  error,
  id: idRecibido,
}) {
  const idGenerado = useId();
  const id = idRecibido ?? idGenerado;
  return (
    <fieldset
      id={id}
      tabIndex={-1}
      className={estilosDeCampo.opciones}
      aria-invalid={error ? true : undefined}
      aria-describedby={describir(id, { ayuda, error })}
    >
      <legend className={estilosDeCampo.etiqueta}>
        {leyenda}
        {obligatorio && " (obligatorio)"}
      </legend>
      {opciones.map((opcion) => (
        <label key={opcion.valor} className={estilosDeCampo.opcion}>
          <input
            type="radio"
            name={id}
            value={opcion.valor}
            checked={valor === opcion.valor}
            onChange={() => alCambiar(opcion.valor)}
          />
          {opcion.texto}
        </label>
      ))}
      <AyudaYError id={id} ayuda={ayuda} error={error} />
    </fieldset>
  );
}
