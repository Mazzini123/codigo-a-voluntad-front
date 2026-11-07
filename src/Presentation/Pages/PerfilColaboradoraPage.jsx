import { useState } from "react";
import { Link } from "react-router-dom";
import { ColaboradoraForm } from "../Components/Colaboradora/ColaboradoraForm.jsx";
import { ErrorState } from "../Components/App/ErrorState.jsx";
import { Icono } from "../Components/App/Icono.jsx";
import { BloqueSkeleton, Skeleton } from "../Components/App/Skeleton.jsx";
import { TituloDePagina } from "../Components/App/TituloDePagina.jsx";
import { SelectorDeHabilidades } from "../Components/Formulario/SelectorDeHabilidades.jsx";
import { useActualizarColaboradora } from "../Hooks/useActualizarColaboradora.js";
import { useAuth } from "../Hooks/useAuth.js";
import { useCatalogoDeHabilidades } from "../Hooks/useCatalogoDeHabilidades.js";
import { useColaboradora } from "../Hooks/useColaboradora.js";
import { useHabilidadesDeColaboradora } from "../Hooks/useHabilidadesDeColaboradora.js";
import estilos from "./Perfil.module.css";

export function PerfilColaboradoraPage() {
  const { usuario } = useAuth();
  const consulta = useColaboradora(usuario.perfilId);
  const [actualizada, setActualizada] = useState(null);
  const edicion = useActualizarColaboradora(usuario.perfilId, setActualizada);
  const habilidades = useHabilidadesDeColaboradora(usuario.perfilId, setActualizada);
  const catalogo = useCatalogoDeHabilidades();
  const colaboradora = actualizada ?? consulta.colaboradora;

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-perfil-colaboradora">
      <TituloDePagina>Tu perfil</TituloDePagina>
      <div className={estilos.encabezado}>
        <div className={estilos.titulos}>
          <h1 id="titulo-perfil-colaboradora" tabIndex={-1}>
            Tu perfil
          </h1>
          <p className={estilos.bajada}>Editá cómo te ven los colectivos.</p>
        </div>
        <Link to={`/colaboradoras/${usuario.perfilId}`} className={estilos.enlace}>
          Ver perfil público
        </Link>
      </div>
      {consulta.error ? (
        <ErrorState
          titulo="No pudimos cargar tu perfil"
          error={consulta.error}
          alReintentar={consulta.recargar}
        />
      ) : !colaboradora ? (
        <Skeleton etiqueta="Cargando tu perfil…">
          <div className={estilos.panel}>
            <BloqueSkeleton ancho="30%" />
            <BloqueSkeleton alto="2.75rem" />
            <BloqueSkeleton ancho="40%" />
            <BloqueSkeleton alto="6rem" />
          </div>
        </Skeleton>
      ) : (
        <>
          <ColaboradoraForm
            key={edicion.version}
            colaboradora={colaboradora}
            esAlta={false}
            catalogo={catalogo}
            textoEnviar="Guardar cambios"
            textoEnviando="Guardando…"
            enviando={edicion.guardando}
            errorEnvio={edicion.error}
            alEnviar={edicion.guardar}
          />
          <section className={estilos.panel} aria-labelledby="titulo-habilidades">
            <h2 id="titulo-habilidades">Habilidades</h2>
            <p className={estilos.bajada}>Se guardan en el momento en que las marcás.</p>
            <p role="status" className={estilos.confirmacion}>
              {habilidades.guardado && (
                <>
                  <Icono nombre="tilde" tamano={16} />
                  Guardamos tus habilidades
                </>
              )}
            </p>
            <SelectorDeHabilidades
              catalogo={catalogo}
              elegidas={colaboradora.habilidades}
              pendiente={habilidades.pendiente}
              minimo={1}
              leyendaOculta
              motivoMinimo="Necesitás al menos una habilidad."
              alMarcar={habilidades.agregar}
              alDesmarcar={habilidades.quitar}
            />
          </section>
        </>
      )}
    </section>
  );
}
