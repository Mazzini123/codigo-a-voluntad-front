import { useId } from "react";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import { avisoDePublicacion } from "@/Presentation/Formatos/publicacion.js";
import estilos from "./AvisoDePublicacion.module.css";

export function AvisoDePublicacion({
  proyecto,
  esAdministracion = false,
  nivel = 2,
  refTitulo,
  children,
}) {
  const idTitulo = useId();
  const aviso = avisoDePublicacion(proyecto, { esAdministracion });
  if (!aviso) return null;
  const Titulo = `h${nivel}`;
  return (
    <section className={estilos.aviso} aria-labelledby={idTitulo}>
      <Icono nombre="info" tamano={24} />
      <div className={estilos.cuerpo}>
        <Titulo id={idTitulo} ref={refTitulo} tabIndex={-1} className={estilos.titulo}>
          {aviso.titulo}
        </Titulo>
        {aviso.rechazo && (
          <div className={estilos.rechazo}>
            <p className={estilos.etiqueta}>{aviso.rechazo.etiqueta}</p>
            <p className={estilos.nota}>{aviso.rechazo.nota}</p>
          </div>
        )}
        <p>{aviso.descripcion}</p>
        {aviso.ayuda && <p className={estilos.ayuda}>{aviso.ayuda}</p>}
        {children && <div className={estilos.acciones}>{children}</div>}
      </div>
    </section>
  );
}
