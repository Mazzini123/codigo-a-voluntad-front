import { useMemo, useState } from "react";
import { fechaLarga, selloDeProyecto } from "../../Formatos/proyecto.js";
import estilosDePerfil from "../../Pages/Perfil.module.css";
import { Boton } from "../App/Boton.jsx";
import { Icono } from "../App/Icono.jsx";
import estilosDeFormulario from "../Formulario/Formulario.module.css";
import { datosARevisar, finDelDia, proyectoParaVista } from "./formularioProyecto.js";
import { PerfilDelProyecto } from "./PerfilDelProyecto.jsx";
import { SelloDeBusqueda } from "./SelloDeBusqueda.jsx";
import estilos from "./PasoDeRevision.module.css";

export function PasoDeRevision({
  refTitulo,
  proyecto,
  perfiles,
  publicando,
  error,
  alPublicar,
  alEditarProyecto,
  alEditarPerfiles,
}) {
  const [hoy] = useState(() => new Date());
  const vista = useMemo(
    () => proyectoParaVista(proyecto, perfiles),
    [proyecto, perfiles],
  );
  const aRevisar = datosARevisar(error?.issues);

  return (
    <div className={estilos.paso}>
      <div className={estilos.encabezado}>
        <h2 ref={refTitulo} tabIndex={-1}>
          Revisar y publicar
        </h2>
        <p className={estilos.bajada}>
          Así van a ver tu proyecto las colaboradoras. Revisalo antes de publicarlo.
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
        <p className={estilosDePerfil.descripcion}>{vista.descripcion}</p>

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

      <div className={estilos.acciones}>
        <div className={estilos.volver}>
          <Boton disabled={publicando} onClick={alEditarProyecto}>
            Volver a editar el proyecto
          </Boton>
          <Boton disabled={publicando} onClick={alEditarPerfiles}>
            Volver a editar los perfiles
          </Boton>
        </div>
        <Boton
          variante="primario"
          enviando={publicando}
          textoEnviando="Publicando…"
          onClick={alPublicar}
        >
          Publicar proyecto
        </Boton>
      </div>
    </div>
  );
}
