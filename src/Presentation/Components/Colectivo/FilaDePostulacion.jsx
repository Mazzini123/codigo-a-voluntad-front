import { Link } from "react-router-dom";
import { nombreVisible } from "@/Presentation/Formatos/colaboradora.js";
import { fechaLarga } from "@/Presentation/Formatos/proyecto.js";
import { rutaPostulacionesRecibidas } from "@/Presentation/Routes/rutas.js";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import { TextoOculto } from "@/Presentation/Components/App/ui/TextoOculto.jsx";
import estilos from "./FilaDePostulacion.module.css";
import { clases } from "@/Presentation/Components/App/ui/clases.js";

function nombreDeLaPersona(colaboracion) {
  if (colaboracion.esPublica === false) return "Postulación anónima";
  return (
    nombreVisible(colaboracion.esPublica === true ? colaboracion.colaborador : null) ||
    "Identidad no disponible"
  );
}

export function FilaDePostulacion({ proyecto, colaboracion, perfil }) {
  const esAnonima = colaboracion.esPublica === false;
  return (
    <div className={estilos.fila}>
      <div>
        <p className={estilos.persona}>{nombreDeLaPersona(colaboracion)}</p>
        {esAnonima && (
          <p className={estilos.secundario}>
            Contribución anónima: su identidad no se muestra.
          </p>
        )}
        {perfil?.descripcion && <p className={estilos.perfil}>{perfil.descripcion}</p>}
        <p className={clases(estilos.secundario, estilos.contexto)}>
          <span>{proyecto.titulo}</span>
          {colaboracion.fecha && (
            <time dateTime={colaboracion.fecha}>{fechaLarga(colaboracion.fecha)}</time>
          )}
        </p>
      </div>
      <Link
        className={estilos.revisar}
        to={`${rutaPostulacionesRecibidas(proyecto.id)}?estado=PENDIENTE`}
      >
        Revisar <TextoOculto>postulaciones de {proyecto.titulo}</TextoOculto>
        <Icono nombre="avanzar" tamano={16} />
      </Link>
    </div>
  );
}
