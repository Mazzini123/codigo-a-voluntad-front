import { Link } from "react-router-dom";
import estilos from "./PieDePagina.module.css";

export function PieDePagina() {
  return (
    <footer className={estilos.pie}>
      <div className={estilos.contenido}>
        <div className={estilos.presentacion}>
          <p className={estilos.nombre}>Código a Voluntad</p>
          <p>Colectivos sociales y colaboradoras de software.</p>
        </div>
        <nav aria-label="Información del sitio">
          <Link to="/#como-empezar" className={estilos.enlace}>
            Cómo funciona
          </Link>
        </nav>
        <p className={estilos.academico}>
          Proyecto académico de Desarrollo de Software · UTN FRBA
        </p>
      </div>
    </footer>
  );
}
