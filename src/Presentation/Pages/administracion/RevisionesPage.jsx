import { useCallback, useEffect, useRef, useState } from "react";
import { ESTADO_REVISION } from "@/Application/Domain/Enums/ESTADO_REVISION.js";
import { PERMISO } from "@/Application/Domain/Enums/PERMISO.js";
import { tienePermiso } from "@/Application/Domain/Reglas/permisos.js";
import { FilaDeRevision } from "@/Presentation/Components/Administracion/FilaDeRevision.jsx";
import { DialogoDeConfirmacion } from "@/Presentation/Components/App/dialogos/DialogoDeConfirmacion.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { EstadoVacio } from "@/Presentation/Components/App/estados/EstadoVacio.jsx";
import { Paginacion } from "@/Presentation/Components/App/navegacion/Paginacion.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { Campo } from "@/Presentation/Components/App/ui/Campo.jsx";
import { Selector } from "@/Presentation/Components/App/ui/Selector.jsx";
import {
  ESTADOS_DE_REVISION,
  LARGO_MAXIMO_DE_NOTA,
  mensajeDeRevision,
} from "@/Presentation/Formatos/revision.js";
import { useParametrosDeRevisiones } from "@/Presentation/Hooks/administracion/useParametrosDeRevisiones.js";
import {
  claveDeRevisiones,
  useRevisiones,
} from "@/Presentation/Hooks/administracion/useRevisiones.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import estilos from "./RevisionesPage.module.css";

const DIALOGOS = Object.freeze({
  [ESTADO_REVISION.REVISADA]: {
    titulo: (revision) => `Marcar como revisada «${revision.proyecto.titulo}»`,
    descripcion: "Queda registrado que la miraste. No se avisa al colectivo.",
    confirmar: "Marcar como revisada",
    resultado: "Marcaste la revisión como revisada.",
  },
  [ESTADO_REVISION.DESCARTADA]: {
    titulo: (revision) => `Descartar la revisión de «${revision.proyecto.titulo}»`,
    descripcion: "Sale de pendientes sin que haga falta hacer nada con el proyecto.",
    confirmar: "Descartar",
    resultado: "Descartaste la revisión.",
  },
});

const TITULO_VACIO = Object.freeze({
  [ESTADO_REVISION.PENDIENTE]: "No hay proyectos para revisar",
  [ESTADO_REVISION.REVISADA]: "No hay revisiones revisadas",
  [ESTADO_REVISION.DESCARTADA]: "No hay revisiones descartadas",
});

const DESCRIPCION_VACIA = Object.freeze({
  [ESTADO_REVISION.PENDIENTE]:
    "Cuando un proyecto abierto pase mucho tiempo sin novedades, aparece acá.",
  [ESTADO_REVISION.REVISADA]: "Las que marques como revisadas se guardan acá.",
  [ESTADO_REVISION.DESCARTADA]: "Las que descartes se guardan acá.",
});

const NOMBRE_DE_LISTA = Object.freeze({
  [ESTADO_REVISION.PENDIENTE]: "Revisiones pendientes",
  [ESTADO_REVISION.REVISADA]: "Revisiones revisadas",
  [ESTADO_REVISION.DESCARTADA]: "Revisiones descartadas",
});

export default function RevisionesPage() {
  const { usuario } = useAuth();
  const parametros = useParametrosDeRevisiones();
  const datos = useRevisiones({ estado: parametros.estado, pagina: parametros.pagina });
  const avisar = useAvisos();
  const [confirmacion, setConfirmacion] = useState(null);
  const [nota, setNota] = useState("");
  const refTitulo = useRef(null);
  const refConfirmado = useRef(false);
  const focoAlCerrar = useCallback(
    () => (refConfirmado.current ? refTitulo.current : null),
    [],
  );
  const dialogo = confirmacion && DIALOGOS[confirmacion.estado];
  const puedeResolver = tienePermiso(usuario, PERMISO.REVISION_RESOLVER);

  function elegir(estado, revision) {
    refConfirmado.current = false;
    setNota("");
    setConfirmacion({ estado, revision });
  }

  async function confirmar() {
    const { estado, revision } = confirmacion;
    const resultado = await datos.resolver(revision.id, { estado, nota });
    if (!resultado) return;
    refConfirmado.current = true;
    setConfirmacion(null);
    if (!resultado.ok) {
      avisar.error(mensajeDeRevision(resultado.error));
      return;
    }
    avisar.exito(dialogo.resultado);
  }

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-revisiones">
      <TituloDePagina>Revisiones de proyectos</TituloDePagina>
      <header className={estilos.encabezado}>
        <h1 id="titulo-revisiones" ref={refTitulo} tabIndex={-1}>
          Revisiones de proyectos
        </h1>
        <p>
          Proyectos abiertos que llevan tiempo sin novedades. La plataforma no avisa al
          colectivo: acá dejás registrado que los miraste.
        </p>
      </header>
      <div className={estilos.filtro}>
        <Selector
          etiqueta="Estado"
          opciones={ESTADOS_DE_REVISION}
          value={parametros.estado}
          onChange={(evento) => parametros.cambiarEstado(evento.target.value)}
        />
      </div>
      <Listado
        parametros={parametros}
        datos={datos}
        usuarioId={usuario.usuarioId}
        puedeResolver={puedeResolver}
        alElegir={elegir}
      />
      <DialogoDeConfirmacion
        abierto={Boolean(dialogo)}
        titulo={dialogo?.titulo(confirmacion.revision)}
        descripcion={dialogo?.descripcion}
        textoConfirmar={dialogo?.confirmar}
        textoEnviando="Guardando…"
        permanente={false}
        enviando={datos.procesando}
        destinoDeFoco={focoAlCerrar}
        alConfirmar={confirmar}
        alCancelar={() => setConfirmacion(null)}
      >
        <Campo
          etiqueta="Nota (opcional)"
          multilinea
          rows={3}
          maxLength={LARGO_MAXIMO_DE_NOTA}
          value={nota}
          ayuda={`${nota.length} de ${LARGO_MAXIMO_DE_NOTA} caracteres`}
          onChange={(evento) => setNota(evento.target.value)}
        />
      </DialogoDeConfirmacion>
    </section>
  );
}

function Listado({ parametros, datos, usuarioId, puedeResolver, alElegir }) {
  const { estado, pagina, irAPagina } = parametros;
  const { resultado, error, cargando, reintentar, procesando } = datos;
  const refConteo = useRef(null);
  const enfocarAlCargar = useRef(false);
  const desactualizado =
    !resultado || resultado.consulta !== claveDeRevisiones(estado, pagina);
  const fueraDeRango =
    !desactualizado &&
    !cargando &&
    resultado.items.length === 0 &&
    resultado.totalPaginas >= 1 &&
    pagina > resultado.totalPaginas;

  useEffect(() => {
    if (fueraDeRango) irAPagina(resultado.totalPaginas, { reemplazar: true });
  }, [fueraDeRango, irAPagina, resultado]);

  useEffect(() => {
    if (enfocarAlCargar.current && !desactualizado && !fueraDeRango) {
      enfocarAlCargar.current = false;
      refConteo.current?.focus();
    }
  });

  if (error) {
    return (
      <EstadoDeError
        titulo="No pudimos cargar las revisiones"
        error={error}
        alReintentar={reintentar}
      />
    );
  }
  if (desactualizado || fueraDeRango) {
    return (
      <Esqueleto etiqueta="Cargando revisiones…">
        <BloqueEsqueleto alto="6rem" />
        <BloqueEsqueleto alto="6rem" />
      </Esqueleto>
    );
  }
  if (resultado.items.length === 0) {
    return (
      <EstadoVacio
        titulo={TITULO_VACIO[estado]}
        descripcion={DESCRIPCION_VACIA[estado]}
      />
    );
  }
  const desde = (resultado.pagina - 1) * resultado.porPagina + 1;
  const hasta = desde + resultado.items.length - 1;
  return (
    <div aria-busy={cargando}>
      <p ref={refConteo} tabIndex={-1} className={estilos.conteo}>
        {resultado.totalPaginas > 1
          ? `Mostrando ${desde}–${hasta} de ${resultado.total} revisiones`
          : resultado.total === 1
            ? "1 revisión"
            : `${resultado.total} revisiones`}
      </p>
      <ul className={estilos.lista} aria-label={NOMBRE_DE_LISTA[estado]}>
        {resultado.items.map((revision) => (
          <FilaDeRevision
            key={revision.id}
            revision={revision}
            usuarioId={usuarioId}
            puedeResolver={puedeResolver}
            deshabilitado={procesando}
            alElegir={alElegir}
          />
        ))}
      </ul>
      <Paginacion
        etiqueta="Paginación de revisiones"
        pagina={resultado.pagina}
        totalPaginas={resultado.totalPaginas}
        alCambiar={(numero) => {
          enfocarAlCargar.current = true;
          irAPagina(numero);
        }}
      />
    </div>
  );
}
