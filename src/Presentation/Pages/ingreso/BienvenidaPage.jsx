import { Link, Navigate } from "react-router-dom";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import { useState } from "react";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import {
  inicioPorRol,
  RUTA_ALTA_COLABORADORA,
  RUTA_ALTA_COLECTIVO,
} from "@/Presentation/Routes/rutas.js";
import estilos from "./BienvenidaPage.module.css";

const OPCIONES = [
  {
    ruta: RUTA_ALTA_COLECTIVO,
    nombre: "Soy un colectivo",
    detalle: "Publico proyectos y busco colaboradoras.",
  },
  {
    ruta: RUTA_ALTA_COLABORADORA,
    nombre: "Soy colaboradora",
    detalle: "Me sumo a proyectos con mis habilidades.",
  },
];

export function BienvenidaPage() {
  const { usuario, perfilDadoDeBaja, cerrarSesion } = useAuth();
  const [cerrando, setCerrando] = useState(false);
  if (perfilDadoDeBaja)
    return (
      <section className={estilos.bienvenida}>
        <TituloDePagina>Colectivo dado de baja</TituloDePagina>
        <h1 tabIndex={-1}>El colectivo ya está dado de baja</h1>
        <p>
          Estamos cerrando tu sesión. Si seguís en esta pantalla, podés reintentar el
          cierre. La baja ya se realizó y tu cuenta quedó sin perfil.
        </p>
        <Boton
          enviando={cerrando}
          textoEnviando="Cerrando sesión…"
          onClick={async () => {
            setCerrando(true);
            await cerrarSesion();
            setCerrando(false);
          }}
        >
          Reintentar cierre de sesión
        </Boton>
      </section>
    );
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
