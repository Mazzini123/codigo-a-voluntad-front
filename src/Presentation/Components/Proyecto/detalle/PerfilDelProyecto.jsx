import { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { nombreVisible } from "@/Presentation/Formatos/colaboradora.js";
import {
  estadoDeBusqueda,
  ESTADO_BUSQUEDA,
  textoCompromiso,
  textoLimite,
  textoModalidad,
  textoEncaje,
  textoModoAceptacion,
} from "@/Presentation/Formatos/proyecto.js";
import { colaboracionesAceptadasDe } from "@/Application/Domain/Reglas/busquedaDePerfil.js";
import { useTextoRecortado } from "@/Presentation/Hooks/comunes/useTextoRecortado.js";
import { Chip } from "@/Presentation/Components/App/ui/Chip.jsx";
import { estadoParaVolver, rutaColaboradora } from "@/Presentation/Routes/rutas.js";
import { FranjaDeEncaje } from "./FranjaDeEncaje.jsx";
import { idDeTituloDePerfil } from "@/Presentation/Components/Proyecto/alta/idsDePerfil.js";
import { SelloDeBusqueda } from "@/Presentation/Components/Proyecto/SelloDeBusqueda.jsx";
import estilos from "./PerfilDelProyecto.module.css";
import { clases } from "@/Presentation/Components/App/ui/clases.js";

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
  const tieneTitulo = Boolean(perfil.titulo);
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
      ? perfil.limiteColaboraciones - (perfil.cantidadAceptadas ?? aceptadas.length)
      : null;
  const datos = [
    ["Compromiso", textoCompromiso(perfil.compromiso)],
    ["Modalidad", textoModalidad(perfil.modalidadColaboracion)],
    ["Límite", textoLimite(perfil.limiteColaboraciones)],
    ["Aceptación", textoModoAceptacion(perfil.modoAceptacion)],
  ].filter(([, valor]) => valor);

  return (
    <article
      className={clases(estilos.perfil, enDetalle && estilos.detalle)}
      aria-labelledby={idTitulo}
    >
      <header className={estilos.encabezado}>
        <h3
          ref={refTitulo}
          id={idTitulo}
          tabIndex={-1}
          className={clases(
            estilos.titulo,
            !tieneTitulo && !expandida && estilos.recortado,
          )}
        >
          {tieneTitulo ? perfil.titulo : perfil.descripcion}
        </h3>
        <SelloDeBusqueda estado={estado} />
      </header>
      {tieneTitulo && <p className={estilos.descripcion}>{perfil.descripcion}</p>}
      {!tieneTitulo && (recortada || expandida) && (
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
            className={clases(
              estilos.dato,
              (etiqueta === "Compromiso" || etiqueta === "Modalidad") &&
                estilos.datoPrincipal,
            )}
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
        <div className={clases(estilos.grupo, estilos.participantes)}>
          <h4 id={idColaboran} className={estilos.subtitulo}>
            Quiénes colaboran
          </h4>
          {aceptadas.length > 0 ? (
            <ul className={estilos.personas} aria-labelledby={idColaboran}>
              {aceptadas.map((colaboracion) => (
                <li key={colaboracion.id}>
                  {colaboracion.colaborador ? (
                    <Link
                      to={rutaColaboradora(colaboracion.colaborador.id)}
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
    <div className={clases(estilos.grupo, tipo === "requerida" && estilos.requeridas)}>
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
