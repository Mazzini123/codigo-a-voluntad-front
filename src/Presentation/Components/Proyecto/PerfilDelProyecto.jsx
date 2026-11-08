import { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { nombreVisible } from "../../Formatos/colaboradora.js";
import {
  colaboracionesAceptadasDe,
  estadoDeBusqueda,
  ESTADO_BUSQUEDA,
  textoCompromiso,
  textoLimite,
  textoModalidad,
  textoEncaje,
  textoModoAceptacion,
} from "../../Formatos/proyecto.js";
import { useTextoRecortado } from "../../Hooks/useTextoRecortado.js";
import { Chip } from "../App/Chip.jsx";
import { estadoParaVolver } from "../../Routes/rutas.js";
import { FranjaDeEncaje } from "./FranjaDeEncaje.jsx";
import { idDeTituloDePerfil } from "./idsDePerfil.js";
import { SelloDeBusqueda } from "./SelloDeBusqueda.jsx";
import estilos from "./PerfilDelProyecto.module.css";

export function PerfilDelProyecto({
  perfil,
  proyecto,
  codigosPropios = null,
  encaje = null,
  hoy = new Date(),
  vistaPrevia = false,
  enDetalle = false,
  children,
}) {
  const location = useLocation();
  const refTitulo = useRef(null);
  const [expandida, setExpandida] = useState(false);
  const recortada = useTextoRecortado(refTitulo, perfil.descripcion);
  const idTitulo = idDeTituloDePerfil(perfil.id);
  const idColaboran = `colaboran-${perfil.id}`;
  const opcionales = perfil.habilidadesOpcionales ?? [];
  const aceptadas = colaboracionesAceptadasDe(proyecto, perfil);
  const estado = estadoDeBusqueda(perfil, proyecto, hoy);
  const vacantes =
    enDetalle &&
    estado.tipo === ESTADO_BUSQUEDA.ABIERTA &&
    Number.isInteger(perfil.limiteColaboraciones) &&
    Array.isArray(proyecto.colaboraciones)
      ? perfil.limiteColaboraciones - aceptadas.length
      : null;
  const datos = [
    ["Compromiso", textoCompromiso(perfil.compromiso)],
    ["Modalidad", textoModalidad(perfil.modalidadColaboracion)],
    ["Límite", textoLimite(perfil.limiteColaboraciones)],
    ["Aceptación", textoModoAceptacion(perfil.modoAceptacion)],
  ].filter(([, valor]) => valor);

  return (
    <article
      className={`${estilos.perfil} ${enDetalle ? estilos.detalle : ""}`}
      aria-labelledby={idTitulo}
    >
      <header className={estilos.encabezado}>
        <h3
          ref={refTitulo}
          id={idTitulo}
          tabIndex={-1}
          className={`${estilos.titulo} ${expandida ? "" : estilos.recortado}`}
        >
          {perfil.descripcion}
        </h3>
        <SelloDeBusqueda estado={estado} />
      </header>
      {(recortada || expandida) && (
        <button
          type="button"
          className={estilos.verMas}
          aria-expanded={expandida}
          aria-controls={idTitulo}
          onClick={() => setExpandida((valor) => !valor)}
        >
          {expandida ? "Ver menos" : "Ver la descripción completa"}
        </button>
      )}

      <GrupoDeHabilidades
        idBase={`requeridas-${perfil.id}`}
        titulo="Requeridas"
        tipo="requerida"
        habilidades={perfil.habilidadesRequeridas ?? []}
        codigosPropios={codigosPropios}
      />
      {opcionales.length > 0 && (
        <GrupoDeHabilidades
          idBase={`opcionales-${perfil.id}`}
          titulo="Opcionales"
          tipo="opcional"
          habilidades={opcionales}
          codigosPropios={codigosPropios}
        />
      )}

      <dl className={estilos.datos}>
        {datos.map(([etiqueta, valor]) => (
          <div
            key={etiqueta}
            className={`${estilos.dato} ${etiqueta === "Compromiso" || etiqueta === "Modalidad" ? estilos.datoPrincipal : ""}`}
          >
            <dt>{etiqueta}</dt>
            <dd>
              {valor}
              {etiqueta === "Límite" && vacantes !== null && (
                <span className={estilos.vacantes}>
                  {vacantes === 1
                    ? "1 vacante disponible"
                    : `${vacantes} vacantes disponibles`}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      {!vistaPrevia && (
        <div className={`${estilos.grupo} ${estilos.participantes}`}>
          <h4 id={idColaboran} className={estilos.subtitulo}>
            Quiénes colaboran
          </h4>
          {aceptadas.length > 0 ? (
            <ul className={estilos.personas} aria-labelledby={idColaboran}>
              {aceptadas.map((colaboracion) => (
                <li key={colaboracion.id}>
                  {colaboracion.colaborador ? (
                    <Link
                      to={`/colaboradoras/${colaboracion.colaborador.id}`}
                      state={estadoParaVolver(location, "Volver al proyecto")}
                    >
                      {nombreVisible(colaboracion.colaborador)}
                    </Link>
                  ) : (
                    "Contribución anónima"
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className={estilos.vacio}>Todavía nadie ocupa este perfil.</p>
          )}
        </div>
      )}

      {encaje && <FranjaDeEncaje>{textoEncaje(encaje)}</FranjaDeEncaje>}

      {children && <div className={estilos.accion}>{children}</div>}
    </article>
  );
}

function GrupoDeHabilidades({ idBase, titulo, tipo, habilidades, codigosPropios }) {
  return (
    <div className={`${estilos.grupo} ${tipo === "requerida" ? estilos.requeridas : ""}`}>
      <h4 id={idBase} className={estilos.subtitulo}>
        {titulo}
      </h4>
      {habilidades.length > 0 ? (
        <ul className={estilos.chips} aria-labelledby={idBase}>
          {habilidades.map((habilidad) => (
            <li key={habilidad.codigo}>
              <Chip tipo={tipo} laTenes={codigosPropios?.has(habilidad.codigo) ?? false}>
                {habilidad.titulo}
              </Chip>
            </li>
          ))}
        </ul>
      ) : (
        <p className={estilos.vacio}>Ninguna.</p>
      )}
    </div>
  );
}
