import { useId } from "react";
import { Link } from "react-router-dom";
import { useValoraciones } from "@/Presentation/Hooks/valoracion/useValoraciones.js";
import { fechaLarga } from "@/Presentation/Formatos/proyecto.js";
import { numeroEstadistico } from "@/Presentation/Formatos/estadistica.js";
import { nombreVisible } from "@/Presentation/Formatos/colaboradora.js";
import {
  rutaProyecto,
  rutaColectivo,
  rutaColaboradora,
} from "@/Presentation/Routes/rutas.js";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import {
  Esqueleto,
  BloqueEsqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import estilos from "./Valoracion.module.css";

export function ValoracionesRecibidas({ id, esColectivo = false }) {
  const { datos, error, cargando, reintentar } = useValoraciones(id, esColectivo);
  const tituloId = useId();
  return (
    <section className={estilos.seccion} aria-labelledby={tituloId}>
      <h2 id={tituloId}>Valoraciones recibidas</h2>
      {error ? (
        <EstadoDeError
          enfocar={false}
          titulo="No pudimos cargar las valoraciones"
          error={error}
          alReintentar={reintentar}
        />
      ) : cargando || !datos ? (
        <Esqueleto etiqueta="Cargando valoraciones…">
          <BloqueEsqueleto />
          <BloqueEsqueleto />
        </Esqueleto>
      ) : datos.cantidad === 0 ? (
        <p>Todavía no recibió valoraciones.</p>
      ) : (
        <>
          <p>
            <strong>{numeroEstadistico(datos.promedio)} de 5</strong> ·{" "}
            {numeroEstadistico(datos.cantidad)}{" "}
            {datos.cantidad === 1 ? "valoración" : "valoraciones"}
          </p>
          <ul className={estilos.lista}>
            {datos.valoraciones.map((valoracion, indice) => (
              <li key={`${valoracion.proyecto?.id}-${valoracion.fecha}-${indice}`}>
                <h3>{valoracion.puntaje} de 5</h3>
                {valoracion.comentario && (
                  <p className={estilos.comentario}>{valoracion.comentario}</p>
                )}
                <p>
                  {valoracion.colectivo ? (
                    <Link to={rutaColectivo(valoracion.colectivo.id)}>
                      {valoracion.colectivo.nombre}
                    </Link>
                  ) : valoracion.autor?.id ? (
                    <Link to={rutaColaboradora(valoracion.autor.id)}>
                      {nombreVisible(valoracion.autor) || "Persona colaboradora"}
                    </Link>
                  ) : (
                    "Persona colaboradora anónima"
                  )}
                </p>
                {valoracion.proyecto && (
                  <p>
                    <Link to={rutaProyecto(valoracion.proyecto.id)}>
                      {valoracion.proyecto.titulo}
                    </Link>
                  </p>
                )}
                <time dateTime={valoracion.fecha}>{fechaLarga(valoracion.fecha)}</time>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
