import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { useLineaDeTiempo } from "@/Presentation/Hooks/timeline/useLineaDeTiempo.js";
import { textoDeEvento } from "@/Presentation/Formatos/timeline.js";
import { fechaLarga } from "@/Presentation/Formatos/proyecto.js";
import { rutaProyecto, rutaColaboradora } from "@/Presentation/Routes/rutas.js";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import {
  Esqueleto,
  BloqueEsqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import estilos from "./HistoriaDelColectivo.module.css";

export function HistoriaDelColectivo({ id }) {
  const { datos, error, cargando, reintentar } = useLineaDeTiempo(id);
  const [expandida, setExpandida] = useState(false);
  const listaId = useId();
  if (datos?.length === 0 && !error) return null;
  return (
    <section className={estilos.seccion} aria-labelledby="historia-colectivo">
      <h2 id="historia-colectivo">Historia</h2>
      {error ? (
        <EstadoDeError
          enfocar={false}
          titulo="No pudimos cargar la historia"
          error={error}
          alReintentar={reintentar}
        />
      ) : cargando || !datos ? (
        <Esqueleto etiqueta="Cargando la historia…">
          <BloqueEsqueleto />
          <BloqueEsqueleto />
          <BloqueEsqueleto />
        </Esqueleto>
      ) : (
        <>
          <ol id={listaId} className={estilos.lista}>
            {(expandida ? datos : datos.slice(0, 10)).map((evento, indice) => (
              <li key={`${evento.tipo}-${evento.fecha}-${indice}`}>
                <time dateTime={evento.fecha}>{fechaLarga(evento.fecha)}</time>
                <p>{textoDeEvento(evento)}</p>
                {evento.proyecto && (
                  <Link to={rutaProyecto(evento.proyecto.id)}>
                    {evento.proyecto.titulo}
                  </Link>
                )}
                {evento.colaborador?.id && (
                  <p>
                    <Link to={rutaColaboradora(evento.colaborador.id)}>
                      Ver perfil de {evento.colaborador.nombre}
                    </Link>
                  </p>
                )}
              </li>
            ))}
          </ol>
          {datos.length > 10 && (
            <Boton
              aria-expanded={expandida}
              aria-controls={listaId}
              onClick={() => setExpandida(!expandida)}
            >
              {expandida ? "Ver menos historia" : "Ver toda la historia"}
            </Boton>
          )}
        </>
      )}
    </section>
  );
}
