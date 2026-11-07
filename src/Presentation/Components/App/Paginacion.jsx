import { Boton } from "./Boton.jsx";
import { Icono } from "./Icono.jsx";
import { TextoOculto } from "./TextoOculto.jsx";
import { numerosAlrededor } from "./numerosAlrededor.js";
import estilos from "./Paginacion.module.css";

export function Paginacion({ pagina, totalPaginas, etiqueta, alCambiar }) {
  if (totalPaginas <= 1) return null;
  return (
    <nav aria-label={etiqueta} className={estilos.paginacion}>
      <Boton
        icono="flechaIzquierda"
        disabled={pagina <= 1}
        onClick={() => alCambiar(pagina - 1)}
      >
        Anterior
      </Boton>
      <ol className={estilos.numeros}>
        {numerosAlrededor(pagina, totalPaginas).map((numero) => (
          <li key={numero}>
            {numero === pagina ? (
              <span aria-current="page" className={estilos.actual}>
                <TextoOculto>Página </TextoOculto>
                {numero}
                <TextoOculto> de {totalPaginas}</TextoOculto>
              </span>
            ) : (
              <button
                type="button"
                className={estilos.numero}
                aria-label={`Página ${numero}`}
                onClick={() => alCambiar(numero)}
              >
                {numero}
              </button>
            )}
          </li>
        ))}
      </ol>
      <Boton disabled={pagina >= totalPaginas} onClick={() => alCambiar(pagina + 1)}>
        Siguiente
        <Icono nombre="flechaDerecha" />
      </Boton>
    </nav>
  );
}
