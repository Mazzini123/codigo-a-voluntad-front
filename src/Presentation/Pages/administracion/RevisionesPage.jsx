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
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import {
  esDePublicacion,
  ESTADOS_DE_REVISION,
  LARGO_MAXIMO_DE_NOTA,
  mensajeDeRevision,
  MOTIVOS_DE_REVISION,
} from "@/Presentation/Formatos/revision.js";
import { useParametrosDeRevisiones } from "@/Presentation/Hooks/administracion/useParametrosDeRevisiones.js";
import {
  claveDeRevisiones,
  useRevisiones,
} from "@/Presentation/Hooks/administracion/useRevisiones.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { useEnfocarPrimerError } from "@/Presentation/Hooks/comunes/useEnfocarPrimerError.js";
import { errorDeNota } from "@/Presentation/Formularios/revision/validarResolucion.js";
import estilos from "./RevisionesPage.module.css";

const NOTA_OPCIONAL = "Nota (opcional)";

const DIALOGOS_DE_SEGUIMIENTO = Object.freeze({
  [ESTADO_REVISION.REVISADA]: {
    titulo: (revision) => `Marcar como revisada «${revision.proyecto.titulo}»`,
    descripcion: "Queda registrado que la miraste. No se avisa al colectivo.",
    confirmar: "Marcar como revisada",
    etiquetaDeNota: NOTA_OPCIONAL,
    resultado: () => "Marcaste la revisión como revisada.",
  },
  [ESTADO_REVISION.DESCARTADA]: {
    titulo: (revision) => `Descartar la revisión de «${revision.proyecto.titulo}»`,
    descripcion: "Sale de pendientes sin que haga falta hacer nada con el proyecto.",
    confirmar: "Descartar",
    etiquetaDeNota: NOTA_OPCIONAL,
    resultado: () => "Descartaste la revisión.",
  },
});

const DIALOGOS_DE_PUBLICACION = Object.freeze({
  [ESTADO_REVISION.REVISADA]: {
    titulo: (revision) => `Aprobar la publicación de «${revision.proyecto.titulo}»`,
    descripcion:
      "El proyecto queda publicado: aparece en las búsquedas y se avisa a las colaboradoras compatibles.",
    confirmar: "Aprobar",
    etiquetaDeNota: NOTA_OPCIONAL,
    resultado: (revision) => `Aprobaste la publicación de «${revision.proyecto.titulo}».`,
  },
  [ESTADO_REVISION.DESCARTADA]: {
    titulo: (revision) => `Pedir cambios en «${revision.proyecto.titulo}»`,
    descripcion:
      "Vuelve a ser un borrador. Tu nota es lo único que el colectivo ve para saber qué cambiar antes de pedirla otra vez.",
    confirmar: "Pedir cambios",
    etiquetaDeNota: "Qué tiene que cambiar el colectivo",
    notaObligatoria: true,
    ejemplo: "Por ejemplo: «Contá quién coordina el proyecto y cuándo empieza».",
    resultado: () => "Pediste cambios. El colectivo ve tu nota.",
  },
});

function ayudaDeNota(dialogo, nota) {
  const contador = `${nota.length} de ${LARGO_MAXIMO_DE_NOTA} caracteres`;
  return dialogo?.ejemplo ? `${dialogo.ejemplo} ${contador}.` : contador;
}

function dialogoPara(confirmacion) {
  if (!confirmacion) return null;
  const dialogos = esDePublicacion(confirmacion.revision.motivo)
    ? DIALOGOS_DE_PUBLICACION
    : DIALOGOS_DE_SEGUIMIENTO;
  return dialogos[confirmacion.estado];
}

const TITULO_VACIO = Object.freeze({
  [ESTADO_REVISION.PENDIENTE]: "No hay proyectos para revisar",
  [ESTADO_REVISION.REVISADA]: "No hay revisiones revisadas",
  [ESTADO_REVISION.DESCARTADA]: "No hay revisiones descartadas",
});

const DESCRIPCION_VACIA = Object.freeze({
  [ESTADO_REVISION.PENDIENTE]:
    "Aparecen acá los proyectos abiertos que pasan mucho tiempo sin novedades y los borradores que piden publicarse.",
  [ESTADO_REVISION.REVISADA]: "Las que marques como revisadas o apruebes se guardan acá.",
  [ESTADO_REVISION.DESCARTADA]:
    "Las que descartes o en las que pidas cambios se guardan acá.",
});

const TITULO_VACIO_DE_PUBLICACION = Object.freeze({
  [ESTADO_REVISION.PENDIENTE]: "No hay pedidos de publicación pendientes",
  [ESTADO_REVISION.REVISADA]: "No hay publicaciones aprobadas",
  [ESTADO_REVISION.DESCARTADA]: "No hay publicaciones con cambios pedidos",
});

function tituloVacio(estado, motivo) {
  if (esDePublicacion(motivo)) return TITULO_VACIO_DE_PUBLICACION[estado];
  if (motivo) return "No hay revisiones con ese motivo";
  return TITULO_VACIO[estado];
}

const NOMBRE_DE_LISTA = Object.freeze({
  [ESTADO_REVISION.PENDIENTE]: "Revisiones pendientes",
  [ESTADO_REVISION.REVISADA]: "Revisiones revisadas",
  [ESTADO_REVISION.DESCARTADA]: "Revisiones descartadas",
});

export default function RevisionesPage() {
  const { usuario } = useAuth();
  const parametros = useParametrosDeRevisiones();
  const datos = useRevisiones({
    estado: parametros.estado,
    pagina: parametros.pagina,
    motivo: parametros.motivo,
  });
  const avisar = useAvisos();
  const [confirmacion, setConfirmacion] = useState(null);
  const [nota, setNota] = useState("");
  const [intento, setIntento] = useState(0);
  const refNota = useRef(null);
  const refTitulo = useRef(null);
  const refConfirmado = useRef(false);
  const focoAlCerrar = useCallback(
    () => (refConfirmado.current ? refTitulo.current : null),
    [],
  );
  const dialogo = dialogoPara(confirmacion);
  const puedeResolver = tienePermiso(usuario, PERMISO.REVISION_RESOLVER);
  const reglaDeNota = { obligatoria: Boolean(dialogo?.notaObligatoria) };
  const errorDeLaNota = intento ? errorDeNota(nota, reglaDeNota) : null;

  useEnfocarPrimerError(refNota, intento);

  function elegir(estado, revision) {
    refConfirmado.current = false;
    setNota("");
    setIntento(0);
    setConfirmacion({ estado, revision });
  }

  async function confirmar() {
    if (errorDeNota(nota, reglaDeNota)) {
      setIntento((anterior) => anterior + 1);
      return;
    }
    const { estado, revision } = confirmacion;
    const resultado = await datos.resolver(revision.id, { estado, nota });
    if (!resultado) return;
    refConfirmado.current = true;
    setConfirmacion(null);
    if (!resultado.ok) {
      avisar.error(mensajeDeRevision(resultado.error, revision.motivo));
      return;
    }
    avisar.exito(dialogo.resultado(revision));
  }

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-revisiones">
      <TituloDePagina>Revisiones de proyectos</TituloDePagina>
      <header className={estilos.encabezado}>
        <h1 id="titulo-revisiones" ref={refTitulo} tabIndex={-1}>
          Revisiones de proyectos
        </h1>
        <p>
          Borradores que piden publicarse y proyectos abiertos que llevan tiempo sin
          novedades. Una publicación se aprueba o se le piden cambios con una nota para el
          colectivo; en las demás dejás registrado que las miraste.
        </p>
      </header>
      <div className={estilos.filtro}>
        <Selector
          etiqueta="Motivo"
          opciones={MOTIVOS_DE_REVISION}
          value={parametros.motivo}
          onChange={(evento) => parametros.cambiarMotivo(evento.target.value)}
        />
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
        <div ref={refNota}>
          <Campo
            etiqueta={dialogo?.etiquetaDeNota ?? NOTA_OPCIONAL}
            obligatorio={reglaDeNota.obligatoria}
            multilinea
            rows={3}
            maxLength={LARGO_MAXIMO_DE_NOTA}
            value={nota}
            ayuda={ayudaDeNota(dialogo, nota)}
            error={errorDeLaNota}
            onChange={(evento) => setNota(evento.target.value)}
          />
        </div>
      </DialogoDeConfirmacion>
    </section>
  );
}

function Listado({ parametros, datos, usuarioId, puedeResolver, alElegir }) {
  const { estado, motivo, pagina, irAPagina, cambiarMotivo } = parametros;
  const { resultado, error, cargando, reintentar, procesando } = datos;
  const refConteo = useRef(null);
  const enfocarAlCargar = useRef(false);
  const desactualizado =
    !resultado || resultado.consulta !== claveDeRevisiones(estado, pagina, motivo);
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
        titulo={tituloVacio(estado, motivo)}
        descripcion={DESCRIPCION_VACIA[estado]}
      >
        {motivo && <Boton onClick={() => cambiarMotivo("")}>Ver todos los motivos</Boton>}
      </EstadoVacio>
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
