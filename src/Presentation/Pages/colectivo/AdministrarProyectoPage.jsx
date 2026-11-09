import { useEffect, useId, useReducer, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { BuscarColaboradoras } from "@/Presentation/Components/Reclutamiento/BuscarColaboradoras.jsx";
import { DialogoDeConfirmacion } from "@/Presentation/Components/App/dialogos/DialogoDeConfirmacion.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { PerfilForm } from "@/Presentation/Components/Proyecto/alta/PerfilForm.jsx";
import { PasoDelProyecto } from "@/Presentation/Components/Proyecto/alta/PasoDelProyecto.jsx";
import { SelloDeBusqueda } from "@/Presentation/Components/Proyecto/SelloDeBusqueda.jsx";
import {
  administracionDelProyecto,
  cambiosDelPerfil,
  cambiosDelProyecto,
  crearEstadoDeAdministracion,
  datosEditablesDelPerfil,
  datosEditablesDelProyecto,
} from "@/Presentation/Formularios/proyecto/edicionProyecto.js";
import { perfilVacio } from "@/Presentation/Formularios/proyecto/formularioProyecto.js";
import { validarPerfil } from "@/Presentation/Formularios/proyecto/validarProyecto.js";
import { estadoDeBusqueda } from "@/Presentation/Formatos/proyecto.js";
import { useAdministrarProyecto } from "@/Presentation/Hooks/proyecto/useAdministrarProyecto.js";
import { useAvisoCambiosSinGuardar } from "@/Presentation/Hooks/comunes/useAvisoCambiosSinGuardar.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useCatalogoDeHabilidades } from "@/Presentation/Hooks/habilidad/useCatalogoDeHabilidades.js";
import { useEnfocarPrimerError } from "@/Presentation/Hooks/comunes/useEnfocarPrimerError.js";
import { useProyecto } from "@/Presentation/Hooks/proyecto/useProyecto.js";
import { rutaPostulacionesRecibidas, rutaProyecto } from "@/Presentation/Routes/rutas.js";
import estilos from "./AdministrarProyectoPage.module.css";
import { PROYECTO_ESTADO } from "@/Application/Domain/Enums/PROYECTO_ESTADO.js";
import { busquedaVencida } from "@/Application/Domain/Reglas/busquedaDePerfil.js";
import { TextoConFormato } from "@/Presentation/Components/App/texto/TextoConFormato.jsx";

const CONFIRMACIONES = Object.freeze({
  finalizar: {
    titulo: "¿Finalizar el proyecto?",
    descripcion:
      "Se rechazan las postulaciones pendientes, se finalizan las colaboraciones aceptadas y el proyecto deja de recibir postulaciones.",
    textoConfirmar: "Finalizar proyecto",
  },
  aceptacion: {
    titulo: "¿Guardar el modo de aceptación y el cupo?",
    descripcion:
      "Este cambio puede aceptar o rechazar automáticamente postulaciones pendientes.",
    textoConfirmar: "Guardar cambios",
    permanente: false,
  },
  descartar: {
    titulo: "¿Descartar los cambios sin guardar?",
    descripcion: "Se conservan los cambios que ya se guardaron.",
    textoConfirmar: "Descartar cambios",
  },
});

export default function AdministrarProyectoPage() {
  const { id } = useParams();
  return <ProyectoDelDueno key={id} id={id} />;
}

function Cargando({ etiqueta }) {
  return (
    <Esqueleto etiqueta={etiqueta}>
      <BloqueEsqueleto alto="2rem" />
      <BloqueEsqueleto />
      <BloqueEsqueleto />
    </Esqueleto>
  );
}

function ProyectoDelDueno({ id }) {
  const { proyecto, error, recargar } = useProyecto(id);
  if (!proyecto && error) {
    return (
      <EstadoDeError
        nivel={1}
        titulo="No pudimos cargar el proyecto"
        error={error}
        alReintentar={recargar}
      />
    );
  }
  if (!proyecto) return <Cargando etiqueta="Cargando proyecto…" />;
  return <Administracion proyecto={proyecto} recargar={recargar} errorDeCarga={error} />;
}

function Administracion({ proyecto, recargar, errorDeCarga }) {
  const navigate = useNavigate();
  const avisar = useAvisos();
  const idBase = useId();
  const refTitulo = useRef(null);
  const refTituloEditor = useRef(null);
  const acciones = useAdministrarProyecto(proyecto.id, recargar);
  const [{ edicion, confirmacion }, despachar] = useReducer(
    administracionDelProyecto,
    undefined,
    crearEstadoDeAdministracion,
  );
  const detalle = rutaProyecto(proyecto.id);
  const finalizado = proyecto.estado === PROYECTO_ESTADO.FINALIZADO;
  const hayCambios =
    edicion && JSON.stringify(edicion.original) !== JSON.stringify(edicion.borrador);
  const salida = useAvisoCambiosSinGuardar(Boolean(hayCambios));
  const editandoProyecto = edicion?.tipo === "proyecto";
  const conflictoDePerfil = edicion?.perfilId && acciones.error?.status === 409;

  useEffect(() => {
    if (editandoProyecto) refTituloEditor.current?.focus();
  }, [editandoProyecto]);

  function abrir(tipo, original, perfilId) {
    acciones.limpiar();
    despachar({ tipo: "abrir", queSeEdita: tipo, original, perfilId });
  }

  function cerrarEditor() {
    acciones.limpiar();
    despachar({ tipo: "cerrar" });
    refTitulo.current?.focus();
  }

  function cambiar(campos) {
    despachar({ tipo: "cambiar", campos });
  }

  async function guardar(operacion, mensaje, cerrar = true) {
    const guardado = await acciones.ejecutar(operacion);
    if (!guardado) return;
    avisar.exito(mensaje);
    if (cerrar) cerrarEditor();
  }

  function guardarProyecto() {
    const cambios = cambiosDelProyecto(edicion.original, edicion.borrador);
    if (!Object.keys(cambios).length) return cerrarEditor();
    return guardar(
      () => acciones.actualizar(cambios),
      "Se guardaron los datos del proyecto.",
    );
  }

  function guardarPerfil() {
    const { perfilId, original, borrador } = edicion;
    if (!perfilId)
      return guardar(() => acciones.crearPerfil(borrador), "Se agregó el perfil.");
    const cambios = cambiosDelPerfil(original, borrador);
    if ("modoAceptacion" in cambios || "limiteColaboraciones" in cambios) {
      pedirConfirmacion("aceptacion");
      return;
    }
    return guardarEdicionDelPerfil();
  }

  function guardarEdicionDelPerfil() {
    const { perfilId, original, borrador } = edicion;
    cancelarConfirmacion();
    const cambios = cambiosDelPerfil(original, borrador);
    if (!Object.keys(cambios).length) return cerrarEditor();
    return guardar(
      () =>
        acciones.actualizarPerfil(perfilId, {
          ...cambios,
          versionEdicion: original.versionEdicion,
        }),
      "Se guardaron los cambios del perfil.",
    );
  }

  async function finalizar() {
    cancelarConfirmacion();
    if (await acciones.ejecutar(acciones.finalizar)) {
      avisar.exito("El proyecto se finalizó.");
      navigate(detalle, { replace: true });
    }
  }

  function pedirConfirmacion(cual) {
    despachar({ tipo: "pedirConfirmacion", cual });
  }

  function cancelarConfirmacion() {
    despachar({ tipo: "cancelarConfirmacion" });
  }

  const alConfirmar = {
    finalizar,
    aceptacion: guardarEdicionDelPerfil,
    descartar: cerrarEditor,
  };

  function pedirDescartar() {
    if (hayCambios) pedirConfirmacion("descartar");
    else cerrarEditor();
  }

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-administracion">
      <TituloDePagina>Administrar proyecto</TituloDePagina>
      {acciones.guardando ? (
        <span className={estilos.volver}>Volver al proyecto</span>
      ) : (
        <Link to={detalle} className={estilos.volver}>
          Volver al proyecto
        </Link>
      )}
      <div>
        <h1 id="titulo-administracion" ref={refTitulo} tabIndex={-1}>
          Administrar proyecto
        </h1>
        <p>{proyecto.titulo}</p>
      </div>
      {!acciones.guardando && (
        <Link to={rutaPostulacionesRecibidas(proyecto.id)} className={estilos.volver}>
          Ver postulaciones
        </Link>
      )}
      {finalizado && (
        <p>Este proyecto está finalizado. Podés consultar sus datos y perfiles.</p>
      )}
      {errorDeCarga && (
        <EstadoDeError
          titulo="No pudimos actualizar la información del proyecto"
          error={errorDeCarga}
          alReintentar={recargar}
        />
      )}
      {acciones.error && (
        <EstadoDeError
          titulo={
            conflictoDePerfil
              ? "El perfil cambió durante la edición"
              : "No pudimos completar la acción"
          }
          error={
            conflictoDePerfil
              ? {
                  mensaje:
                    "Tu borrador sigue abierto. Para editar desde la versión actual, cancelá esta edición y volvé a abrir el perfil.",
                }
              : acciones.error
          }
        />
      )}
      {acciones.guardando && <p role="status">Guardando cambios…</p>}
      {!finalizado && edicion?.tipo === "proyecto" && (
        <div className={estilos.seccion}>
          <PasoDelProyecto
            idBase={idBase}
            refTitulo={refTituloEditor}
            proyecto={edicion.borrador}
            alCambiar={cambiar}
            alSiguiente={guardarProyecto}
            fechaOriginal={edicion.original.fechaCierre}
            enviando={acciones.guardando}
            textoAccion="Guardar cambios"
          />
          <Boton onClick={pedirDescartar} disabled={acciones.guardando}>
            Cancelar edición
          </Boton>
        </div>
      )}
      {!finalizado && edicion?.tipo === "perfil" && (
        <EditorDePerfil
          idBase={idBase}
          edicion={edicion}
          alCambiar={cambiar}
          alGuardar={guardarPerfil}
          alDescartar={pedirDescartar}
          enviando={acciones.guardando}
        />
      )}
      {!edicion && (
        <div className={estilos.seccion}>
          <h2>Datos del proyecto</h2>
          <TextoConFormato texto={proyecto.descripcion} nivel={3} />
          {proyecto.etiquetas?.length > 0 && (
            <p>Etiquetas: {proyecto.etiquetas.join(", ")}</p>
          )}
          {proyecto.fechaCierre && (
            <p>
              Fecha de cierre:{" "}
              {datosEditablesDelProyecto(proyecto)
                .fechaCierre.split("-")
                .reverse()
                .join("/")}
            </p>
          )}
          {!finalizado && (
            <div className={estilos.acciones}>
              <Boton
                disabled={acciones.guardando}
                onClick={() => abrir("proyecto", datosEditablesDelProyecto(proyecto))}
              >
                Editar proyecto
              </Boton>
            </div>
          )}
        </div>
      )}
      <div className={estilos.seccion}>
        <h2>Perfiles</h2>
        <ul className={estilos.lista}>
          {(proyecto.perfiles ?? []).map((perfil, indice) => (
            <li className={estilos.perfil} key={perfil.id}>
              <h3>Perfil {indice + 1}</h3>
              <div>
                <SelloDeBusqueda estado={estadoDeBusqueda(perfil, proyecto)} />
              </div>
              <p>{perfil.descripcion}</p>
              {!finalizado && !edicion && (
                <div className={estilos.acciones}>
                  <Boton
                    disabled={acciones.guardando}
                    onClick={() =>
                      abrir("perfil", datosEditablesDelPerfil(perfil), perfil.id)
                    }
                  >
                    Editar perfil
                  </Boton>
                  <AccionDeBusqueda
                    perfil={perfil}
                    guardando={acciones.guardando}
                    alCambiar={() => {
                      acciones.limpiar();
                      return guardar(
                        () =>
                          acciones.actualizarPerfil(perfil.id, {
                            busquedaAbierta: !perfil.busquedaAbierta,
                          }),
                        perfil.busquedaAbierta
                          ? "Se cerró la búsqueda."
                          : "Se reabrió la búsqueda.",
                        false,
                      );
                    }}
                  />
                  <BuscarColaboradoras
                    perfil={perfil}
                    proyecto={proyecto}
                    disabled={acciones.guardando}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
        {!finalizado && !edicion && (
          <>
            <div className={estilos.acciones}>
              <Boton
                disabled={acciones.guardando}
                onClick={() => abrir("perfil", perfilVacio())}
              >
                Agregar perfil
              </Boton>
            </div>
            <p className={estilos.ayuda}>
              La eliminación de perfiles todavía no está disponible. Si ya no necesitás un
              perfil, podés cerrar su búsqueda.
            </p>
          </>
        )}
      </div>
      {!finalizado && !edicion && (
        <div className={estilos.seccion}>
          <h2>Cierre del proyecto</h2>
          <p>Finalizalo cuando haya terminado el trabajo.</p>
          <div className={estilos.acciones}>
            <Boton
              variante="peligroso"
              disabled={acciones.guardando}
              onClick={() => {
                acciones.limpiar();
                pedirConfirmacion("finalizar");
              }}
            >
              Finalizar proyecto
            </Boton>
          </div>
        </div>
      )}
      {Object.entries(CONFIRMACIONES).map(([clave, configuracion]) => (
        <DialogoDeConfirmacion
          key={clave}
          abierto={confirmacion === clave}
          {...configuracion}
          alConfirmar={alConfirmar[clave]}
          alCancelar={cancelarConfirmacion}
        />
      ))}
      <DialogoDeConfirmacion
        abierto={salida.preguntando}
        titulo={acciones.guardando ? "Hay cambios guardándose" : "¿Salir sin guardar?"}
        descripcion={
          acciones.guardando
            ? "Esperá a que termine el guardado antes de salir."
            : "Se perderán los cambios sin guardar."
        }
        textoConfirmar="Salir"
        textoCancelar="Seguir acá"
        enviando={acciones.guardando}
        alConfirmar={salida.salir}
        alCancelar={salida.quedarse}
      />
    </section>
  );
}

function AccionDeBusqueda({ perfil, guardando, alCambiar }) {
  const vencida = busquedaVencida(perfil);
  const motivo =
    !perfil.busquedaAbierta && vencida
      ? "Cambiá la fecha de cierre para reabrir la búsqueda."
      : undefined;
  return (
    <Boton
      disabled={guardando || Boolean(motivo)}
      motivoDeshabilitado={motivo}
      onClick={alCambiar}
    >
      {perfil.busquedaAbierta ? "Cerrar búsqueda" : "Reabrir búsqueda"}
    </Boton>
  );
}

function EditorDePerfil({
  idBase,
  edicion,
  alCambiar,
  alGuardar,
  alDescartar,
  enviando,
}) {
  const catalogo = useCatalogoDeHabilidades();
  const [intento, setIntento] = useState(0);
  const refFormulario = useRef(null);
  const { original, borrador, perfilId } = edicion;
  const paraValidar =
    borrador.fechaCierreBusqueda === original.fechaCierreBusqueda
      ? { ...borrador, fechaCierreBusqueda: "" }
      : borrador;
  const errores = intento ? validarPerfil(paraValidar) : {};

  useEnfocarPrimerError(refFormulario, intento);

  useEffect(() => {
    refFormulario.current?.querySelector("textarea")?.focus();
  }, []);

  function guardar() {
    if (Object.keys(validarPerfil(paraValidar)).length) {
      setIntento((anterior) => anterior + 1);
      return;
    }
    alGuardar();
  }

  return (
    <div className={estilos.seccion}>
      <PerfilForm
        idBase={idBase}
        borrador={borrador}
        errores={errores}
        catalogo={catalogo}
        esEdicion={Boolean(perfilId)}
        puedeDescartar
        alCambiar={alCambiar}
        alGuardar={guardar}
        alDescartar={alDescartar}
        refFormulario={refFormulario}
        enviando={enviando}
        textoGuardar={perfilId ? "Guardar cambios" : "Guardar perfil"}
      />
    </div>
  );
}
