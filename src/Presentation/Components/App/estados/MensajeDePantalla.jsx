import { Link } from "react-router-dom";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import estilos from "./MensajeDePantalla.module.css";
import { RUTA_INICIO } from "@/Presentation/Routes/rutas.js";

export function MensajeDePantalla({
  titulo,
  tituloDePestana,
  volverA = RUTA_INICIO,
  estadoVolver,
  textoVolver = "Volver al inicio",
  children,
}) {
  return (
    <section className={estilos.mensaje} aria-labelledby="titulo-mensaje">
      <TituloDePagina>{tituloDePestana}</TituloDePagina>
      <h1 id="titulo-mensaje" tabIndex={-1}>
        {titulo}
      </h1>
      <p className={estilos.texto}>{children}</p>
      <Link to={volverA} state={estadoVolver} className={estilos.volver}>
        <Icono nombre="flechaIzquierda" />
        {textoVolver}
      </Link>
    </section>
  );
}
