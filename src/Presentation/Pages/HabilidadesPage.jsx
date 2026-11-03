import { useState } from "react";
import { HabilidadForm } from "../Components/Habilidad/HabilidadForm.jsx";
import { HabilidadList } from "../Components/Habilidad/HabilidadList.jsx";
import { useHabilidades } from "../Hooks/useHabilidades.js";
import { useCrearHabilidad } from "../Hooks/useCrearHabilidad.js";
import "../../Styles/habilidades.css";

export function HabilidadesPage() {
  const [page, setPage] = useState(1);
  const { pagina, cargando, error, refrescar } = useHabilidades(page);
  const alta = useCrearHabilidad();
  const [mensaje, setMensaje] = useState("");
  async function crear(request) {
    setMensaje("");
    const creada = await alta.crear(request);
    if (creada) {
      setMensaje("Habilidad creada correctamente.");
      refrescar();
    }
    return creada;
  }
  function cambiarPagina(nuevaPagina) {
    setPage(nuevaPagina);
    refrescar();
  }
  return (
    <>
      <h1>Habilidades</h1>
      <p>Consultá el catálogo y agregá habilidades para los proyectos.</p>
      <HabilidadForm onCrear={crear} guardando={alta.guardando} error={alta.error} />
      {mensaje && <p role="status">{mensaje}</p>}
      <section aria-label="Catálogo de habilidades" aria-busy={cargando}>
        <h2>Catálogo</h2>
        {cargando && <p role="status">Cargando habilidades…</p>}
        {error && <p role="alert">{error}</p>}
        <button type="button" onClick={refrescar} disabled={cargando}>
          Actualizar catálogo
        </button>
        {pagina && (
          <>
            <HabilidadList habilidades={pagina.data} />
            <nav aria-label="Paginación de habilidades" className="paginacion">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => cambiarPagina(page - 1)}
              >
                Anterior
              </button>
              <span>
                Página {pagina.meta.page} de {Math.max(1, pagina.meta.total_pages)} ·{" "}
                {pagina.meta.total} habilidades
              </span>
              <button
                type="button"
                disabled={page >= pagina.meta.total_pages}
                onClick={() => cambiarPagina(page + 1)}
              >
                Siguiente
              </button>
            </nav>
          </>
        )}
      </section>
    </>
  );
}
