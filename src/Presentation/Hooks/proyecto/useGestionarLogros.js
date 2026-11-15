import { useCallback, useState } from "react";
import { logroDependencies } from "@/Presentation/Dependencies/logroDependencies.js";
import {
  AVISO_LOGRO_CARGADO,
  AVISO_LOGRO_EDITADO,
  AVISO_LOGRO_ELIMINADO,
  MENSAJE_LOGRO_REPETIDO,
  MENSAJE_SOLO_DUENO,
} from "@/Presentation/Formatos/avance.js";
import {
  armarLogro,
  estadoInicialDeLogro,
  LOGRO_VACIO,
  validarLogro,
} from "@/Presentation/Formularios/proyecto/formularioLogro.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

const MENSAJES_DE_GUARDADO = Object.freeze({
  403: MENSAJE_SOLO_DUENO,
  409: MENSAJE_LOGRO_REPETIDO,
});
const MENSAJES_DE_ELIMINACION = Object.freeze({ 403: MENSAJE_SOLO_DUENO });
const SIN_DIALOGO = Object.freeze({ abierto: false, logro: null });
const SIN_ELIMINACION = Object.freeze({
  abierta: false,
  logro: null,
  eliminada: false,
});
const SIN_ERRORES = Object.freeze({});

export function useGestionarLogros(
  proyectoId,
  alCambiar,
  dependencias = logroDependencies,
) {
  const avisar = useAvisos();
  const [dialogo, setDialogo] = useState(SIN_DIALOGO);
  const [formulario, setFormulario] = useState(LOGRO_VACIO);
  const [intentos, setIntentos] = useState(0);
  const [eliminacion, setEliminacion] = useState(SIN_ELIMINACION);
  const [recargando, setRecargando] = useState(false);

  const crearTarea = useCallback(
    (signal, request) => dependencias.crearLogro(proyectoId, request, { signal }),
    [proyectoId, dependencias],
  );
  const editarTarea = useCallback(
    (signal, logroId, request) =>
      dependencias.actualizarLogro(proyectoId, logroId, request, { signal }),
    [proyectoId, dependencias],
  );
  const eliminarTarea = useCallback(
    (signal, logroId) => dependencias.eliminarLogro(proyectoId, logroId, { signal }),
    [proyectoId, dependencias],
  );
  const crear = useMutacion(crearTarea, { mensajes: MENSAJES_DE_GUARDADO });
  const editar = useMutacion(editarTarea, { mensajes: MENSAJES_DE_GUARDADO });
  const eliminar = useMutacion(eliminarTarea, { mensajes: MENSAJES_DE_ELIMINACION });

  const ocupado = crear.enviando || editar.enviando || eliminar.enviando || recargando;
  const errorDelServidor = crear.error ?? editar.error;
  const erroresDelFormulario = intentos > 0 ? validarLogro(formulario) : SIN_ERRORES;
  const errores =
    errorDelServidor?.status === 409
      ? { ...erroresDelFormulario, titulo: errorDelServidor.mensaje }
      : erroresDelFormulario;

  function reiniciarMutaciones() {
    crear.reiniciar();
    editar.reiniciar();
    eliminar.reiniciar();
  }

  function abrir(logro = null) {
    reiniciarMutaciones();
    setFormulario(estadoInicialDeLogro(logro));
    setIntentos(0);
    setDialogo({ abierto: true, logro });
  }

  function cerrar() {
    reiniciarMutaciones();
    setIntentos(0);
    setDialogo((actual) => ({ ...actual, abierto: false }));
  }

  function cambiar(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  async function recargar() {
    setRecargando(true);
    try {
      await alCambiar();
    } finally {
      setRecargando(false);
    }
  }

  async function guardar() {
    if (Object.keys(validarLogro(formulario)).length > 0) {
      setIntentos((actuales) => actuales + 1);
      return;
    }
    const request = armarLogro(formulario);
    const { logro } = dialogo;
    const resultado = logro
      ? await editar.ejecutar(logro.id, request)
      : await crear.ejecutar(request);
    if (!resultado.ok) return;
    avisar.exito(logro ? AVISO_LOGRO_EDITADO : AVISO_LOGRO_CARGADO);
    await recargar();
    cerrar();
  }

  function pedirEliminacion(logro) {
    reiniciarMutaciones();
    setEliminacion({ abierta: true, logro, eliminada: false });
  }

  function cancelarEliminacion() {
    reiniciarMutaciones();
    setEliminacion(SIN_ELIMINACION);
  }

  async function confirmarEliminacion() {
    const resultado = await eliminar.ejecutar(eliminacion.logro.id);
    if (!resultado.ok) return;
    avisar.exito(AVISO_LOGRO_ELIMINADO);
    await recargar();
    setEliminacion((actual) => ({ ...actual, abierta: false, eliminada: true }));
  }

  return {
    dialogo,
    formulario,
    errores,
    intentos,
    errorDelServidor,
    ocupado,
    abrir,
    cerrar,
    cambiar,
    guardar,
    eliminacion,
    errorDeEliminacion: eliminar.error,
    pedirEliminacion,
    cancelarEliminacion,
    confirmarEliminacion,
  };
}
