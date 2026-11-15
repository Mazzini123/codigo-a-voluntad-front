import { Link } from "react-router-dom";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import marca from "./Marca.module.css";
import estilos from "./PieDePagina.module.css";
import { RUTA_COMO_EMPEZAR } from "@/Presentation/Routes/rutas.js";

export function PieDePagina() {
  return (
    <footer className={estilos.pie}>
      <div className={estilos.contenido}>
        <div className={estilos.presentacion}>
          <Icono nombre="codigo" tamano={32} className={marca.simbolo} />
          <div>
            <p className={estilos.nombre}>Código a Voluntad</p>
            <p>Colectivos sociales y colaboradoras de software.</p>
          </div>
        </div>
        <nav aria-label="Información del sitio">
          <Link to={RUTA_COMO_EMPEZAR} className={estilos.enlace}>
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
