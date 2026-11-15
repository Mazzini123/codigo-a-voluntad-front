import { useSearchParams } from "react-router-dom";
import { HabilidadForm } from "@/Presentation/Components/Habilidad/HabilidadForm.jsx";
import { HabilidadList } from "@/Presentation/Components/Habilidad/HabilidadList.jsx";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { EstadoVacio } from "@/Presentation/Components/App/estados/EstadoVacio.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { Paginacion } from "@/Presentation/Components/App/navegacion/Paginacion.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { useHabilidades } from "@/Presentation/Hooks/habilidad/useHabilidades.js";
import { useCrearHabilidad } from "@/Presentation/Hooks/habilidad/useCrearHabilidad.js";
import estilos from "./HabilidadesPage.module.css";

function leerPagina(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 1 ? numero : 1;
}

export function HabilidadesPage() {
  const [parametros, setParametros] = useSearchParams();
  const pagina = leerPagina(parametros.get("pagina"));
  const catalogo = useHabilidades(pagina);
  const alta = useCrearHabilidad();

  async function crear(request) {
    const creada = await alta.crear(request);
    if (creada) catalogo.recargar();
    return creada;
  }

  function irAPagina(nuevaPagina) {
    setParametros(nuevaPagina > 1 ? { pagina: String(nuevaPagina) } : {});
  }

  return (
    <div className={estilos.pagina}>
      <TituloDePagina>Habilidades</TituloDePagina>
      <header className={estilos.encabezado}>
        <h1 tabIndex={-1}>Habilidades</h1>
        <p className={estilos.bajada}>
          Consultá el catálogo y agregá habilidades para los proyectos.
        </p>
      </header>

      <HabilidadForm onCrear={crear} guardando={alta.guardando} error={alta.error} />

      <section aria-labelledby="catalogo" className={estilos.catalogo}>
        <div className={estilos.cabeceraCatalogo}>
          <h2 id="catalogo">Catálogo</h2>
          <Conteo resultado={catalogo.resultado} cargando={catalogo.cargando} />
        </div>
        <Catalogo {...catalogo} pagina={pagina} irAPagina={irAPagina} />
      </section>
    </div>
  );
}

function Catalogo({ resultado, error, cargando, recargar, pagina, irAPagina }) {
  if (error) {
    return (
      <EstadoDeError
        nivel={3}
        titulo="No pudimos cargar las habilidades"
        error={error}
        alReintentar={recargar}
      />
    );
  }
  const desactualizado = !resultado || resultado.pagina !== pagina;
  if (cargando && desactualizado) return <CatalogoCargando />;
  if (!resultado) return null;
  if (resultado.items.length === 0) {
    return pagina > 1 ? (
      <EstadoVacio
        nivel={3}
        titulo="No hay habilidades en esta página"
        descripcion="El catálogo tiene menos páginas de las que pediste."
      >
        <Boton onClick={() => irAPagina(1)}>Volver a la primera página</Boton>
      </EstadoVacio>
    ) : (
      <EstadoVacio
        nivel={3}
        titulo="Todavía no hay habilidades en el catálogo"
        descripcion="Agregá la primera con el formulario."
      />
    );
  }
  return (
    <div aria-busy={cargando} className={estilos.catalogo}>
      <HabilidadList habilidades={resultado.items} />
      <Paginacion
        etiqueta="Paginación de habilidades"
        pagina={resultado.pagina}
        totalPaginas={resultado.totalPaginas}
        alCambiar={irAPagina}
      />
    </div>
  );
}

function Conteo({ resultado, cargando }) {
  if (cargando || !resultado || resultado.items.length === 0) return null;
  const { pagina, porPagina, total } = resultado;
  const desde = (pagina - 1) * porPagina + 1;
  const hasta = desde + resultado.items.length - 1;
  return (
    <p className={estilos.conteo}>
      Mostrando {desde}–{hasta} de {total}
    </p>
  );
}

function CatalogoCargando() {
  return (
    <Esqueleto etiqueta="Cargando habilidades…" className={estilos.listaSkeleton}>
      <div className={estilos.listaSkeleton}>
        {[1, 2, 3].map((numero) => (
          <div key={numero} className={estilos.tarjetaSkeleton}>
            <BloqueEsqueleto ancho="60%" alto="1.4em" />
            <BloqueEsqueleto ancho="100%" />
            <BloqueEsqueleto ancho="70%" />
          </div>
        ))}
      </div>
    </Esqueleto>
  );
}
