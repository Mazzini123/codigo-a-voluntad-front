import { Link } from "react-router-dom";
import { Icono } from "./Icono.jsx";
import { TituloDePagina } from "./TituloDePagina.jsx";
import estilos from "./MensajeDePantalla.module.css";

export function MensajeDePantalla({
  titulo,
  tituloDePestana,
  volverA = "/",
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
