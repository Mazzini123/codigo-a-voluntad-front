import estilos from "./IndicadorDePasos.module.css";

export function IndicadorDePasos({ pasos, actual, etiqueta }) {
  return (
    <div className={estilos.indicador}>
      <p className={estilos.compacto}>
        Paso {actual} de {pasos.length} · {pasos[actual - 1]}
      </p>
      <ol className={estilos.pasos} aria-label={etiqueta}>
        {pasos.map((paso, indice) => {
          const numero = indice + 1;
          const esActual = numero === actual;
          return (
            <li
              key={paso}
              className={`${estilos.paso} ${esActual ? estilos.actual : ""}`}
              aria-current={esActual ? "step" : undefined}
            >
              {numero}. {paso}
              {numero < pasos.length && (
                <span aria-hidden="true" className={estilos.separador}>
                  ·
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
