import { useCallback, useEffect, useRef, useState } from "react";
import {
  cupoCompleto,
  fechaDeFinPorDefecto,
  fechaDeFinValida,
  fechaMinimaDeFin,
} from "@/Application/Domain/Reglas/destacados.js";
import { FilaDeProyectoParaDestacar } from "@/Presentation/Components/Administracion/FilaDeProyectoParaDestacar.jsx";
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
import {
  mensajeDeDestacado,
  MOTIVO_CUPO_COMPLETO,
  textoDeCupo,
} from "@/Presentation/Formatos/destacados.js";
import { fechaLarga } from "@/Presentation/Formatos/proyecto.js";
import { useBusquedaParaDestacar } from "@/Presentation/Hooks/administracion/useBusquedaParaDestacar.js";
import {
  claveDeBusqueda,
  useDestacadosDeAdministracion,
} from "@/Presentation/Hooks/administracion/useDestacadosDeAdministracion.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import estilos from "./DestacadosPage.module.css";

const ID_MOTIVO_DE_CUPO = "motivo-de-cupo";

const DIALOGOS = Object.freeze({
  destacar: {
    titulo: (proyecto) => `Destacar «${proyecto.titulo}»`,
    descripcion: "Va a aparecer primero en la portada y en los listados hasta esa fecha.",
    confirmar: "Destacar",
    peligroso: false,
    accion: "destacar",
  },
  cambiar: {
    titulo: (proyecto) => `Cambiar la fecha de «${proyecto.titulo}»`,
    descripcion: "Sigue destacado y ocupa el mismo lugar. Solo cambia hasta cuándo.",
    confirmar: "Guardar fecha",
    peligroso: false,
    accion: "destacar",
  },
  quitar: {
    titulo: (proyecto) => `¿Quitar «${proyecto.titulo}» de los destacados?`,
    descripcion:
      "Deja de aparecer primero y se libera un lugar. Podés volver a destacarlo cuando quieras.",
    confirmar: "Quitar destacado",
    peligroso: true,
    accion: "quitar",
  },
});

export default function DestacadosPage() {
  const busqueda = useBusquedaParaDestacar();
  const datos = useDestacadosDeAdministracion({
    etiqueta: busqueda.etiqueta,
    pagina: busqueda.pagina,
  });
  const avisar = useAvisos();
  const [confirmacion, setConfirmacion] = useState(null);
  const [fecha, setFecha] = useState("");
  const [errorDeFecha, setErrorDeFecha] = useState(null);
  const refTitulo = useRef(null);
  const refConfirmado = useRef(false);
  const focoAlCerrar = useCallback(
    () => (refConfirmado.current ? refTitulo.current : null),
    [],
  );
  const dialogo = confirmacion && DIALOGOS[confirmacion.tipo];
  const usados = datos.vigentes.items?.length ?? 0;
  const completo = cupoCompleto(usados);

  function elegir(tipo, proyecto) {
    refConfirmado.current = false;
    setFecha(fechaDeFinPorDefecto());
    setErrorDeFecha(null);
    setConfirmacion({ tipo, proyecto });
  }

  async function confirmar() {
    const { tipo, proyecto } = confirmacion;
    if (dialogo.accion === "destacar" && !fechaDeFinValida(fecha)) {
      setErrorDeFecha("Elegí una fecha posterior a hoy.");
      return;
    }
    const resultado = await datos.operar(dialogo.accion, proyecto.id, fecha);
    if (!resultado) return;
    refConfirmado.current = true;
    setConfirmacion(null);
    if (!resultado.ok) {
      avisar.error(mensajeDeDestacado(resultado.error, dialogo.accion));
      return;
    }
    avisar.exito(textoDeResultado(tipo, proyecto, resultado.datos));
  }

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-destacados">
      <TituloDePagina>Proyectos destacados</TituloDePagina>
      <header className={estilos.encabezado}>
        <h1 id="titulo-destacados" ref={refTitulo} tabIndex={-1}>
          Proyectos destacados
        </h1>
        <p>
          Los proyectos que elegís van primero en la portada y en los listados, hasta la
          fecha que indiques.
        </p>
      </header>
      <Vigentes
        vigentes={datos.vigentes}
        completo={completo}
        procesando={datos.procesando}
        alElegir={elegir}
      />
      <Elegir
        busqueda={busqueda}
        candidatos={datos.candidatos}
        completo={completo}
        procesando={datos.procesando}
        alElegir={elegir}
      />
      <DialogoDeConfirmacion
        abierto={Boolean(dialogo)}
        titulo={dialogo?.titulo(confirmacion.proyecto)}
        descripcion={dialogo?.descripcion}
        textoConfirmar={dialogo?.confirmar}
        textoEnviando="Guardando…"
        permanente={false}
        peligroso={dialogo?.peligroso}
        enviando={datos.procesando}
        destinoDeFoco={focoAlCerrar}
        alConfirmar={confirmar}
        alCancelar={() => setConfirmacion(null)}
      >
        {dialogo?.accion === "destacar" && (
          <Campo
            etiqueta="Destacado hasta"
            type="date"
            obligatorio
            min={fechaMinimaDeFin()}
            value={fecha}
            error={errorDeFecha}
            ayuda="El último día en que aparece destacado."
            onChange={(evento) => {
              setFecha(evento.target.value);
              setErrorDeFecha(null);
            }}
          />
        )}
      </DialogoDeConfirmacion>
    </section>
  );
}

function textoDeResultado(tipo, proyecto, datos) {
  if (tipo === "quitar") return `Quitaste «${proyecto.titulo}» de los destacados.`;
  const hasta = datos?.destacado?.hasta;
  const cuando = hasta ? ` hasta el ${fechaLarga(hasta)}` : "";
  return tipo === "cambiar"
    ? `Cambiaste la fecha de «${proyecto.titulo}»${cuando}.`
    : `Destacaste «${proyecto.titulo}»${cuando}.`;
}

function Vigentes({ vigentes, completo, procesando, alElegir }) {
  return (
    <section className={estilos.seccion} aria-labelledby="titulo-vigentes">
      <div className={estilos.cabeceraDeSeccion}>
        <h2 id="titulo-vigentes">Destacados vigentes</h2>
        {vigentes.items && (
          <p className={estilos.cupo}>{textoDeCupo(vigentes.items.length)}</p>
        )}
      </div>
      <ListaDeVigentes
        vigentes={vigentes}
        completo={completo}
        procesando={procesando}
        alElegir={alElegir}
      />
    </section>
  );
}

function ListaDeVigentes({ vigentes, procesando, alElegir }) {
  if (vigentes.error) {
    return (
      <EstadoDeError
        nivel={3}
        enfocar={false}
        titulo="No pudimos cargar los destacados"
        error={vigentes.error}
        alReintentar={vigentes.reintentar}
      />
    );
  }
  if (!vigentes.items) {
    return (
      <Esqueleto etiqueta="Cargando destacados…">
        <BloqueEsqueleto alto="4rem" />
        <BloqueEsqueleto alto="4rem" />
      </Esqueleto>
    );
  }
  if (vigentes.items.length === 0) {
    return (
      <EstadoVacio
        nivel={3}
        icono="vacio"
        titulo="Todavía no hay proyectos destacados"
        descripcion="Elegí uno de la lista de abajo para que aparezca primero."
      />
    );
  }
  return (
    <ul className={estilos.lista} aria-label="Proyectos destacados vigentes">
      {vigentes.items.map((proyecto) => (
        <FilaDeProyectoParaDestacar
          key={proyecto.id}
          proyecto={proyecto}
          destacado
          acciones={[
            {
              texto: "Cambiar fecha",
              nombreAccesible: `Cambiar fecha de ${proyecto.titulo}`,
              deshabilitado: procesando,
              accion: () => alElegir("cambiar", proyecto),
            },
            {
              texto: "Quitar",
              nombreAccesible: `Quitar ${proyecto.titulo} de los destacados`,
              variante: "peligroso",
              deshabilitado: procesando,
              accion: () => alElegir("quitar", proyecto),
            },
          ]}
        />
      ))}
    </ul>
  );
}

function Elegir({ busqueda, candidatos, completo, procesando, alElegir }) {
  const [texto, setTexto] = useState(busqueda.etiqueta);
  const refConteo = useRef(null);
  const enfocarAlCargar = useRef(false);
  const { resultado, error, cargando, reintentar } = candidatos;
  const clave = claveDeBusqueda(busqueda.etiqueta, busqueda.pagina);
  const desactualizado = !resultado || resultado.consulta !== clave;
  const fueraDeRango =
    resultado &&
    !cargando &&
    !desactualizado &&
    resultado.items.length === 0 &&
    resultado.totalPaginas >= 1 &&
    busqueda.pagina > resultado.totalPaginas;

  const { irAPagina } = busqueda;
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
    busqueda.buscar(texto);
  }

  function limpiar() {
    setTexto("");
    busqueda.buscar("");
  }

  function cambiarPagina(numero) {
    enfocarAlCargar.current = true;
    busqueda.irAPagina(numero);
  }

  return (
    <section className={estilos.seccion} aria-labelledby="titulo-elegir">
      <h2 id="titulo-elegir">Elegir un proyecto</h2>
      <p>Acá ves los proyectos abiertos de colectivos activos.</p>
      <form
        role="search"
        aria-label="Buscar proyectos para destacar"
        className={estilos.buscador}
        onSubmit={enviar}
      >
        <Campo
          etiqueta="Buscar por etiqueta"
          type="search"
          autoComplete="off"
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
        />
        <Boton type="submit">Buscar</Boton>
        {busqueda.etiqueta && <Boton onClick={limpiar}>Limpiar</Boton>}
      </form>
      {completo && (
        <p id={ID_MOTIVO_DE_CUPO} className={estilos.motivo}>
          {MOTIVO_CUPO_COMPLETO}
        </p>
      )}
      <ResultadosParaElegir
        busqueda={busqueda}
        resultado={resultado}
        error={error}
        cargando={cargando}
        desactualizado={desactualizado || fueraDeRango}
        reintentar={reintentar}
        completo={completo}
        procesando={procesando}
        alElegir={alElegir}
        alCambiarPagina={cambiarPagina}
        refConteo={refConteo}
        alLimpiar={limpiar}
      />
    </section>
  );
}

function ResultadosParaElegir({
  busqueda,
  resultado,
  error,
  cargando,
  desactualizado,
  reintentar,
  completo,
  procesando,
  alElegir,
  alCambiarPagina,
  refConteo,
  alLimpiar,
}) {
  if (error) {
    return (
      <EstadoDeError
        nivel={3}
        enfocar={false}
        titulo="No pudimos cargar los proyectos"
        error={error}
        alReintentar={reintentar}
      />
    );
  }
  if (desactualizado) {
    return (
      <Esqueleto etiqueta="Cargando proyectos…">
        <BloqueEsqueleto alto="4rem" />
        <BloqueEsqueleto alto="4rem" />
        <BloqueEsqueleto alto="4rem" />
      </Esqueleto>
    );
  }
  if (resultado.items.length === 0) {
    return busqueda.etiqueta ? (
      <EstadoVacio
        nivel={3}
        titulo={`No encontramos proyectos abiertos con la etiqueta «${busqueda.etiqueta}»`}
        descripcion="Probá con otra palabra o mirá todos los proyectos abiertos."
      >
        <Boton onClick={alLimpiar}>Limpiar búsqueda</Boton>
      </EstadoVacio>
    ) : (
      <EstadoVacio
        nivel={3}
        titulo="No hay proyectos abiertos para destacar"
        descripcion="Cuando un colectivo publique un proyecto, va a aparecer acá."
      />
    );
  }
  const { pagina, porPagina, total, totalPaginas } = resultado;
  const desde = (pagina - 1) * porPagina + 1;
  const hasta = desde + resultado.items.length - 1;
  return (
    <div aria-busy={cargando}>
      <p ref={refConteo} tabIndex={-1} className={estilos.conteo}>
        {totalPaginas > 1
          ? `Mostrando ${desde}–${hasta} de ${total} proyectos abiertos`
          : total === 1
            ? "1 proyecto abierto"
            : `${total} proyectos abiertos`}
      </p>
      <ul className={estilos.lista} aria-label="Proyectos abiertos">
        {resultado.items.map((proyecto) => (
          <FilaDeProyectoParaDestacar
            key={proyecto.id}
            proyecto={proyecto}
            destacado={proyecto.destacado === true}
            acciones={
              proyecto.destacado === true
                ? []
                : [
                    {
                      texto: "Destacar",
                      nombreAccesible: `Destacar ${proyecto.titulo}`,
                      deshabilitado: completo || procesando,
                      descripcion: completo ? ID_MOTIVO_DE_CUPO : undefined,
                      accion: () => alElegir("destacar", proyecto),
                    },
                  ]
            }
          />
        ))}
      </ul>
      <Paginacion
        etiqueta="Paginación de proyectos"
        pagina={pagina}
        totalPaginas={totalPaginas}
        alCambiar={alCambiarPagina}
      />
    </div>
  );
}
