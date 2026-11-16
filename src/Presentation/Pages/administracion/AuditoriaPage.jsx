import { useEffect, useRef } from "react";
import { TablaDeAuditoria } from "@/Presentation/Components/Administracion/TablaDeAuditoria.jsx";
import { FiltrosDeAuditoria } from "@/Presentation/Components/Administracion/FiltrosDeAuditoria.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { EstadoVacio } from "@/Presentation/Components/App/estados/EstadoVacio.jsx";
import { Paginacion } from "@/Presentation/Components/App/navegacion/Paginacion.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import {
  claveDeAuditoria,
  useAuditoria,
} from "@/Presentation/Hooks/administracion/useAuditoria.js";
import { useParametrosDeAuditoria } from "@/Presentation/Hooks/administracion/useParametrosDeAuditoria.js";
import estilos from "./AuditoriaPage.module.css";

export default function AuditoriaPage() {
  const parametros = useParametrosDeAuditoria();
  const datos = useAuditoria({ filtros: parametros.filtros, pagina: parametros.pagina });
  const hayFiltros = Object.values(parametros.filtros).some(Boolean);

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-auditoria">
      <TituloDePagina>Auditoría</TituloDePagina>
      <header className={estilos.encabezado}>
        <h1 id="titulo-auditoria" tabIndex={-1}>
          Auditoría
        </h1>
        <p>
          Quién hizo qué en la administración de la plataforma y cuándo. Solo lectura.
        </p>
      </header>
      <FiltrosDeAuditoria
        key={JSON.stringify(parametros.filtros)}
        filtros={parametros.filtros}
        hayFiltros={hayFiltros}
        alAplicar={parametros.aplicar}
        alLimpiar={() => parametros.aplicar({})}
      />
      <Listado parametros={parametros} datos={datos} hayFiltros={hayFiltros} />
    </section>
  );
}

function Listado({ parametros, datos, hayFiltros }) {
  const { filtros, pagina, irAPagina } = parametros;
  const { resultado, error, cargando, reintentar } = datos;
  const refConteo = useRef(null);
  const enfocarAlCargar = useRef(false);
  const desactualizado =
    !resultado || resultado.consulta !== claveDeAuditoria(filtros, pagina);
  const fueraDeRango =
    !desactualizado &&
    !cargando &&
    resultado.items.length === 0 &&
    resultado.totalPaginas >= 1 &&
    pagina > resultado.totalPaginas;

  useEffect(() => {
    if (fueraDeRango) irAPagina(resultado.totalPaginas, { reemplazar: true });
  }, [fueraDeRango, irAPagina, resultado]);

  useEffect(() => {
    if (enfocarAlCargar.current && !desactualizado && !fueraDeRango) {
      enfocarAlCargar.current = false;
      refConteo.current?.focus();
    }
  });

  if (error) {
    return (
      <EstadoDeError
        titulo="No pudimos cargar la auditoría"
        error={error}
        alReintentar={reintentar}
      />
    );
  }
  if (desactualizado || fueraDeRango) {
    return (
      <Esqueleto etiqueta="Cargando auditoría…">
        <BloqueEsqueleto alto="3rem" />
        <BloqueEsqueleto alto="3rem" />
        <BloqueEsqueleto alto="3rem" />
      </Esqueleto>
    );
  }
  if (resultado.items.length === 0) {
    return hayFiltros ? (
      <EstadoVacio
        titulo="No hay acciones con esos filtros"
        descripcion="Probá con otras fechas o sacá algún filtro con «Limpiar filtros»."
      />
    ) : (
      <EstadoVacio
        titulo="Todavía no hay acciones registradas"
        descripcion="Cuando alguien de administración destaque un proyecto o resuelva una revisión, queda anotado acá."
      />
    );
  }
  const desde = (resultado.pagina - 1) * resultado.porPagina + 1;
  const hasta = desde + resultado.items.length - 1;
  return (
    <div aria-busy={cargando}>
      <p ref={refConteo} tabIndex={-1} className={estilos.conteo}>
        {resultado.totalPaginas > 1
          ? `Mostrando ${desde}–${hasta} de ${resultado.total} acciones`
          : resultado.total === 1
            ? "1 acción"
            : `${resultado.total} acciones`}
      </p>
      <TablaDeAuditoria acciones={resultado.items} />
      <Paginacion
        etiqueta="Paginación de la auditoría"
        pagina={resultado.pagina}
        totalPaginas={resultado.totalPaginas}
        alCambiar={(numero) => {
          enfocarAlCargar.current = true;
          irAPagina(numero);
        }}
      />
    </div>
  );
}
