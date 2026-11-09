import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { EstadoVacio } from "@/Presentation/Components/App/estados/EstadoVacio.jsx";
import { Paginacion } from "@/Presentation/Components/App/navegacion/Paginacion.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { clases } from "@/Presentation/Components/App/ui/clases.js";
import { MensajeDeLaBandeja } from "@/Presentation/Components/Mensaje/MensajeDeLaBandeja.jsx";
import { TITULO_SIN_MENSAJES } from "@/Presentation/Formatos/mensaje.js";
import { useMensajes } from "@/Presentation/Hooks/mensaje/useMensajes.js";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import estilos from "./MensajesPage.module.css";

function leerPagina(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 1 ? numero : 1;
}

function Cargando() {
  return (
    <Esqueleto etiqueta="Cargando tus mensajes…">
      <div className={estilos.lista}>
        <BloqueEsqueleto alto="6rem" />
        <BloqueEsqueleto alto="6rem" />
        <BloqueEsqueleto alto="6rem" />
      </div>
    </Esqueleto>
  );
}

export function MensajesPage() {
  const { usuario } = useAuth();
  const [parametros, setParametros] = useSearchParams();
  const pagina = leerPagina(parametros.get("pagina"));
  const { resultado, error, cargando, cargandoPagina, reintentar } = useMensajes(
    usuario.perfilId,
    pagina,
  );

  const irAPagina = useCallback(
    (numero, { reemplazar = false } = {}) => {
      setParametros(
        (actuales) => {
          const nuevos = new URLSearchParams(actuales);
          if (numero > 1) nuevos.set("pagina", String(numero));
          else nuevos.delete("pagina");
          return nuevos;
        },
        { replace: reemplazar },
      );
    },
    [setParametros],
  );

  const fueraDeRango =
    resultado &&
    !cargandoPagina &&
    resultado.items.length === 0 &&
    resultado.totalPaginas >= 1 &&
    pagina > resultado.totalPaginas;

  useEffect(() => {
    if (fueraDeRango) irAPagina(resultado.totalPaginas, { reemplazar: true });
  }, [fueraDeRango, irAPagina, resultado]);

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-mensajes">
      <TituloDePagina>Mensajes</TituloDePagina>
      <h1 id="titulo-mensajes" tabIndex={-1}>
        Mensajes
      </h1>
      {error && !resultado ? (
        <EstadoDeError
          titulo="No pudimos cargar tus mensajes"
          error={error}
          alReintentar={reintentar}
        />
      ) : cargando || !resultado ? (
        <Cargando />
      ) : resultado.items.length === 0 && !fueraDeRango ? (
        <EstadoVacio titulo={TITULO_SIN_MENSAJES} />
      ) : (
        <>
          {error && (
            <EstadoDeError
              titulo="No pudimos cargar tus mensajes"
              error={error}
              alReintentar={reintentar}
            />
          )}
          <ul
            className={clases(estilos.lista, cargandoPagina && estilos.atenuada)}
            inert={cargandoPagina}
            aria-busy={cargandoPagina}
          >
            {resultado.items.map((mensaje) => (
              <MensajeDeLaBandeja
                key={mensaje.id}
                mensaje={mensaje}
                colaboradorId={usuario.perfilId}
              />
            ))}
          </ul>
          <Paginacion
            etiqueta="Paginación de mensajes"
            pagina={resultado.pagina}
            totalPaginas={resultado.totalPaginas}
            alCambiar={irAPagina}
          />
        </>
      )}
    </section>
  );
}
