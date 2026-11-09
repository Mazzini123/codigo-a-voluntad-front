import { numeroEstadistico } from "@/Presentation/Formatos/estadistica.js";
import estilos from "./Estadisticas.module.css";

export function Indicadores({ valores }) {
  return (
    <dl className={estilos.indicadores}>
      {valores.map(([etiqueta, valor, unidad = ""]) => (
        <div key={etiqueta}>
          <dt>{etiqueta}</dt>
          <dd>
            {numeroEstadistico(valor)}
            {unidad}
          </dd>
        </div>
      ))}
    </dl>
  );
}
