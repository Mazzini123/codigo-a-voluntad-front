import { useRef, useState } from "react";
import { EstadisticasGlobales } from "@/Presentation/Components/Estadistica/EstadisticasGlobales.jsx";
import { Navigate, useLocation } from "react-router-dom";
import ilustracionColaboracion from "@/assets/inicio-colaboracion.webp";
import ilustracionPreguntas from "@/assets/inicio-preguntas.webp";
import { EnlaceBoton } from "@/Presentation/Components/App/ui/EnlaceBoton.jsx";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import {
  inicioPorRol,
  RUTA_COMO_EMPEZAR,
  RUTA_PROYECTOS,
  RUTA_REGISTRO,
} from "@/Presentation/Routes/rutas.js";
import estilos from "./InicioPage.module.css";

const PREGUNTAS = [
  {
    pregunta: "¿Necesito una cuenta para explorar?",
    respuesta:
      "Podés buscar y consultar proyectos sin registrarte. Para postularte o publicar, necesitás ingresar y completar tu perfil.",
  },
  {
    pregunta: "¿Todas las colaboraciones son sin remuneración?",
    respuesta:
      "Cada perfil informa si la colaboración es sin remuneración, con incentivo económico o con posibilidad de contratación.",
  },
  {
    pregunta: "¿Cuándo se comparten mis datos de contacto?",
    respuesta:
      "Depende de cómo se aceptan las postulaciones en ese perfil. Antes de enviar la tuya, vas a ver cuándo se comparten. Si la aceptación es automática, puede ser al enviarla.",
  },
];

export function InicioPage() {
  const { usuario, cargando } = useAuth();
  const { hash } = useLocation();
  const listaPreguntas = useRef(null);
  const [todasAbiertas, setTodasAbiertas] = useState(false);

  if (!cargando && usuario && hash !== "#como-empezar")
    return <Navigate to={inicioPorRol(usuario.rol)} replace />;

  function sincronizarPreguntas() {
    const abiertas = listaPreguntas.current?.querySelectorAll("details[open]").length;
    setTodasAbiertas(abiertas === PREGUNTAS.length);
  }

  function alternarPreguntas() {
    for (const pregunta of listaPreguntas.current.querySelectorAll("details")) {
      pregunta.open = !todasAbiertas;
    }
    sincronizarPreguntas();
  }

  return (
    <div className={estilos.pagina}>
      <TituloDePagina>Inicio</TituloDePagina>
      <header className={estilos.hero}>
        <div className={estilos.introduccion}>
          <div className={estilos.mensaje}>
            <h1 tabIndex={-1}>
              Conectamos colectivos sociales con personas que desarrollan software
            </h1>
            <p>
              Un espacio para compartir lo que tu colectivo necesita y encontrar proyectos
              a los que aportar tus habilidades.
            </p>
            <div className={estilos.acciones}>
              <EnlaceBoton to={RUTA_PROYECTOS} variante="primario">
                Explorar proyectos <Icono nombre="avanzar" />
              </EnlaceBoton>
              <EnlaceBoton to={RUTA_COMO_EMPEZAR} className={estilos.conocer}>
                Conocer más
              </EnlaceBoton>
            </div>
          </div>
          <img
            src={ilustracionColaboracion}
            alt=""
            width="1440"
            height="720"
            fetchPriority="high"
          />
        </div>
      </header>

      <section className={estilos.recorridos} aria-labelledby="como-empezar">
        <h2 id="como-empezar" tabIndex={-1}>
          Dos formas de empezar
        </h2>
        <div className={estilos.tarjetas}>
          <details className={estilos.recorrido}>
            <summary className={estilos.resumenDeRecorrido}>
              <span className={estilos.iconoDeRecorrido}>
                <Icono nombre="codigo" tamano={32} />
              </span>
              <span className={estilos.tituloDeRecorrido}>
                <span className={estilos.tituloDeTarjeta}>Quiero colaborar</span>
                <span>Encontrá un proyecto al que aportar lo que sabés hacer.</span>
              </span>
              <Icono nombre="avanzar" tamano={24} className={estilos.flechaDeRecorrido} />
            </summary>
            <ol className={estilos.pasos}>
              <li>Completá tu perfil y sumá tus habilidades.</li>
              <li>
                Explorá los proyectos y los perfiles que buscan. Cada ficha informa el
                compromiso, la remuneración y cómo se aceptan las postulaciones.
              </li>
              <li>Postulate al perfil que encaje con lo que podés aportar.</li>
            </ol>
          </details>
          <details className={estilos.recorrido}>
            <summary className={estilos.resumenDeRecorrido}>
              <span className={estilos.iconoDeRecorrido}>
                <Icono nombre="personas" tamano={32} />
              </span>
              <span className={estilos.tituloDeRecorrido}>
                <span className={estilos.tituloDeTarjeta}>
                  Mi colectivo necesita software
                </span>
                <span>Contá qué necesitan y qué personas podrían sumarse.</span>
              </span>
              <Icono nombre="avanzar" tamano={24} className={estilos.flechaDeRecorrido} />
            </summary>
            <ol className={estilos.pasos}>
              <li>Creá el perfil de tu colectivo.</li>
              <li>Publicá el proyecto con los perfiles que necesitan.</li>
              <li>
                Gestioná las postulaciones según la forma de aceptación que elijas para
                cada perfil.
              </li>
            </ol>
            <div className={estilos.accionDeColectivo}>
              <EnlaceBoton to={RUTA_REGISTRO} aria-describedby="antes-de-publicar">
                Publicar un proyecto
              </EnlaceBoton>
              <p id="antes-de-publicar">
                Primero creás una cuenta y completás el perfil de tu colectivo.
              </p>
            </div>
          </details>
        </div>
      </section>

      <EstadisticasGlobales />
      <section className={estilos.preguntas} aria-labelledby="preguntas-inicio">
        <img src={ilustracionPreguntas} alt="" width="720" height="310" loading="lazy" />
        <div>
          <div className={estilos.cabeceraDePreguntas}>
            <div>
              <h2 id="preguntas-inicio">Preguntas frecuentes</h2>
              <p>Resolvé tus dudas sobre cómo funciona la plataforma.</p>
            </div>
            <button
              type="button"
              className={estilos.todasLasPreguntas}
              aria-controls="lista-de-preguntas"
              onClick={alternarPreguntas}
            >
              {todasAbiertas
                ? "Ocultar todas las respuestas"
                : "Ver todas las respuestas"}
              <Icono nombre="avanzar" tamano={16} />
            </button>
          </div>
          <div
            id="lista-de-preguntas"
            className={estilos.listaDePreguntas}
            ref={listaPreguntas}
          >
            {PREGUNTAS.map(({ pregunta, respuesta }) => (
              <details key={pregunta} onToggle={sincronizarPreguntas}>
                <summary>
                  {pregunta} <Icono nombre="flechaAbajo" />
                </summary>
                <p>{respuesta}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
