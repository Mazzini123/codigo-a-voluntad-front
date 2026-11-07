import { Link, Navigate } from "react-router-dom";
import { Icono } from "../Components/App/Icono.jsx";
import { TituloDePagina } from "../Components/App/TituloDePagina.jsx";
import { useAuth } from "../Hooks/useAuth.js";
import { inicioPorRol } from "../Routes/rutas.js";
import estilos from "./BienvenidaPage.module.css";

const OPCIONES = [
  {
    ruta: "/bienvenida/colectivo",
    nombre: "Soy un colectivo",
    detalle: "Publico proyectos y busco colaboradoras.",
  },
  {
    ruta: "/bienvenida/colaboradora",
    nombre: "Soy colaboradora",
    detalle: "Me sumo a proyectos con mis habilidades.",
  },
];

export function BienvenidaPage() {
  const { usuario } = useAuth();
  if (usuario?.rol) return <Navigate to={inicioPorRol(usuario.rol)} replace />;

  return (
    <section className={estilos.bienvenida} aria-labelledby="titulo-bienvenida">
      <TituloDePagina>Bienvenida</TituloDePagina>
      <h1 id="titulo-bienvenida" tabIndex={-1}>
        ¿Cómo vas a usar Código a Voluntad?
      </h1>
      <p className={estilos.bajada}>
        Elegí una opción para armar tu perfil. El tipo de cuenta no se puede cambiar
        después.
      </p>
      <ul className={estilos.opciones}>
        {OPCIONES.map(({ ruta, nombre, detalle }) => (
          <li key={ruta}>
            <Link to={ruta} className={estilos.opcion}>
              <span className={estilos.nombre}>
                {nombre}
                <Icono nombre="flechaDerecha" tamano={20} />
              </span>
              <span className={estilos.detalle}>{detalle}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
