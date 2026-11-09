import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { clases } from "@/Presentation/Components/App/ui/clases.js";
import { fechaValida } from "@/Presentation/Formatos/colaboracion.js";
import {
  AVISO_MENSAJE_LEIDO,
  ERROR_AL_MARCAR_COMO_LEIDO,
  TEXTO_SIN_LEER,
  estaLeido,
  extractoDelMensaje,
  idsDeProyectosDelMensaje,
  textoDelEnlaceAlProyecto,
  textoDelMensaje,
  tituloDelMensaje,
} from "@/Presentation/Formatos/mensaje.js";
import { fechaLarga } from "@/Presentation/Formatos/proyecto.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useMarcarComoLeido } from "@/Presentation/Hooks/mensaje/useMarcarComoLeido.js";
import { estadoParaVolver, rutaProyecto } from "@/Presentation/Routes/rutas.js";
import estilos from "./MensajeDeLaBandeja.module.css";

export function MensajeDeLaBandeja({ mensaje, colaboradorId }) {
  const ubicacion = useLocation();
  const avisar = useAvisos();
  const [leido, setLeido] = useState(estaLeido(mensaje));
  const { marcarComoLeido } = useMarcarComoLeido(colaboradorId, mensaje.id);
  const idsDeProyectos = idsDeProyectosDelMensaje(mensaje);

  async function alAlternar(evento) {
    if (!evento.currentTarget.open || leido) return;
    const resultado = await marcarComoLeido();
    if (resultado.ignorada) return;
    if (resultado.ok) {
      setLeido(true);
      avisar.exito(AVISO_MENSAJE_LEIDO);
    } else {
      avisar.error(ERROR_AL_MARCAR_COMO_LEIDO);
    }
  }

  return (
    <li className={estilos.mensaje}>
      <details className={estilos.detalle} onToggle={alAlternar}>
        <summary className={estilos.resumen}>
          <span className={estilos.encabezado}>
            {!leido && <span className={estilos.sinLeer}>{TEXTO_SIN_LEER}</span>}
            {fechaValida(mensaje.fecha) && (
              <time className={estilos.fecha} dateTime={mensaje.fecha}>
                {fechaLarga(mensaje.fecha)}
              </time>
            )}
          </span>
          <span className={clases(estilos.titulo, !leido && estilos.destacado)}>
            {tituloDelMensaje(mensaje)}
          </span>
          <span className={estilos.extracto}>{extractoDelMensaje(mensaje)}</span>
        </summary>
        <div className={estilos.cuerpo}>
          <p className={estilos.texto}>{textoDelMensaje(mensaje)}</p>
          {idsDeProyectos.length > 0 && (
            <ul className={estilos.enlaces}>
              {idsDeProyectos.map((id, indice) => (
                <li key={id}>
                  <Link
                    className={estilos.enlace}
                    to={rutaProyecto(id)}
                    state={estadoParaVolver(ubicacion, "Volver a mis mensajes")}
                  >
                    {textoDelEnlaceAlProyecto(indice + 1, idsDeProyectos.length)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>
    </li>
  );
}
