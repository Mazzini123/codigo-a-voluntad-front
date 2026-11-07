import { Navigate, useLocation } from "react-router-dom";
import { EnlaceBoton } from "../Components/App/EnlaceBoton.jsx";
import { TituloDePagina } from "../Components/App/TituloDePagina.jsx";
import { useAuth } from "../Hooks/useAuth.js";
import { inicioPorRol } from "../Routes/rutas.js";
import estilos from "./InicioPage.module.css";

export function InicioPage() {
  const { usuario, cargando } = useAuth();
  const { hash } = useLocation();
  if (!cargando && usuario && hash !== "#como-empezar")
    return <Navigate to={inicioPorRol(usuario.rol)} replace />;

  return (
    <div className={estilos.pagina}>
      <TituloDePagina>Inicio</TituloDePagina>
      <header className={estilos.introduccion}>
        <h1 tabIndex={-1}>
          Conectamos colectivos sociales con personas que desarrollan software
        </h1>
        <p>
          Un espacio para compartir lo que tu colectivo necesita y encontrar proyectos a
          los que aportar tus habilidades.
        </p>
        <EnlaceBoton to="/proyectos" variante="primario">
          Explorar proyectos
        </EnlaceBoton>
      </header>

      <section className={estilos.recorridos} aria-labelledby="como-empezar">
        <h2 id="como-empezar" tabIndex={-1}>
          Dos formas de empezar
        </h2>
        <div className={estilos.recorrido}>
          <div className={estilos.tituloDeRecorrido}>
            <h3>Quiero colaborar</h3>
            <p>Encontrá un proyecto al que aportar lo que sabés hacer.</p>
          </div>
          <ol className={estilos.pasos}>
            <li>Completá tu perfil y sumá tus habilidades.</li>
            <li>
              Explorá los proyectos y los perfiles que buscan. Cada ficha informa el
              compromiso, la remuneración y cómo se aceptan las postulaciones.
            </li>
            <li>Postulate al perfil que encaje con lo que podés aportar.</li>
          </ol>
        </div>
        <div className={`${estilos.recorrido} ${estilos.colectivo}`}>
          <div className={estilos.tituloDeRecorrido}>
            <h3>Mi colectivo necesita software</h3>
            <p>Contá qué necesitan y qué personas podrían sumarse.</p>
          </div>
          <div className={estilos.contenidoDeRecorrido}>
            <ol className={estilos.pasos}>
              <li>Creá el perfil de tu colectivo.</li>
              <li>Publicá el proyecto con los perfiles que necesitan.</li>
              <li>
                Gestioná las postulaciones según la forma de aceptación que elijas para
                cada perfil.
              </li>
            </ol>
            <div className={estilos.accionDeColectivo}>
              <EnlaceBoton to="/registro" aria-describedby="antes-de-publicar">
                Publicar un proyecto
              </EnlaceBoton>
              <p id="antes-de-publicar">
                Primero creás una cuenta y completás el perfil de tu colectivo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={estilos.preguntas} aria-labelledby="preguntas-inicio">
        <h2 id="preguntas-inicio">Antes de empezar</h2>
        <dl>
          <div>
            <dt>¿Necesito una cuenta para explorar?</dt>
            <dd>
              Podés buscar y consultar proyectos sin registrarte. Para postularte o
              publicar, necesitás ingresar y completar tu perfil.
            </dd>
          </div>
          <div>
            <dt>¿Todas las colaboraciones son sin remuneración?</dt>
            <dd>
              Cada perfil informa si la colaboración es sin remuneración, con incentivo
              económico o con posibilidad de contratación.
            </dd>
          </div>
          <div>
            <dt>¿Cuándo se comparten mis datos de contacto?</dt>
            <dd>
              Depende de cómo se aceptan las postulaciones en ese perfil. Antes de enviar
              la tuya, vas a ver cuándo se comparten. Si la aceptación es automática,
              puede ser al enviarla.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
