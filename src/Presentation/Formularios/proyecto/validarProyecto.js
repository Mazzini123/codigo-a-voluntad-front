import { MODO_ACEPTACION } from "@/Application/Domain/Enums/MODO_ACEPTACION.js";
import { esFechaFutura } from "./formularioProyecto.js";

const ENTERO_POSITIVO = /^[1-9]\d*$/;

const MENSAJE_FECHA = "Elegí una fecha posterior a hoy.";

export function validarDatosDelProyecto(proyecto, ahora = new Date()) {
  const errores = {};
  if (!proyecto.titulo.trim()) errores.titulo = "Escribí el título del proyecto.";
  if (!proyecto.descripcion.trim())
    errores.descripcion = "Escribí la descripción del proyecto.";
  if (proyecto.fechaCierre && !esFechaFutura(proyecto.fechaCierre, ahora))
    errores.fechaCierre = MENSAJE_FECHA;
  return errores;
}

function validarLimite(perfil) {
  const limite = perfil.limite.trim();
  if (perfil.modoAceptacion === MODO_ACEPTACION.HASTA_LLENAR_VACANTES)
    return ENTERO_POSITIVO.test(limite)
      ? null
      : "Escribí cuántos lugares hay: un número entero mayor que 0.";
  if (perfil.modoAceptacion === MODO_ACEPTACION.REVISION_MANUAL && limite)
    return ENTERO_POSITIVO.test(limite)
      ? null
      : "Escribí un número entero mayor que 0 o dejá el campo vacío.";
  return null;
}

function seRepiteUnaHabilidad(perfil) {
  const requeridas = new Set(perfil.requeridas.map((habilidad) => habilidad.codigo));
  return perfil.opcionales.some((habilidad) => requeridas.has(habilidad.codigo));
}

export function validarPerfil(perfil, ahora = new Date()) {
  const errores = {};
  if (!perfil.descripcion.trim())
    errores["perfil.descripcion"] = "Contá qué tendría que hacer esta persona.";
  if (perfil.requeridas.length === 0)
    errores["perfil.requeridas"] = "Elegí al menos una habilidad requerida.";
  if (seRepiteUnaHabilidad(perfil))
    errores["perfil.opcionales"] =
      "Una habilidad no puede ser requerida y opcional a la vez.";
  if (!ENTERO_POSITIVO.test(perfil.horas.trim()))
    errores["perfil.horas"] = "Escribí cuántas horas: un número entero mayor que 0.";
  const errorDeLimite = validarLimite(perfil);
  if (errorDeLimite) errores["perfil.limite"] = errorDeLimite;
  if (perfil.fechaCierreBusqueda && !esFechaFutura(perfil.fechaCierreBusqueda, ahora))
    errores["perfil.fechaCierreBusqueda"] = MENSAJE_FECHA;
  return errores;
}

export function pasoMaximoPermitido(proyecto, perfiles, ahora = new Date()) {
  if (Object.keys(validarDatosDelProyecto(proyecto, ahora)).length > 0) return 1;
  return perfiles.length === 0 ? 2 : 3;
}
