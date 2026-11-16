import { Link } from "react-router-dom";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { Casilla } from "@/Presentation/Components/App/ui/Casilla.jsx";
import { TextoOculto } from "@/Presentation/Components/App/ui/TextoOculto.jsx";
import { textoDeAceptacion } from "@/Presentation/Formatos/terminos.js";
import { RUTA_TERMINOS } from "@/Presentation/Routes/rutas.js";
import estilos from "./AceptacionDeTerminos.module.css";

export function AceptacionDeTerminos({ estado, aceptada, error, refCasilla, alCambiar }) {
  const { terminos, cargando, error: errorDeCarga, recargar } = estado;
  if (errorDeCarga) {
    return (
      <EstadoDeError
        nivel={3}
        enfocar={false}
        titulo="No pudimos cargar los términos y condiciones"
        error={errorDeCarga}
        alReintentar={recargar}
      />
    );
  }
  if (cargando && !terminos) {
    return (
      <Esqueleto etiqueta="Cargando los términos y condiciones…">
        <BloqueEsqueleto ancho="70%" alto="var(--toque-minimo)" />
      </Esqueleto>
    );
  }
  if (!terminos) return null;
  return (
    <div className={estilos.aceptacion}>
      <Casilla
        ref={refCasilla}
        etiqueta={textoDeAceptacion(terminos)}
        checked={aceptada}
        error={error}
        aria-required
        onChange={(evento) => alCambiar(evento.target.checked)}
      />
      <Link to={RUTA_TERMINOS} target="_blank" rel="noopener" className={estilos.enlace}>
        Leer los términos y condiciones{" "}
        <TextoOculto>(se abre en otra pestaña)</TextoOculto>
      </Link>
    </div>
  );
}
