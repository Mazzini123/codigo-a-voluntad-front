import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { EstadoVacio } from "@/Presentation/Components/App/estados/EstadoVacio.jsx";
import { Paginacion } from "@/Presentation/Components/App/navegacion/Paginacion.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { Selector } from "@/Presentation/Components/App/ui/Selector.jsx";
import { clases } from "@/Presentation/Components/App/ui/clases.js";
import { MensajeDeLaBandeja } from "@/Presentation/Components/Mensaje/MensajeDeLaBandeja.jsx";
import { TITULO_SIN_MENSAJES } from "@/Presentation/Formatos/mensaje.js";
import { useMensajes } from "@/Presentation/Hooks/mensaje/useMensajes.js";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import estilos from "./MensajesPage.module.css";

const FILTROS = Object.freeze([
  { valor: "", texto: "Todos" },
  { valor: "sin-leer", texto: "Solo los no leídos" },
]);

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
  const soloSinLeer = parametros.get("mostrar") === "sin-leer";
  const { resultado, error, cargando, cargandoPagina, reintentar } = useMensajes(
    usuario.perfilId,
    pagina,
    soloSinLeer,
  );
  const [leidosAqui, setLeidosAqui] = useState({ resultado: null, cantidad: 0 });
  const leidosEnEstaLista = leidosAqui.resultado === resultado ? leidosAqui.cantidad : 0;
  const sinLeer =
    resultado && Number.isInteger(resultado.noLeidas)
      ? Math.max(0, resultado.noLeidas - leidosEnEstaLista)
      : null;
  const registrarLectura = useCallback(
    () =>
      setLeidosAqui((previo) => ({
        resultado,
        cantidad: (previo.resultado === resultado ? previo.cantidad : 0) + 1,
      })),
    [resultado],
  );

  function cambiarFiltro(valor) {
    setParametros(
      (actuales) => {
        const nuevos = new URLSearchParams(actuales);
        if (valor) nuevos.set("mostrar", valor);
        else nuevos.delete("mostrar");
        nuevos.delete("pagina");
        return nuevos;
      },
      { replace: true },
    );
  }

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
      {sinLeer !== null && (
        <p role="status" className={estilos.resumen}>
          {sinLeer === 0
            ? "No tenés mensajes sin leer."
            : sinLeer === 1
              ? "Tenés 1 mensaje sin leer."
              : `Tenés ${sinLeer} mensajes sin leer.`}
        </p>
      )}
      <Selector
        etiqueta="Mostrar"
        opciones={FILTROS}
        value={soloSinLeer ? "sin-leer" : ""}
        onChange={(evento) => cambiarFiltro(evento.target.value)}
      />
      {error && !resultado ? (
        <EstadoDeError
          titulo="No pudimos cargar tus mensajes"
          error={error}
          alReintentar={reintentar}
        />
      ) : cargando || !resultado ? (
        <Cargando />
      ) : resultado.items.length === 0 && !fueraDeRango ? (
        <EstadoVacio
          titulo={soloSinLeer ? "No tenés mensajes sin leer" : TITULO_SIN_MENSAJES}
        />
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
                alLeer={registrarLectura}
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
