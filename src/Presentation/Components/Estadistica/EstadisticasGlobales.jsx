import { useEstadisticasGlobales } from "@/Presentation/Hooks/estadistica/useEstadisticas.js";
import { useCatalogoDeHabilidades } from "@/Presentation/Hooks/habilidad/useCatalogoDeHabilidades.js";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import {
  Esqueleto,
  BloqueEsqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { fechaLarga } from "@/Presentation/Formatos/proyecto.js";
import { hayActividad, numeroEstadistico } from "@/Presentation/Formatos/estadistica.js";
import { Indicadores } from "./Indicadores.jsx";
import estilos from "./Estadisticas.module.css";

export function EstadisticasGlobales() {
  const { datos, error, cargando, reintentar } = useEstadisticasGlobales();
  if (datos && !hayActividad(datos)) return null;
  return (
    <section
      className={`${estilos.seccion} ${estilos.globales}`}
      aria-labelledby="numeros-plataforma"
    >
      <h2 id="numeros-plataforma">La plataforma en números</h2>
      {error ? (
        <EstadoDeError
          enfocar={false}
          titulo="No pudimos cargar las estadísticas"
          error={error}
          alReintentar={reintentar}
        />
      ) : cargando || !datos ? (
        <Esqueleto etiqueta="Cargando estadísticas…">
          <BloqueEsqueleto alto="5rem" />
        </Esqueleto>
      ) : (
        <>
          <Indicadores
            valores={[
              ["Colectivos activos", datos.colectivos.activos],
              ["Proyectos abiertos", datos.proyectos.abiertos],
              ["Proyectos finalizados", datos.proyectos.finalizados],
              ["Personas colaboradoras", datos.colaboradores.total],
              [
                "Colaboraciones",
                datos.colaboraciones.aceptadas + datos.colaboraciones.finalizadas,
              ],
            ]}
          />
          <Rankings datos={datos} />
          {datos.generadoEn && (
            <p>
              Actualizado el{" "}
              <time dateTime={datos.generadoEn}>{fechaLarga(datos.generadoEn)}</time>
            </p>
          )}
        </>
      )}
    </section>
  );
}

function Rankings({ datos }) {
  const { habilidades, error, cargando, recargar } = useCatalogoDeHabilidades();
  if (error)
    return (
      <EstadoDeError
        enfocar={false}
        titulo="No pudimos cargar los nombres de las habilidades"
        error={error}
        alReintentar={recargar}
      />
    );
  if (cargando || !habilidades)
    return (
      <Esqueleto etiqueta="Cargando habilidades…">
        <BloqueEsqueleto />
      </Esqueleto>
    );
  const nombres = new Map(habilidades.map(({ codigo, titulo }) => [codigo, titulo]));
  return (
    <div className={estilos.rankings}>
      {[
        ["Habilidades más requeridas", datos.habilidadesMasRequeridas],
        ["Habilidades más ofrecidas", datos.habilidadesMasOfrecidas],
      ].map(([titulo, ranking]) => (
        <div key={titulo}>
          <h3>{titulo}</h3>
          {ranking?.length ? (
            <ul className={estilos.lista}>
              {ranking.slice(0, 5).map(({ codigo, cantidad }) => (
                <li key={codigo}>
                  {nombres.get(codigo) ?? "Habilidad fuera del catálogo"} ·{" "}
                  {numeroEstadistico(cantidad)}
                </li>
              ))}
            </ul>
          ) : (
            <p>Todavía no hay habilidades para mostrar.</p>
          )}
        </div>
      ))}
    </div>
  );
}
