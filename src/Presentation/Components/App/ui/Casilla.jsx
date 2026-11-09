import { useId } from "react";
import { describir } from "./campoAccesible.js";
import { AyudaYError } from "./Campo.jsx";
import estilos from "./Campo.module.css";

export function Casilla({ etiqueta, ayuda, error, id: idRecibido, ...control }) {
  const idGenerado = useId();
  const id = idRecibido ?? idGenerado;
  return (
    <div className={estilos.campo}>
      <label htmlFor={id} className={estilos.opcion}>
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={describir(id, { ayuda, error })}
          {...control}
        />
        {etiqueta}
      </label>
      <AyudaYError id={id} ayuda={ayuda} error={error} />
    </div>
  );
}
