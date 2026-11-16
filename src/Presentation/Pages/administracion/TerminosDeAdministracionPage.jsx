import { useCallback, useEffect, useRef, useState } from "react";
import { DialogoDeConfirmacion } from "@/Presentation/Components/App/dialogos/DialogoDeConfirmacion.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { EstadoVacio } from "@/Presentation/Components/App/estados/EstadoVacio.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { TextoConFormato } from "@/Presentation/Components/App/texto/TextoConFormato.jsx";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { Campo } from "@/Presentation/Components/App/ui/Campo.jsx";
import {
  errorDeTerminosSinCambios,
  errorDeTextoDeTerminos,
  LARGO_MAXIMO_DE_TERMINOS,
  mensajeDePublicarTerminos,
  textoDeVersion,
  versionSiguiente,
} from "@/Presentation/Formatos/terminos.js";
import { useTerminosDeAdministracion } from "@/Presentation/Hooks/administracion/useTerminosDeAdministracion.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import estilos from "./TerminosDeAdministracionPage.module.css";

function ayudaDelTexto(texto) {
  return `Admite Markdown: títulos, listas, negritas y enlaces. ${texto.length.toLocaleString("es-AR")} de ${LARGO_MAXIMO_DE_TERMINOS.toLocaleString("es-AR")} caracteres.`;
}

export default function TerminosDeAdministracionPage() {
  const { vigentes, publicar, publicando } = useTerminosDeAdministracion();
  const avisar = useAvisos();
  const [texto, setTexto] = useState(null);
  const [error, setError] = useState(null);
  const [confirmando, setConfirmando] = useState(false);
  const refTitulo = useRef(null);
  const refEditar = useRef(null);
  const refCampo = useRef(null);
  const refPublicado = useRef(false);
  const refVolverAEditar = useRef(false);
  const focoAlCerrar = useCallback(
    () => (refPublicado.current ? refTitulo.current : null),
    [],
  );
  const editando = texto !== null;
  const { terminos } = vigentes;
  const siguiente = versionSiguiente(terminos);

  useEffect(() => {
    if (editando) refCampo.current?.focus();
    else if (refVolverAEditar.current) refEditar.current?.focus();
    refVolverAEditar.current = false;
  }, [editando]);

  function abrirEditor() {
    setError(null);
    setTexto(terminos?.texto ?? "");
  }

  function descartar() {
    setTexto(null);
    setError(null);
    refVolverAEditar.current = true;
  }

  function pedirConfirmacion() {
    const problema =
      errorDeTextoDeTerminos(texto) ?? errorDeTerminosSinCambios(texto, terminos);
    if (problema) {
      setError(problema);
      refCampo.current?.focus();
      return;
    }
    refPublicado.current = false;
    setConfirmando(true);
  }

  async function confirmar() {
    const resultado = await publicar(texto);
    if (!resultado) return;
    refPublicado.current = resultado.ok;
    setConfirmando(false);
    if (!resultado.ok) {
      avisar.error(mensajeDePublicarTerminos(resultado.error));
      return;
    }
    setTexto(null);
    avisar.exito(`Publicaste la versión ${resultado.datos.version} de los términos.`);
  }

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-terminos-admin">
      <TituloDePagina>Términos y condiciones</TituloDePagina>
      <header className={estilos.encabezado}>
        <h1 id="titulo-terminos-admin" ref={refTitulo} tabIndex={-1}>
          Términos y condiciones
        </h1>
        <p>
          Las reglas que cada colectivo acepta al crear un proyecto. Cada publicación es
          una versión nueva y las anteriores se conservan.
        </p>
      </header>
      <Vigente
        vigentes={vigentes}
        editando={editando}
        refEditar={refEditar}
        alEditar={abrirEditor}
      />
      {editando && (
        <section className={estilos.seccion} aria-labelledby="titulo-nueva-version">
          <h2 id="titulo-nueva-version">Nueva versión</h2>
          <Campo
            ref={refCampo}
            etiqueta="Texto de los términos"
            obligatorio
            multilinea
            rows={16}
            maxLength={LARGO_MAXIMO_DE_TERMINOS}
            value={texto}
            error={error}
            ayuda={ayudaDelTexto(texto)}
            onChange={(evento) => {
              setTexto(evento.target.value);
              setError(null);
            }}
          />
          <div className={estilos.acciones}>
            <Boton disabled={publicando} onClick={descartar}>
              Descartar cambios
            </Boton>
            <Boton variante="primario" disabled={publicando} onClick={pedirConfirmacion}>
              {`Publicar versión ${siguiente}`}
            </Boton>
          </div>
        </section>
      )}
      <DialogoDeConfirmacion
        abierto={confirmando}
        titulo={`¿Publicar la versión ${siguiente} de los términos?`}
        descripcion="Los proyectos que se creen desde ahora van a tener que aceptarla. Los que ya existen conservan la versión que aceptaron."
        textoConfirmar={`Publicar versión ${siguiente}`}
        textoEnviando="Publicando…"
        peligroso={false}
        enviando={publicando}
        destinoDeFoco={focoAlCerrar}
        alConfirmar={confirmar}
        alCancelar={() => setConfirmando(false)}
      />
    </section>
  );
}

function Vigente({ vigentes, editando, refEditar, alEditar }) {
  return (
    <section className={estilos.seccion} aria-labelledby="titulo-vigente">
      <h2 id="titulo-vigente">Versión vigente</h2>
      <ContenidoVigente
        vigentes={vigentes}
        editando={editando}
        refEditar={refEditar}
        alEditar={alEditar}
      />
    </section>
  );
}

function ContenidoVigente({ vigentes, editando, refEditar, alEditar }) {
  const { terminos, cargando, error, recargar } = vigentes;
  if (error && !terminos) {
    return (
      <EstadoDeError
        nivel={3}
        titulo="No pudimos cargar los términos"
        error={error}
        alReintentar={recargar}
      />
    );
  }
  if (cargando && !terminos) {
    return (
      <Esqueleto etiqueta="Cargando los términos…">
        <BloqueEsqueleto ancho="40%" />
        <BloqueEsqueleto alto="8rem" />
      </Esqueleto>
    );
  }
  if (!terminos) {
    return (
      <EstadoVacio
        nivel={3}
        titulo="Todavía no hay términos publicados"
        descripcion="Mientras no haya una versión publicada, los colectivos crean proyectos sin aceptar nada."
      >
        {!editando && (
          <Boton ref={refEditar} variante="primario" onClick={alEditar}>
            Escribir los términos
          </Boton>
        )}
      </EstadoVacio>
    );
  }
  return (
    <div className={estilos.vigente}>
      <div className={estilos.cabecera}>
        <p className={estilos.version}>{textoDeVersion(terminos)}</p>
        {!editando && (
          <Boton ref={refEditar} onClick={alEditar}>
            Editar los términos
          </Boton>
        )}
      </div>
      <TextoConFormato texto={terminos.texto} nivel={3} />
    </div>
  );
}
