export const MAXIMO_POR_LISTA = 10;
export const LARGO_NOMBRE_RED = 40;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO = /^\+?\d{8,15}$/;
const URL_WEB = /^https?:\/\/\S+\.\S+/i;

export function idDeCampo(prefijo, clave) {
  return `${prefijo}-${clave}`;
}

let ultimaClave = 0;

export function crearClave() {
  ultimaClave += 1;
  return `item-${ultimaClave}`;
}

export function limpiarTelefono(valor) {
  return valor.replace(/[\s-]/g, "");
}

export function conClaves(items, campos) {
  return (items ?? []).map((item) => ({
    clave: crearClave(),
    ...Object.fromEntries(campos.map((campo) => [campo, item[campo] ?? ""])),
  }));
}

export function mediosARequest(medios) {
  return medios.map(({ tipo, valor }) => ({
    tipo,
    valor: tipo === "EMAIL" ? valor.trim() : limpiarTelefono(valor),
  }));
}

export function redesARequest(redes) {
  return redes.map(({ nombre, url }) => ({ nombre: nombre.trim(), url: url.trim() }));
}

export function validarMedio({ tipo, valor }) {
  if (!valor.trim()) return "Completá el dato de contacto o quitá la fila.";
  if (tipo === "EMAIL")
    return EMAIL.test(valor.trim())
      ? null
      : "Escribí un email válido, como hola@colectivo.org.";
  return TELEFONO.test(limpiarTelefono(valor))
    ? null
    : "Escribí un número de 8 a 15 dígitos, con el código de área.";
}

export function erroresDeListas(estado) {
  const errores = {};
  for (const medio of estado.mediosDeContacto ?? []) {
    const error = validarMedio(medio);
    if (error) errores[`mediosDeContacto.${medio.clave}.valor`] = error;
  }
  for (const red of estado.redesSociales ?? []) {
    const nombre = red.nombre.trim();
    if (!nombre || nombre.length > LARGO_NOMBRE_RED)
      errores[`redesSociales.${red.clave}.nombre`] =
        `Escribí el nombre de la red (hasta ${LARGO_NOMBRE_RED} caracteres).`;
    if (!URL_WEB.test(red.url.trim()))
      errores[`redesSociales.${red.clave}.url`] =
        "Escribí la dirección completa, empezando con https://.";
  }
  return errores;
}

export function validarTexto(texto, existentes, { largoMaximo, mensajes }) {
  const valor = texto.trim();
  if (!valor) return mensajes.vacio;
  if (valor.length > largoMaximo) return mensajes.largo;
  if (existentes.some((otro) => otro.toLowerCase() === valor.toLowerCase()))
    return mensajes.repetido;
  return null;
}

export function claveEnLista(path, estado) {
  const [raiz, indice, propiedad] = path;
  if (raiz !== "mediosDeContacto" && raiz !== "redesSociales") return undefined;
  const item = estado[raiz]?.[indice];
  if (!item) return raiz;
  return propiedad ? `${raiz}.${item.clave}.${propiedad}` : `${raiz}.${item.clave}`;
}

export const REVISAR_ESTE_DATO = "Revisá este dato.";

export const MENSAJES_DE_LISTAS = Object.freeze({
  mediosDeContacto: "Revisá los medios de contacto.",
  "mediosDeContacto.valor": "Revisá el dato de contacto.",
  redesSociales: "Revisá las redes.",
  "redesSociales.nombre": `Escribí el nombre de la red (hasta ${LARGO_NOMBRE_RED} caracteres).`,
  "redesSociales.url": "Escribí la dirección completa, empezando con https://.",
});

function claveGenerica(clave) {
  return clave.replace(/\.item-\d+/, "");
}

export function mensajeDeIssue(issue, clave, mensajes) {
  const delCampo = mensajes?.[claveGenerica(clave)];
  if (!delCampo) return REVISAR_ESTE_DATO;
  if (typeof delCampo === "string") return delCampo;
  return delCampo[issue.code] ?? delCampo.defecto ?? REVISAR_ESTE_DATO;
}

export function erroresDesdeIssuesCon(claveDeError, issues, estado, mensajes) {
  const errores = {};
  const sinCampo = [];
  for (const issue of issues ?? []) {
    const clave =
      Array.isArray(issue.path) && issue.path.length
        ? claveDeError(issue.path, estado)
        : null;
    if (clave && !errores[clave]) errores[clave] = mensajeDeIssue(issue, clave, mensajes);
    else if (!clave) sinCampo.push(REVISAR_ESTE_DATO);
  }
  return { errores, sinCampo };
}
