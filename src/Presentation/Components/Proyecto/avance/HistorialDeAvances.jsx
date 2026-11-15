import { EnlaceExterno } from "@/Presentation/Components/App/ui/EnlaceExterno.jsx";
import { leerUrlExterna } from "@/Presentation/Components/App/ui/urlExterna.js";
import {
  TEXTO_SIN_AVANCES,
  textoDeAvanceRegistrado,
} from "@/Presentation/Formatos/avance.js";
import { fechaLarga } from "@/Presentation/Formatos/proyecto.js";
import estilos from "./HistorialDeAvances.module.css";

export function HistorialDeAvances({ avances }) {
  return (
    <section className={estilos.seccion} aria-labelledby="historial-de-avances">
      <h2 id="historial-de-avances">Historial de avances</h2>
      {avances.length === 0 ? (
        <p className={estilos.vacio}>{TEXTO_SIN_AVANCES}</p>
      ) : (
        <ul className={estilos.lista}>
          {avances.map((avance) => (
            <li key={avance.id} className={estilos.avance}>
              {avance.fecha && (
                <time className={estilos.fecha} dateTime={avance.fecha}>
                  {fechaLarga(avance.fecha)}
                </time>
              )}
              <p className={estilos.porcentaje}>{textoDeAvanceRegistrado(avance)}</p>
              <EnlacesDelAvance avance={avance} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EnlacesDelAvance({ avance }) {
  const tieneSistema = Boolean(leerUrlExterna(avance.urlSistema));
  const tieneRepositorio = Boolean(leerUrlExterna(avance.urlRepositorio));
  if (!tieneSistema && !tieneRepositorio) return null;
  return (
    <ul className={estilos.enlaces}>
      {tieneSistema && (
        <li>
          <EnlaceExterno url={avance.urlSistema}>Sistema de este avance</EnlaceExterno>
        </li>
      )}
      {tieneRepositorio && (
        <li>
          <EnlaceExterno url={avance.urlRepositorio}>
            Repositorio de este avance
          </EnlaceExterno>
        </li>
      )}
    </ul>
  );
}
