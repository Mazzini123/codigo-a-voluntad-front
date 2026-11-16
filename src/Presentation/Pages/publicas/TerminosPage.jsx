import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { EstadoVacio } from "@/Presentation/Components/App/estados/EstadoVacio.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { TextoConFormato } from "@/Presentation/Components/App/texto/TextoConFormato.jsx";
import { textoDeVersion } from "@/Presentation/Formatos/terminos.js";
import { useTerminosVigentes } from "@/Presentation/Hooks/terminos/useTerminosVigentes.js";
import estilos from "./TerminosPage.module.css";

export function TerminosPage() {
  const vigentes = useTerminosVigentes();
  return (
    <article className={estilos.pagina} aria-labelledby="titulo-terminos">
      <TituloDePagina>Términos y condiciones</TituloDePagina>
      <header className={estilos.encabezado}>
        <h1 id="titulo-terminos" tabIndex={-1}>
          Términos y condiciones
        </h1>
        <p className={estilos.bajada}>
          Las reglas de uso de Código a Voluntad. Cada colectivo las acepta al crear un
          proyecto.
        </p>
      </header>
      <Contenido vigentes={vigentes} />
    </article>
  );
}

function Contenido({ vigentes }) {
  const { terminos, cargando, error, recargar } = vigentes;
  if (error) {
    return (
      <EstadoDeError
        titulo="No pudimos cargar los términos"
        error={error}
        alReintentar={recargar}
      />
    );
  }
  if (cargando) {
    return (
      <Esqueleto etiqueta="Cargando los términos…">
        <BloqueEsqueleto ancho="40%" />
        <BloqueEsqueleto alto="8rem" />
        <BloqueEsqueleto alto="8rem" />
      </Esqueleto>
    );
  }
  if (!terminos) {
    return (
      <EstadoVacio
        titulo="Todavía no hay términos publicados"
        descripcion="Cuando administración los publique, vas a poder leerlos acá."
      />
    );
  }
  return (
    <>
      <p className={estilos.version}>{textoDeVersion(terminos)}</p>
      <TextoConFormato texto={terminos.texto} nivel={2} />
    </>
  );
}
