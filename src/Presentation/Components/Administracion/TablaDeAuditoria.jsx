import { Link } from "react-router-dom";
import { TIPO_ENTIDAD_AUDITADA } from "@/Application/Domain/Enums/TIPO_ENTIDAD_AUDITADA.js";
import {
  fechaYHora,
  textoDeAccion,
  textoDeDetalle,
  textoDeEntidad,
  textoDeQuien,
} from "@/Presentation/Formatos/auditoria.js";
import { rutaColectivo, rutaProyecto } from "@/Presentation/Routes/rutas.js";
import estilos from "./TablaDeAuditoria.module.css";

const ENLACES_DE_ENTIDAD = Object.freeze({
  [TIPO_ENTIDAD_AUDITADA.PROYECTO]: { ruta: rutaProyecto, texto: "Ver proyecto" },
  [TIPO_ENTIDAD_AUDITADA.COLECTIVO]: { ruta: rutaColectivo, texto: "Ver colectivo" },
});

function EnlaceDeEntidad({ entidad }) {
  const enlace = ENLACES_DE_ENTIDAD[entidad?.tipo];
  if (!enlace || !entidad.id) return null;
  return (
    <>
      {" · "}
      <Link to={enlace.ruta(entidad.id)}>{enlace.texto}</Link>
    </>
  );
}

export function TablaDeAuditoria({ acciones }) {
  return (
    <table className={estilos.tabla}>
      <caption className={estilos.titulo}>Acciones administrativas</caption>
      <thead>
        <tr>
          <th scope="col">Fecha</th>
          <th scope="col">Quién</th>
          <th scope="col">Acción</th>
          <th scope="col">Sobre qué</th>
          <th scope="col">Detalle</th>
        </tr>
      </thead>
      <tbody>
        {acciones.map((accion) => {
          const detalle = textoDeDetalle(accion.accion, accion.detalle);
          return (
            <tr key={accion.id}>
              <td data-etiqueta="Fecha">
                <time dateTime={accion.fecha}>{fechaYHora(accion.fecha)}</time>
              </td>
              <td data-etiqueta="Quién">{textoDeQuien(accion.usuarioId)}</td>
              <td data-etiqueta="Acción">{textoDeAccion(accion.accion)}</td>
              <td data-etiqueta="Sobre qué">
                {textoDeEntidad(accion.entidad?.tipo)}
                <EnlaceDeEntidad entidad={accion.entidad} />
              </td>
              <td data-etiqueta="Detalle">{detalle ?? "—"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
