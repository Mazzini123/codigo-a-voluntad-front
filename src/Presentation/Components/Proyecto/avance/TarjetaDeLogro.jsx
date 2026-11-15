import { fechaLarga } from "@/Presentation/Formatos/proyecto.js";
import estilos from "./TarjetaDeLogro.module.css";

export function TarjetaDeLogro({ logro, children }) {
  return (
    <article className={estilos.tarjeta}>
      <h3>{logro.titulo}</h3>
      {logro.descripcion && <p className={estilos.descripcion}>{logro.descripcion}</p>}
      {logro.fecha && (
        <time className={estilos.fecha} dateTime={logro.fecha}>
          {fechaLarga(logro.fecha)}
        </time>
      )}
      {children && <div className={estilos.acciones}>{children}</div>}
    </article>
  );
}
