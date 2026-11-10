import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useCambiarContexto } from "@/Presentation/Hooks/sesion/useCambiarContexto.js";
import {
  detalleDelContexto,
  nombreDelContexto,
} from "@/Presentation/Formatos/contexto.js";
import estilos from "./SelectorDeContexto.module.css";
import { clases } from "@/Presentation/Components/App/ui/clases.js";

export function SelectorDeContexto({ contextos, etiqueta, claseDeOpcion, alElegir }) {
  const { cambiar, enviando } = useCambiarContexto();
  const avisar = useAvisos();

  async function elegir(contexto) {
    const resultado = await cambiar(contexto);
    if (resultado.ok) {
      alElegir?.(contexto);
      avisar.exito(`Ahora operás como ${nombreDelContexto(contexto)}.`);
    } else if (resultado.error) {
      avisar.error(resultado.error.mensaje);
    }
  }

  if (contextos.length === 0) return null;

  return (
    <ul className={estilos.lista} aria-label={etiqueta}>
      {contextos.map((contexto) => (
        <li key={contexto.id}>
          <button
            type="button"
            className={clases(estilos.opcion, claseDeOpcion)}
            disabled={enviando}
            aria-busy={enviando || undefined}
            onClick={() => elegir(contexto)}
          >
            <span className={estilos.nombre}>{nombreDelContexto(contexto)}</span>
            <span className={estilos.detalle}>{detalleDelContexto(contexto)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
