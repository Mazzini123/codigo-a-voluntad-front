import { leerUrlExterna } from "@/Presentation/Components/App/ui/urlExterna.js";
import { textoDePorcentaje } from "@/Presentation/Formatos/avance.js";

const DIRECCION_INVALIDA = "Escribí la dirección completa, empezando con https://.";

const CAMPOS_DEL_BACK = Object.freeze({
  porcentajeConcrecion: "porcentaje",
  urlSistema: "urlSistema",
  urlRepositorio: "urlRepositorio",
});

export const AVANCE_VACIO = Object.freeze({
  porcentaje: "",
  urlSistema: "",
  urlRepositorio: "",
});

export function leerPorcentaje(texto) {
  const limpio = texto.trim().replace(",", ".");
  return limpio === "" ? Number.NaN : Number(limpio);
}

function validarDireccion(valor, vacio) {
  if (!valor.trim()) return vacio;
  return leerUrlExterna(valor) ? null : DIRECCION_INVALIDA;
}

function validarPorcentaje(texto, actual) {
  if (!texto.trim()) return "Escribí el porcentaje de avance.";
  const porcentaje = leerPorcentaje(texto);
  if (!Number.isFinite(porcentaje) || porcentaje < 0 || porcentaje > 100)
    return "Escribí un número entre 0 y 100.";
  if (actual !== null && porcentaje <= actual)
    return `Tiene que superar el avance actual: ${textoDePorcentaje(actual)}`;
  return null;
}

export function validarAvance(estado, actual) {
  const errores = {};
  const porcentaje = validarPorcentaje(estado.porcentaje, actual);
  const sistema = validarDireccion(
    estado.urlSistema,
    "Escribí la dirección del sistema.",
  );
  const repositorio = validarDireccion(
    estado.urlRepositorio,
    "Escribí la dirección del repositorio.",
  );
  if (porcentaje) errores.porcentaje = porcentaje;
  if (sistema) errores.urlSistema = sistema;
  if (repositorio) errores.urlRepositorio = repositorio;
  return errores;
}

export function armarAvance({ porcentaje, urlSistema, urlRepositorio }) {
  return {
    porcentajeConcrecion: leerPorcentaje(porcentaje),
    urlSistema: urlSistema.trim(),
    urlRepositorio: urlRepositorio.trim(),
  };
}

export function erroresDeAvanceDesdeIssues(issues) {
  const errores = {};
  for (const issue of issues ?? []) {
    const campo = CAMPOS_DEL_BACK[Array.isArray(issue.path) ? issue.path[0] : issue.path];
    if (!campo || errores[campo]) continue;
    errores[campo] =
      campo === "porcentaje"
        ? "Revisá el porcentaje: tiene que ser un número entre 0 y 100 que supere el avance actual."
        : DIRECCION_INVALIDA;
  }
  return errores;
}
