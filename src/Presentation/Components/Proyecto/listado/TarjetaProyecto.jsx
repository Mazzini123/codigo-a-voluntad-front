import { Link, useLocation } from "react-router-dom";
import { Chip } from "@/Presentation/Components/App/ui/Chip.jsx";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import { BloqueEsqueleto } from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import {
  encajeCon,
  estadoDeBusqueda,
  habilidadesBuscadas,
  perfilDestacado,
  selloDeProyecto,
  textoCompromiso,
  textoEncaje,
  textoModalidad,
  textoPerfilesQueBuscan,
  textoPostulacionesPendientes,
} from "@/Presentation/Formatos/proyecto.js";
import {
  esPostulacionActiva,
  perfilesAbiertos,
} from "@/Application/Domain/Reglas/busquedaDePerfil.js";
import { FranjaDeEncaje } from "@/Presentation/Components/Proyecto/detalle/FranjaDeEncaje.jsx";
import { SelloDeBusqueda } from "@/Presentation/Components/Proyecto/SelloDeBusqueda.jsx";
import estilos from "./TarjetaProyecto.module.css";
import { PROYECTO_ESTADO } from "@/Application/Domain/Enums/PROYECTO_ESTADO.js";
import { COLABORACION_ESTADO } from "@/Application/Domain/Enums/COLABORACION_ESTADO.js";
import { rutaProyecto } from "@/Presentation/Routes/rutas.js";
import { clases } from "@/Presentation/Components/App/ui/clases.js";
import { sinMarcas } from "@/Presentation/Formatos/markdown.js";

const MAXIMO_CHIPS = 4;

export function TarjetaProyecto({
  proyecto,
  codigosPropios = null,
  postulaciones = [],
  propia = false,
  estadoAlCostado = false,
  pendientes = null,
  hoy = new Date(),
}) {
  const habilidades = habilidadesBuscadas(proyecto, hoy);
  const visibles = habilidades.slice(0, MAXIMO_CHIPS);
  const resto = habilidades.length - visibles.length;
  const abiertos = perfilesAbiertos(proyecto, hoy).length;
  const destacado = perfilDestacado(proyecto, hoy);
  const finalizado = proyecto.estado === PROYECTO_ESTADO.FINALIZADO;
  const estado =
    finalizado || !destacado
      ? selloDeProyecto(proyecto.estado)
      : estadoDeBusqueda(destacado, proyecto, hoy);
  const detalleDePerfil =
    !finalizado && destacado
      ? [
          textoCompromiso(destacado.compromiso),
          textoModalidad(destacado.modalidadColaboracion),
        ]
          .filter(Boolean)
          .join(" · ")
      : "";
  const activas = postulaciones.filter(({ estado }) => esPostulacionActiva(estado));
  const postulados = new Set(activas.map(({ perfilId }) => perfilId));
  const encaje =
    !propia && codigosPropios
      ? encajeCon(proyecto, codigosPropios, hoy, postulados)
      : null;
  const idTitulo = `proyecto-${proyecto.id}`;
  const { search } = useLocation();

  return (
    <article
      className={clases(estilos.tarjeta, !propia && estilos.exploracion)}
      aria-labelledby={idTitulo}
    >
      <div
        className={clases(estilos.encabezado, estadoAlCostado && estilos.estadoAlCostado)}
      >
        <h3 id={idTitulo} className={estilos.titulo}>
          <Link to={rutaProyecto(proyecto.id)} state={{ busqueda: search }}>
            {proyecto.titulo}
          </Link>
        </h3>
        {!propia && estado && <SelloDeBusqueda estado={estado} />}
      </div>
      {proyecto.descripcion?.trim() && (
        <p className={estilos.descripcion}>{sinMarcas(proyecto.descripcion)}</p>
      )}
      {!propia && proyecto.etiquetas?.length > 0 && (
        <ul className={estilos.chips} aria-label="Etiquetas">
          {proyecto.etiquetas.map((etiqueta) => (
            <li key={etiqueta} className={estilos.etiqueta}>
              {etiqueta}
            </li>
          ))}
        </ul>
      )}
      {visibles.length > 0 && (
        <ul className={estilos.chips} aria-label="Habilidades requeridas">
          {visibles.map((habilidad) => (
            <li key={habilidad.codigo}>
              <Chip laTenes={codigosPropios?.has(habilidad.codigo) ?? false}>
                {habilidad.titulo}
              </Chip>
            </li>
          ))}
          {resto > 0 && <li className={estilos.mas}>+{resto} más</li>}
        </ul>
      )}
      {!propia && postulados.size > 0 && (
        <div>
          <SelloDeBusqueda estado={selloDePostulaciones(activas, postulados.size)} />
        </div>
      )}
      {encaje && (
        <FranjaDeEncaje className={estilos.encaje}>{textoEncaje(encaje)}</FranjaDeEncaje>
      )}
      {propia ? (
        <PieDeProyectoPropio
          abiertos={abiertos}
          pendientes={pendientes}
          finalizado={finalizado}
          estado={proyecto.estado}
        />
      ) : (
        <div className={estilos.pie}>
          <div className={estilos.datos}>
            {!finalizado && Array.isArray(proyecto.perfiles) && (
              <span>
                {abiertos === 1 ? "1 perfil abierto" : `${abiertos} perfiles abiertos`}
              </span>
            )}
            {detalleDePerfil && <span>{detalleDePerfil}</span>}
          </div>
          <span className={estilos.verProyecto} aria-hidden="true">
            Ver proyecto <Icono nombre="avanzar" tamano={16} />
          </span>
        </div>
      )}
    </article>
  );
}

function selloDePostulaciones(activas, cantidad) {
  const perfiles = cantidad === 1 ? "1 perfil" : `${cantidad} perfiles`;
  if (activas.every(({ estado }) => estado === COLABORACION_ESTADO.PENDIENTE))
    return { tipo: "pendiente", texto: `Postulación pendiente en ${perfiles}` };
  if (activas.every(({ estado }) => estado === COLABORACION_ESTADO.ACEPTADA))
    return { tipo: "aceptada", texto: `Postulación aceptada en ${perfiles}` };
  return { tipo: "mixta", texto: `Postulaciones en ${perfiles}` };
}

function PieDeProyectoPropio({ abiertos, pendientes, finalizado, estado }) {
  const sello = selloDeProyecto(estado);
  return (
    <div className={estilos.pie}>
      <div className={estilos.datos}>
        {!finalizado && <span>{textoPerfilesQueBuscan(abiertos)}</span>}
        {pendientes > 0 && <span>{textoPostulacionesPendientes(pendientes)}</span>}
      </div>
      {sello && <SelloDeBusqueda estado={sello} />}
    </div>
  );
}

export function TarjetaProyectoSkeleton() {
  return (
    <div className={estilos.esqueleto}>
      <BloqueEsqueleto ancho="60%" alto="1.4em" />
      <BloqueEsqueleto />
      <BloqueEsqueleto />
      <BloqueEsqueleto ancho="70%" />
      <div className={estilos.filaEsqueleto}>
        <BloqueEsqueleto ancho="72px" forma="pildora" />
        <BloqueEsqueleto ancho="88px" forma="pildora" />
        <BloqueEsqueleto ancho="64px" forma="pildora" />
      </div>
      <BloqueEsqueleto ancho="40%" />
      <BloqueEsqueleto ancho="40%" />
    </div>
  );
}
