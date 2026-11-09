import { Link } from "react-router-dom";
import { BajaDelColectivo } from "@/Presentation/Components/Colectivo/BajaDelColectivo.jsx";
import { ColectivoForm } from "@/Presentation/Components/Colectivo/ColectivoForm.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { useActualizarColectivo } from "@/Presentation/Hooks/colectivo/useActualizarColectivo.js";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { useColectivo } from "@/Presentation/Hooks/colectivo/useColectivo.js";
import estilos from "@/Presentation/Components/Perfil/Perfil.module.css";
import { rutaColectivo } from "@/Presentation/Routes/rutas.js";

export function PerfilColectivoPage() {
  const { usuario } = useAuth();
  const consulta = useColectivo(usuario.perfilId);
  const edicion = useActualizarColectivo(usuario.perfilId);
  const colectivo = edicion.guardado ?? consulta.colectivo;

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-perfil-colectivo">
      <TituloDePagina>Perfil del colectivo</TituloDePagina>
      <div className={estilos.encabezado}>
        <div className={estilos.titulos}>
          <h1 id="titulo-perfil-colectivo" tabIndex={-1}>
            Perfil del colectivo
          </h1>
          <p className={estilos.bajada}>
            Editá cómo se presentan en la plataforma. Los medios de contacto no son
            públicos.
          </p>
        </div>
        <Link to={rutaColectivo(usuario.perfilId)} className={estilos.enlace}>
          Ver perfil público
        </Link>
      </div>
      <Contenido consulta={consulta} edicion={edicion} colectivo={colectivo} />
      {colectivo && !consulta.error && <BajaDelColectivo colectivo={colectivo} />}
    </section>
  );
}

function Contenido({ consulta, edicion, colectivo }) {
  if (consulta.error) {
    return (
      <EstadoDeError
        titulo="No pudimos cargar el perfil"
        error={consulta.error}
        alReintentar={consulta.recargar}
      />
    );
  }
  if (!colectivo) {
    return (
      <Esqueleto etiqueta="Cargando el perfil…">
        <div className={estilos.panel}>
          <BloqueEsqueleto ancho="30%" />
          <BloqueEsqueleto alto="2.75rem" />
          <BloqueEsqueleto ancho="40%" />
          <BloqueEsqueleto alto="6rem" />
          <BloqueEsqueleto ancho="30%" />
          <BloqueEsqueleto alto="2.75rem" />
        </div>
      </Esqueleto>
    );
  }
  return (
    <ColectivoForm
      key={edicion.version}
      colectivo={colectivo}
      esAlta={false}
      textoEnviar="Guardar cambios"
      textoEnviando="Guardando…"
      enviando={edicion.guardando}
      errorEnvio={edicion.error}
      alEnviar={edicion.guardar}
    />
  );
}
