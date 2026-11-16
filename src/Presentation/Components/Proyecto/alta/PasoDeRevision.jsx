import { useId, useMemo, useState } from "react";
import { fechaLarga, selloDeProyecto } from "@/Presentation/Formatos/proyecto.js";
import { VISIBILIDAD_DEL_BORRADOR } from "@/Presentation/Formatos/publicacion.js";
import estilosDePerfil from "@/Presentation/Components/Perfil/Perfil.module.css";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import estilosDeFormulario from "@/Presentation/Components/Formulario/Formulario.module.css";
import {
  datosARevisar,
  finDelDia,
  proyectoParaVista,
} from "@/Presentation/Formularios/proyecto/formularioProyecto.js";
import { PerfilDelProyecto } from "@/Presentation/Components/Proyecto/detalle/PerfilDelProyecto.jsx";
import { SelloDeBusqueda } from "@/Presentation/Components/Proyecto/SelloDeBusqueda.jsx";
import { AceptacionDeTerminos } from "./AceptacionDeTerminos.jsx";
import estilos from "./PasoDeRevision.module.css";
import { TextoConFormato } from "@/Presentation/Components/App/texto/TextoConFormato.jsx";

export function PasoDeRevision({
  refTitulo,
  proyecto,
  perfiles,
  publicando,
  guardandoBorrador,
  error,
  terminos,
  alPublicar,
  alGuardarBorrador,
  alEditarProyecto,
  alEditarPerfiles,
}) {
  const [hoy] = useState(() => new Date());
  const vista = useMemo(
    () => proyectoParaVista(proyecto, perfiles),
    [proyecto, perfiles],
  );
  const aRevisar = datosARevisar(error?.issues);
  const ocupado = publicando || guardandoBorrador;
  const esperandoTerminos = terminos.estado.cargando && !terminos.estado.terminos;
  const idPublicar = useId();
  const idBorrador = useId();

  return (
    <div className={estilos.paso}>
      <div className={estilos.encabezado}>
        <h2 ref={refTitulo} tabIndex={-1}>
          Revisar y publicar
        </h2>
        <p className={estilos.bajada}>
          Así van a ver tu proyecto las colaboradoras. Revisalo y elegí cómo seguir.
        </p>
      </div>

      <article className={estilos.vista} aria-labelledby="vista-titulo">
        <header className={estilosDePerfil.titulos}>
          <h3 id="vista-titulo" className={estilos.titulo}>
            {vista.titulo}
          </h3>
          <div className={estilosDePerfil.estadoDelProyecto}>
            <SelloDeBusqueda estado={selloDeProyecto(vista.estado)} />
            {proyecto.fechaCierre && (
              <p className={estilosDePerfil.meta}>
                Se cierra el{" "}
                <time dateTime={proyecto.fechaCierre}>
                  {fechaLarga(finDelDia(proyecto.fechaCierre))}
                </time>
              </p>
            )}
          </div>
        </header>
        {vista.etiquetas.length > 0 && (
          <ul className={estilosDePerfil.etiquetas} aria-label="Etiquetas">
            {vista.etiquetas.map((etiqueta) => (
              <li key={etiqueta} className={estilosDePerfil.etiqueta}>
                {etiqueta}
              </li>
            ))}
          </ul>
        )}
        <TextoConFormato texto={vista.descripcion} nivel={4} />

        <section className={estilos.perfiles} aria-labelledby="vista-perfiles">
          <h3 id="vista-perfiles">Perfiles que busca</h3>
          <ul className={estilos.listaDePerfiles}>
            {vista.perfiles.map((perfil) => (
              <li key={perfil.id}>
                <PerfilDelProyecto
                  perfil={perfil}
                  proyecto={vista}
                  hoy={hoy}
                  vistaPrevia
                />
              </li>
            ))}
          </ul>
        </section>
      </article>

      {error && (
        <div role="alert" className={estilosDeFormulario.errorGeneral}>
          <Icono nombre="alerta" />
          <div className={estilos.problema}>
            <p>{error.mensaje}</p>
            {aRevisar.length > 0 && (
              <>
                <p>Revisá estos datos:</p>
                <ul>
                  {aRevisar.map((dato) => (
                    <li key={dato}>{dato}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}

      <dl className={estilos.consecuencias}>
        <div>
          <dt>Guardar como borrador</dt>
          <dd id={idBorrador}>
            {VISIBILIDAD_DEL_BORRADOR} Cuando esté listo, pedís la publicación y
            administración lo revisa antes de publicarlo.
          </dd>
        </div>
        <div>
          <dt>Publicar proyecto</dt>
          <dd id={idPublicar}>
            Lo ven todas las colaboradoras enseguida y empieza a recibir postulaciones.
          </dd>
        </div>
      </dl>

      <AceptacionDeTerminos
        estado={terminos.estado}
        aceptada={terminos.aceptada}
        error={terminos.error}
        refCasilla={terminos.refCasilla}
        alCambiar={terminos.alCambiar}
      />

      <div className={estilos.acciones}>
        <div className={estilos.volver}>
          <Boton disabled={ocupado} onClick={alEditarProyecto}>
            Volver a editar el proyecto
          </Boton>
          <Boton disabled={ocupado} onClick={alEditarPerfiles}>
            Volver a editar los perfiles
          </Boton>
        </div>
        <div className={estilos.publicar}>
          <Boton
            enviando={guardandoBorrador}
            textoEnviando="Guardando borrador…"
            disabled={publicando || esperandoTerminos}
            aria-describedby={idBorrador}
            onClick={alGuardarBorrador}
          >
            Guardar como borrador
          </Boton>
          <Boton
            variante="primario"
            enviando={publicando}
            textoEnviando="Publicando…"
            disabled={guardandoBorrador || esperandoTerminos}
            aria-describedby={idPublicar}
            onClick={alPublicar}
          >
            Publicar proyecto
          </Boton>
        </div>
      </div>
    </div>
  );
}
