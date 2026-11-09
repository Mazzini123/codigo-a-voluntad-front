import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ColaboradoraForm } from "@/Presentation/Components/Colaboradora/ColaboradoraForm.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { SelectorDeHabilidades } from "@/Presentation/Components/Formulario/SelectorDeHabilidades.jsx";
import { useActualizarColaboradora } from "@/Presentation/Hooks/colaboradora/useActualizarColaboradora.js";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { useCatalogoDeHabilidades } from "@/Presentation/Hooks/habilidad/useCatalogoDeHabilidades.js";
import { useColaboradora } from "@/Presentation/Hooks/colaboradora/useColaboradora.js";
import { useHabilidadesDeColaboradora } from "@/Presentation/Hooks/colaboradora/useHabilidadesDeColaboradora.js";
import { estadoParaVolver, rutaColaboradora } from "@/Presentation/Routes/rutas.js";
import estilos from "@/Presentation/Components/Perfil/Perfil.module.css";

export function PerfilColaboradoraPage() {
  const location = useLocation();
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
        <Link
          to={rutaColaboradora(usuario.perfilId)}
          state={estadoParaVolver(location, "Volver a mi perfil")}
          className={estilos.enlace}
        >
          Ver perfil público
        </Link>
      </div>
      {consulta.error ? (
        <EstadoDeError
          titulo="No pudimos cargar tu perfil"
          error={consulta.error}
          alReintentar={consulta.recargar}
        />
      ) : !colaboradora ? (
        <Esqueleto etiqueta="Cargando tu perfil…">
          <div className={estilos.panel}>
            <BloqueEsqueleto ancho="30%" />
            <BloqueEsqueleto alto="2.75rem" />
            <BloqueEsqueleto ancho="40%" />
            <BloqueEsqueleto alto="6rem" />
          </div>
        </Esqueleto>
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
