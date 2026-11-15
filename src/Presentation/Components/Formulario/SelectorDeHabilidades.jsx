import { useId, useMemo, useState } from "react";
import { AyudaYError, Campo } from "@/Presentation/Components/App/ui/Campo.jsx";
import { describir } from "@/Presentation/Components/App/ui/campoAccesible.js";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { TextoOculto } from "@/Presentation/Components/App/ui/TextoOculto.jsx";
import estilos from "./SelectorDeHabilidades.module.css";

function normalizar(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export function SelectorDeHabilidades({
  catalogo,
  elegidas,
  alMarcar,
  alDesmarcar,
  obligatorio = false,
  error,
  pendiente = null,
  minimo = 0,
  motivoMinimo,
  leyendaOculta = false,
  leyenda = "Habilidades",
  etiquetaDeBusqueda = "Buscar habilidad",
  id: idRecibido,
}) {
  const idGenerado = useId();
  const id = idRecibido ?? idGenerado;
  const [busqueda, setBusqueda] = useState("");
  const codigosElegidos = useMemo(
    () => new Set(elegidas.map((habilidad) => habilidad.codigo)),
    [elegidas],
  );
  const visibles = useMemo(() => {
    const filtro = normalizar(busqueda);
    return (catalogo.habilidades ?? []).filter((habilidad) =>
      normalizar(habilidad.titulo).includes(filtro),
    );
  }, [catalogo.habilidades, busqueda]);
  const enMinimo = elegidas.length <= minimo;

  function alternar(habilidad, marcada) {
    if (marcada) alMarcar(habilidad);
    else alDesmarcar(habilidad);
  }

  return (
    <fieldset
      id={id}
      tabIndex={-1}
      className={estilos.selector}
      aria-invalid={error ? true : undefined}
      aria-describedby={describir(id, { error })}
    >
      <legend className={leyendaOculta ? estilos.oculta : undefined}>
        {leyenda}
        {obligatorio && " (obligatorio)"}
      </legend>

      {elegidas.length > 0 && (
        <ul className={estilos.elegidas} aria-label={`${leyenda} elegidas`}>
          {elegidas.map((habilidad) => {
            const quitando = pendiente === habilidad.codigo;
            return (
              <li key={habilidad.codigo} className={estilos.elegida}>
                {habilidad.titulo}
                <button
                  type="button"
                  className={estilos.quitar}
                  aria-label={
                    quitando ? undefined : `Quitar habilidad ${habilidad.titulo}`
                  }
                  disabled={quitando || enMinimo || pendiente !== null}
                  aria-describedby={enMinimo && motivoMinimo ? `${id}-minimo` : undefined}
                  onClick={() => alDesmarcar(habilidad)}
                >
                  {quitando ? "Quitando…" : <Icono nombre="cruz" tamano={16} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {enMinimo && elegidas.length > 0 && motivoMinimo && (
        <p id={`${id}-minimo`} className={estilos.ayuda}>
          {motivoMinimo}
        </p>
      )}

      <Contenido
        catalogo={catalogo}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        visibles={visibles}
        codigosElegidos={codigosElegidos}
        pendiente={pendiente}
        enMinimo={enMinimo}
        alternar={alternar}
        etiquetaDeBusqueda={etiquetaDeBusqueda}
      />
      <AyudaYError id={id} error={error} />
    </fieldset>
  );
}

function Contenido({
  catalogo,
  busqueda,
  setBusqueda,
  visibles,
  codigosElegidos,
  pendiente,
  enMinimo,
  alternar,
  etiquetaDeBusqueda,
}) {
  if (catalogo.error) {
    return (
      <EstadoDeError
        nivel={3}
        enfocar={false}
        titulo="No pudimos cargar las habilidades"
        error={catalogo.error}
        alReintentar={catalogo.recargar}
      />
    );
  }
  if (!catalogo.habilidades) {
    return (
      <Esqueleto etiqueta="Cargando habilidades…">
        <div className={estilos.selector}>
          <BloqueEsqueleto alto="2.75rem" />
          <BloqueEsqueleto ancho="50%" />
          <BloqueEsqueleto ancho="40%" />
          <BloqueEsqueleto ancho="60%" />
        </div>
      </Esqueleto>
    );
  }
  if (catalogo.habilidades.length === 0) {
    return <p className={estilos.sinResultados}>Todavía no hay habilidades cargadas.</p>;
  }
  return (
    <>
      <Campo
        etiqueta={etiquetaDeBusqueda}
        type="search"
        autoComplete="off"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <TextoOculto aria-live="polite">
        {visibles.length === 1 ? "1 habilidad" : `${visibles.length} habilidades`}
      </TextoOculto>
      {visibles.length === 0 ? (
        <p className={estilos.sinResultados}>
          No hay habilidades que coincidan con «{busqueda.trim()}».
        </p>
      ) : (
        <ul className={estilos.lista}>
          {visibles.map((habilidad) => {
            const elegida = codigosElegidos.has(habilidad.codigo);
            const marcada = pendiente === habilidad.codigo ? !elegida : elegida;
            return (
              <li key={habilidad.codigo}>
                <label className={estilos.opcion}>
                  <input
                    type="checkbox"
                    checked={marcada}
                    disabled={pendiente !== null || (elegida && enMinimo)}
                    onChange={(e) => alternar(habilidad, e.target.checked)}
                  />
                  {habilidad.titulo}
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
