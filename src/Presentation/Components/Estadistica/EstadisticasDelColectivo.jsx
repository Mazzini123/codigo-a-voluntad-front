import { Link } from "react-router-dom";
import { useEstadisticasDelColectivo } from "@/Presentation/Hooks/estadistica/useEstadisticas.js";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import {
  Esqueleto,
  BloqueEsqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { rutaProyecto } from "@/Presentation/Routes/rutas.js";
import { numeroEstadistico } from "@/Presentation/Formatos/estadistica.js";
import { selloDeProyecto } from "@/Presentation/Formatos/proyecto.js";
import { Indicadores } from "./Indicadores.jsx";
import estilos from "./Estadisticas.module.css";

export function EstadisticasDelColectivo({ id }) {
  const { datos, error, cargando, reintentar } = useEstadisticasDelColectivo(id);
  if (!error && !cargando && datos?.proyectos?.total === 0) return null;
  return (
    <section className={estilos.seccion} aria-labelledby="estadisticas-colectivo">
      <h2 id="estadisticas-colectivo">Tus proyectos en números</h2>
      {error ? (
        <EstadoDeError
          enfocar={false}
          titulo="No pudimos cargar las estadísticas del colectivo"
          error={error}
          alReintentar={reintentar}
        />
      ) : cargando || !datos ? (
        <Esqueleto etiqueta="Cargando estadísticas del colectivo…">
          <BloqueEsqueleto alto="5rem" />
          <BloqueEsqueleto />
          <BloqueEsqueleto />
          <BloqueEsqueleto />
        </Esqueleto>
      ) : (
        <>
          <Indicadores
            valores={[
              ["Proyectos abiertos", datos.proyectos.abiertos],
              ["Proyectos finalizados", datos.proyectos.finalizados],
              ["Postulaciones pendientes", datos.colaboraciones.pendientes],
              ["Colaboraciones aceptadas", datos.colaboraciones.aceptadas],
              ["Colaboraciones finalizadas", datos.colaboraciones.finalizadas],
              ["Visualizaciones", datos.visualizaciones],
              ["Avance promedio", datos.avancePromedio, " %"],
              ["Logros", datos.logros],
            ]}
          />
          <p>
            Las visualizaciones no incluyen las visitas del propio colectivo. El total de
            colaboraciones por proyecto incluye todos los estados.
          </p>
          <table className={estilos.tabla}>
            <caption>Estadísticas por proyecto</caption>
            <thead>
              <tr>
                {[
                  "Proyecto",
                  "Estado",
                  "Visualizaciones",
                  "Avance (%)",
                  "Logros",
                  "Colaboraciones",
                ].map((texto) => (
                  <th scope="col" key={texto}>
                    {texto}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datos.porProyecto.map((p) => (
                <tr key={p.id}>
                  <th scope="row">
                    <Link to={rutaProyecto(p.id)}>{p.titulo}</Link>
                  </th>
                  <td>{selloDeProyecto(p.estado)?.texto ?? "Sin estado"}</td>
                  {[
                    p.visualizaciones,
                    p.porcentajeConcrecion,
                    p.logros,
                    p.colaboraciones,
                  ].map((n, i) => (
                    <td key={i}>{numeroEstadistico(n)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <ul className={estilos.tarjetas} aria-label="Estadísticas por proyecto">
            {datos.porProyecto.map((p) => (
              <li key={p.id}>
                <h3>
                  <Link to={rutaProyecto(p.id)}>{p.titulo}</Link>
                </h3>
                <p>{selloDeProyecto(p.estado)?.texto ?? "Sin estado"}</p>
                <dl>
                  {[
                    ["Visualizaciones", p.visualizaciones],
                    ["Avance (%)", p.porcentajeConcrecion],
                    ["Logros", p.logros],
                    ["Colaboraciones", p.colaboraciones],
                  ].map(([texto, valor]) => (
                    <div key={texto}>
                      <dt>{texto}</dt>
                      <dd>{numeroEstadistico(valor)}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
