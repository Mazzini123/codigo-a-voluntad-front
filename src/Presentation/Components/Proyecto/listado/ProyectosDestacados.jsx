import { EnlaceBoton } from "@/Presentation/Components/App/ui/EnlaceBoton.jsx";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { Esqueleto } from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import {
  TarjetaProyecto,
  TarjetaProyectoSkeleton,
} from "@/Presentation/Components/Proyecto/listado/TarjetaProyecto.jsx";
import { useProyectosDestacados } from "@/Presentation/Hooks/proyecto/useProyectosDestacados.js";
import { RUTA_PROYECTOS } from "@/Presentation/Routes/rutas.js";
import estilos from "./ProyectosDestacados.module.css";

export function ProyectosDestacados() {
  const { datos, error, cargando, reintentar } = useProyectosDestacados();
  if (!error && !cargando && (!datos || datos.length === 0)) return null;
  return (
    <section className={estilos.seccion} aria-labelledby="proyectos-destacados">
      <div className={estilos.encabezado}>
        <h2 id="proyectos-destacados">Proyectos destacados</h2>
        <EnlaceBoton to={RUTA_PROYECTOS}>
          Ver todos los proyectos <Icono nombre="avanzar" tamano={16} />
        </EnlaceBoton>
      </div>
      {error ? (
        <EstadoDeError
          nivel={3}
          enfocar={false}
          titulo="No pudimos cargar los proyectos destacados"
          error={error}
          alReintentar={reintentar}
        />
      ) : cargando || !datos ? (
        <Esqueleto etiqueta="Cargando proyectos destacados…">
          <ul className={estilos.grilla}>
            {[1, 2].map((numero) => (
              <li key={numero}>
                <TarjetaProyectoSkeleton />
              </li>
            ))}
          </ul>
        </Esqueleto>
      ) : (
        <ul className={estilos.grilla}>
          {datos.map((proyecto) => (
            <li key={proyecto.id}>
              <TarjetaProyecto proyecto={proyecto} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
