import { useEffect, useId, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Boton } from "../Components/App/Boton.jsx";
import { ConfirmDialog } from "../Components/App/ConfirmDialog.jsx";
import { ErrorState } from "../Components/App/ErrorState.jsx";
import { BloqueSkeleton, Skeleton } from "../Components/App/Skeleton.jsx";
import { TituloDePagina } from "../Components/App/TituloDePagina.jsx";
import { PerfilForm } from "../Components/Proyecto/PerfilForm.jsx";
import { PasoDelProyecto } from "../Components/Proyecto/PasoDelProyecto.jsx";
import { SelloDeBusqueda } from "../Components/Proyecto/SelloDeBusqueda.jsx";
import {
  cambiosDelPerfil,
  cambiosDelProyecto,
  datosEditablesDelPerfil,
  datosEditablesDelProyecto,
} from "../Components/Proyecto/edicionProyecto.js";
import { perfilVacio } from "../Components/Proyecto/formularioProyecto.js";
import { validarPerfil } from "../Components/Proyecto/validarProyecto.js";
import { estadoDeBusqueda } from "../Formatos/proyecto.js";
import { useAdministrarProyecto } from "../Hooks/useAdministrarProyecto.js";
import { useAvisoCambiosSinGuardar } from "../Hooks/useAvisoCambiosSinGuardar.js";
import { useAvisos } from "../Hooks/useAvisos.js";
import { useCatalogoDeHabilidades } from "../Hooks/useCatalogoDeHabilidades.js";
import { useEsDuenoDelProyecto } from "../Hooks/useEsDuenoDelProyecto.js";
import { useProyecto } from "../Hooks/useProyecto.js";
import { SinPermisoPage } from "./SinPermisoPage.jsx";
import { rutaPostulacionesRecibidas } from "../Routes/rutas.js";
import estilos from "./AdministrarProyectoPage.module.css";

export default function AdministrarProyectoPage() {
  const { id } = useParams();
  return <AccesoDeDueno key={id} id={id} />;
}

function Cargando({ etiqueta }) {
  return (
    <Skeleton etiqueta={etiqueta}>
      <BloqueSkeleton alto="2rem" />
      <BloqueSkeleton />
      <BloqueSkeleton />
    </Skeleton>
  );
}

function AccesoDeDueno({ id }) {
  const { esDueno, error, reintentar } = useEsDuenoDelProyecto(id);
  if (error) {
    return (
      <ErrorState
        nivel={1}
        titulo="No pudimos verificar el acceso"
        error={error}
        alReintentar={reintentar}
      />
    );
  }
  if (esDueno === null) return <Cargando etiqueta="Verificando el acceso al proyecto…" />;
  if (!esDueno) {
    return (
      <SinPermisoPage>
        Solo el colectivo dueño puede administrar este proyecto.
      </SinPermisoPage>
    );
  }
  return <ProyectoDelDueno id={id} />;
}

function ProyectoDelDueno({ id }) {
  const { proyecto, error, recargar } = useProyecto(id);
  if (!proyecto && error) {
    return (
      <ErrorState
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
  const [edicion, setEdicion] = useState(null);
  const [confirmacion, setConfirmacion] = useState(null);
  const detalle = `/proyectos/${encodeURIComponent(proyecto.id)}`;
  const finalizado = proyecto.estado === "FINALIZADO";
  const hayCambios =
    edicion && JSON.stringify(edicion.original) !== JSON.stringify(edicion.borrador);
  const salida = useAvisoCambiosSinGuardar(Boolean(hayCambios));
  const editandoProyecto = edicion?.tipo === "proyecto";

  useEffect(() => {
    if (editandoProyecto) refTituloEditor.current?.focus();
  }, [editandoProyecto]);

  function abrir(tipo, original, perfilId) {
    acciones.limpiar();
    setEdicion({ tipo, original, borrador: original, perfilId });
  }

  function cerrarEditor() {
    acciones.limpiar();
    setEdicion(null);
    refTitulo.current?.focus();
  }

  function cambiar(campos) {
    setEdicion((anterior) => ({
      ...anterior,
      borrador: { ...anterior.borrador, ...campos },
    }));
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
      setConfirmacion("aceptacion");
      return;
    }
    return guardarEdicionDelPerfil();
  }

  function guardarEdicionDelPerfil() {
    const { perfilId, original, borrador } = edicion;
    setConfirmacion(null);
    return guardar(
      () => acciones.guardarPerfil(perfilId, original, borrador),
      "Se guardaron los cambios del perfil.",
    );
  }

  async function finalizar() {
    setConfirmacion(null);
    if (await acciones.ejecutar(acciones.finalizar)) {
      avisar.exito("El proyecto se finalizó.");
      navigate(detalle, { replace: true });
    }
  }

  function pedirDescartar() {
    if (hayCambios) setConfirmacion("descartar");
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
        <ErrorState
          titulo="No pudimos actualizar la información del proyecto"
          error={errorDeCarga}
          alReintentar={recargar}
        />
      )}
      {acciones.error && (
        <div>
          <ErrorState
            titulo={
              acciones.aplicados.length
                ? "Se guardó una parte de los cambios"
                : "No pudimos completar la acción"
            }
            error={acciones.error}
          />
          {acciones.aplicados.length > 0 && (
            <>
              <ul>
                {acciones.aplicados.map((paso, indice) => (
                  <li key={indice}>{paso}</li>
                ))}
              </ul>
              <p>Volvé a guardar para aplicar los cambios que faltan.</p>
            </>
          )}
        </div>
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
          <p>{proyecto.descripcion}</p>
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
                          acciones.cambiarBusqueda(perfil.id, !perfil.busquedaAbierta),
                        perfil.busquedaAbierta
                          ? "Se cerró la búsqueda."
                          : "Se reabrió la búsqueda.",
                        false,
                      );
                    }}
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
                setConfirmacion("finalizar");
              }}
            >
              Finalizar proyecto
            </Boton>
          </div>
        </div>
      )}
      <ConfirmDialog
        abierto={confirmacion === "finalizar"}
        titulo="¿Finalizar el proyecto?"
        descripcion="Se rechazan las postulaciones pendientes, se finalizan las colaboraciones aceptadas y el proyecto deja de recibir postulaciones."
        textoConfirmar="Finalizar proyecto"
        alConfirmar={finalizar}
        alCancelar={() => setConfirmacion(null)}
      />
      <ConfirmDialog
        abierto={confirmacion === "aceptacion"}
        titulo="¿Guardar el modo de aceptación y el cupo?"
        descripcion="Este cambio puede aceptar o rechazar automáticamente postulaciones pendientes."
        textoConfirmar="Guardar cambios"
        permanente={false}
        alConfirmar={guardarEdicionDelPerfil}
        alCancelar={() => setConfirmacion(null)}
      />
      <ConfirmDialog
        abierto={confirmacion === "descartar"}
        titulo="¿Descartar los cambios sin guardar?"
        descripcion="Se conservan los cambios que ya se guardaron."
        textoConfirmar="Descartar cambios"
        alConfirmar={() => {
          setConfirmacion(null);
          cerrarEditor();
        }}
        alCancelar={() => setConfirmacion(null)}
      />
      <ConfirmDialog
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
  const vencida =
    perfil.fechaCierreBusqueda && new Date(perfil.fechaCierreBusqueda) <= new Date();
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

  useEffect(() => {
    if (intento) refFormulario.current?.querySelector('[aria-invalid="true"]')?.focus();
  }, [intento]);

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
