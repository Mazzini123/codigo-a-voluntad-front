import { useCallback, useEffect, useRef, useState } from "react";
import { FilaParaDarDeBaja } from "@/Presentation/Components/Administracion/FilaParaDarDeBaja.jsx";
import { DialogoDeConfirmacion } from "@/Presentation/Components/App/dialogos/DialogoDeConfirmacion.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { EstadoVacio } from "@/Presentation/Components/App/estados/EstadoVacio.jsx";
import { Paginacion } from "@/Presentation/Components/App/navegacion/Paginacion.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { Campo } from "@/Presentation/Components/App/ui/Campo.jsx";
import { GrupoDeOpciones } from "@/Presentation/Components/App/ui/GrupoDeOpciones.jsx";
import { Selector } from "@/Presentation/Components/App/ui/Selector.jsx";
import { puedeDarDeBaja } from "@/Application/Domain/Reglas/baja.js";
import {
  errorDeMotivoDeBaja,
  LARGO_MAXIMO_DE_MOTIVO,
  mensajeDeBaja,
  MOTIVO_CONFLICTO_DE_BAJA,
  OPCIONES_DE_ESTADO_PARA_BAJA,
  sinProyectosEnEstado,
  TIPO_DE_BAJA,
} from "@/Presentation/Formatos/baja.js";
import { selloDeProyecto } from "@/Presentation/Formatos/proyecto.js";
import {
  claveDeBajas,
  useBajasPorInfraccion,
} from "@/Presentation/Hooks/administracion/useBajasPorInfraccion.js";
import { useParametrosDeBajas } from "@/Presentation/Hooks/administracion/useParametrosDeBajas.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { rutaColectivo, rutaProyecto } from "@/Presentation/Routes/rutas.js";
import estilos from "./BajasPorInfraccionPage.module.css";

const OPCIONES_DE_TIPO = Object.freeze([
  Object.freeze({ valor: TIPO_DE_BAJA.PROYECTO, texto: "Un proyecto" }),
  Object.freeze({ valor: TIPO_DE_BAJA.COLECTIVO, texto: "Un colectivo" }),
]);

const TEXTOS = Object.freeze({
  [TIPO_DE_BAJA.PROYECTO]: Object.freeze({
    titulo: "Elegir un proyecto",
    alcance:
      "Ves los proyectos de todos los colectivos: borradores, en revisión, abiertos y finalizados. Los que ya fueron dados de baja no aparecen.",
    buscarPor: "Buscar por título o colectivo",
    largoMaximo: 80,
    formulario: "Buscar proyectos",
    lista: "Proyectos",
    cargando: "Cargando proyectos…",
    error: "No pudimos cargar los proyectos",
    vacio: "No hay proyectos para dar de baja",
    sinResultados: (busqueda) => `No encontramos proyectos con «${busqueda}»`,
    limpiar: "Limpiar filtros",
    conteo: (total) => (total === 1 ? "1 proyecto" : `${total} proyectos`),
    consecuencias:
      "Deja de verse en la plataforma y sus colaboraciones se cierran. El colectivo ve el motivo en Mis proyectos.",
    exito: (nombre) =>
      `Diste de baja «${nombre}». El colectivo ve el motivo en Mis proyectos.`,
  }),
  [TIPO_DE_BAJA.COLECTIVO]: Object.freeze({
    titulo: "Elegir un colectivo",
    alcance: "Ves los colectivos activos. Los que ya fueron dados de baja no aparecen.",
    buscarPor: "Buscar por nombre",
    formulario: "Buscar colectivos",
    lista: "Colectivos",
    cargando: "Cargando colectivos…",
    error: "No pudimos cargar los colectivos",
    vacio: "No hay colectivos activos",
    sinResultados: (busqueda) => `No encontramos colectivos con «${busqueda}»`,
    limpiar: "Limpiar búsqueda",
    conteo: (total) => (total === 1 ? "1 colectivo" : `${total} colectivos`),
    consecuencias:
      "Sus proyectos abiertos se finalizan, se cancelan sus solicitudes de ingreso y sus miembros pierden el acceso al colectivo.",
    exito: (nombre) =>
      `Diste de baja «${nombre}». Sus proyectos abiertos se finalizaron.`,
  }),
});

function filaDe(tipo, elemento) {
  if (tipo === TIPO_DE_BAJA.COLECTIVO) {
    return { nombre: elemento.nombre, ruta: rutaColectivo(elemento.id), detalle: null };
  }
  return {
    nombre: elemento.titulo,
    ruta: rutaProyecto(elemento.id),
    detalle: elemento.colectivo?.nombre ?? null,
    sello: selloDeProyecto(elemento.estado),
    motivoDeshabilitado: puedeDarDeBaja(elemento) ? null : MOTIVO_CONFLICTO_DE_BAJA,
  };
}

function tituloSinResultados(textos, { estado, busqueda }) {
  if (busqueda) return textos.sinResultados(busqueda);
  return sinProyectosEnEstado(estado);
}

export default function BajasPorInfraccionPage() {
  const parametros = useParametrosDeBajas();
  const datos = useBajasPorInfraccion(parametros);
  const avisar = useAvisos();
  const [eleccion, setEleccion] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [errorDeMotivo, setErrorDeMotivo] = useState(null);
  const refTitulo = useRef(null);
  const refMotivo = useRef(null);
  const refHecho = useRef(false);
  const focoAlCerrar = useCallback(
    () => (refHecho.current ? refTitulo.current : null),
    [],
  );
  const textos = eleccion && TEXTOS[eleccion.tipo];

  function elegir(tipo, fila, id) {
    refHecho.current = false;
    setMotivo("");
    setErrorDeMotivo(null);
    setEleccion({ tipo, id, nombre: fila.nombre });
  }

  async function confirmar() {
    const problema = errorDeMotivoDeBaja(motivo);
    if (problema) {
      setErrorDeMotivo(problema);
      refMotivo.current?.focus();
      return;
    }
    const resultado = await datos.operar(eleccion.tipo, eleccion.id, motivo);
    if (!resultado) return;
    refHecho.current = true;
    setEleccion(null);
    if (!resultado.ok) {
      avisar.error(mensajeDeBaja(resultado.error, eleccion.tipo));
      return;
    }
    avisar.exito(textos.exito(eleccion.nombre));
  }

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-bajas">
      <TituloDePagina>Bajas por infracción</TituloDePagina>
      <header className={estilos.encabezado}>
        <h1 id="titulo-bajas" ref={refTitulo} tabIndex={-1}>
          Bajas por infracción
        </h1>
        <p>
          Cuando un proyecto o un colectivo no cumple los términos y condiciones, lo das
          de baja con un motivo. Queda registrado en la auditoría.
        </p>
      </header>
      <GrupoDeOpciones
        leyenda="Qué vas a dar de baja"
        opciones={OPCIONES_DE_TIPO}
        valor={parametros.tipo}
        alCambiar={parametros.cambiarTipo}
      />
      <Candidatos
        key={parametros.tipo}
        parametros={parametros}
        datos={datos}
        alElegir={elegir}
      />
      <DialogoDeConfirmacion
        abierto={Boolean(eleccion)}
        titulo={eleccion ? `¿Dar de baja «${eleccion.nombre}»?` : ""}
        descripcion={textos?.consecuencias}
        textoConfirmar="Dar de baja"
        textoEnviando="Dando de baja…"
        enviando={datos.procesando}
        destinoDeFoco={focoAlCerrar}
        alConfirmar={confirmar}
        alCancelar={() => setEleccion(null)}
      >
        <Campo
          ref={refMotivo}
          etiqueta="Motivo"
          obligatorio
          multilinea
          rows={4}
          maxLength={LARGO_MAXIMO_DE_MOTIVO}
          value={motivo}
          error={errorDeMotivo}
          ayuda={`El colectivo lo lee. ${motivo.length} de ${LARGO_MAXIMO_DE_MOTIVO} caracteres.`}
          onChange={(evento) => {
            setMotivo(evento.target.value);
            setErrorDeMotivo(null);
          }}
        />
      </DialogoDeConfirmacion>
    </section>
  );
}

function Candidatos({ parametros, datos, alElegir }) {
  const { tipo, estado, busqueda, pagina } = parametros;
  const textos = TEXTOS[tipo];
  const [texto, setTexto] = useState(busqueda);
  const refConteo = useRef(null);
  const enfocarAlCargar = useRef(false);
  const { resultado, cargando } = datos;
  const desactualizado =
    !resultado || resultado.consulta !== claveDeBajas({ tipo, estado, busqueda, pagina });
  const fueraDeRango =
    resultado &&
    !cargando &&
    !desactualizado &&
    resultado.items.length === 0 &&
    resultado.totalPaginas >= 1 &&
    pagina > resultado.totalPaginas;

  const { irAPagina } = parametros;
  useEffect(() => {
    if (fueraDeRango) irAPagina(resultado.totalPaginas, { reemplazar: true });
  }, [fueraDeRango, irAPagina, resultado]);

  useEffect(() => {
    if (enfocarAlCargar.current && !desactualizado && !fueraDeRango) {
      enfocarAlCargar.current = false;
      refConteo.current?.focus();
    }
  });

  function enviar(evento) {
    evento.preventDefault();
    parametros.buscar(texto);
  }

  function limpiarBusqueda() {
    setTexto("");
    parametros.buscar("");
  }

  function limpiarFiltros() {
    setTexto("");
    parametros.limpiar();
  }

  function cambiarPagina(numero) {
    enfocarAlCargar.current = true;
    parametros.irAPagina(numero);
  }

  return (
    <section className={estilos.seccion} aria-labelledby="titulo-candidatos">
      <h2 id="titulo-candidatos">{textos.titulo}</h2>
      <p className={estilos.alcance}>{textos.alcance}</p>
      <form
        role="search"
        aria-label={textos.formulario}
        className={estilos.buscador}
        onSubmit={enviar}
      >
        {tipo === TIPO_DE_BAJA.PROYECTO && (
          <Selector
            etiqueta="Estado"
            opciones={OPCIONES_DE_ESTADO_PARA_BAJA}
            value={estado}
            onChange={(evento) => parametros.cambiarEstado(evento.target.value)}
          />
        )}
        <Campo
          etiqueta={textos.buscarPor}
          type="search"
          autoComplete="off"
          maxLength={textos.largoMaximo}
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
        />
        <Boton type="submit">Buscar</Boton>
        {busqueda && <Boton onClick={limpiarBusqueda}>Limpiar</Boton>}
      </form>
      <Resultados
        tipo={tipo}
        filtros={{ estado, busqueda }}
        datos={datos}
        desactualizado={desactualizado || fueraDeRango}
        refConteo={refConteo}
        alElegir={alElegir}
        alLimpiar={limpiarFiltros}
        alCambiarPagina={cambiarPagina}
      />
    </section>
  );
}

function Resultados({
  tipo,
  filtros,
  datos,
  desactualizado,
  refConteo,
  alElegir,
  alLimpiar,
  alCambiarPagina,
}) {
  const textos = TEXTOS[tipo];
  const { resultado, error, cargando, reintentar, procesando } = datos;
  if (error) {
    return (
      <EstadoDeError
        nivel={3}
        enfocar={false}
        titulo={textos.error}
        error={error}
        alReintentar={reintentar}
      />
    );
  }
  if (desactualizado) {
    return (
      <Esqueleto etiqueta={textos.cargando}>
        <BloqueEsqueleto alto="4rem" />
        <BloqueEsqueleto alto="4rem" />
        <BloqueEsqueleto alto="4rem" />
      </Esqueleto>
    );
  }
  if (resultado.items.length === 0) {
    return filtros.busqueda || filtros.estado ? (
      <EstadoVacio
        nivel={3}
        titulo={tituloSinResultados(textos, filtros)}
        descripcion="Probá con otra búsqueda o mirá la lista completa."
      >
        <Boton onClick={alLimpiar}>{textos.limpiar}</Boton>
      </EstadoVacio>
    ) : (
      <EstadoVacio nivel={3} titulo={textos.vacio} />
    );
  }
  return (
    <div aria-busy={cargando}>
      <p ref={refConteo} tabIndex={-1} className={estilos.conteo}>
        {textos.conteo(resultado.total)}
      </p>
      <ul className={estilos.lista} aria-label={textos.lista}>
        {resultado.items.map((elemento) => {
          const fila = filaDe(tipo, elemento);
          return (
            <FilaParaDarDeBaja
              key={elemento.id}
              {...fila}
              deshabilitado={procesando}
              alDarDeBaja={() => alElegir(tipo, fila, elemento.id)}
            />
          );
        })}
      </ul>
      <Paginacion
        etiqueta={`Paginación de ${textos.lista.toLowerCase()}`}
        pagina={resultado.pagina}
        totalPaginas={resultado.totalPaginas}
        alCambiar={alCambiarPagina}
      />
    </div>
  );
}
