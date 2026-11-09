import {
  claveEnLista,
  conClaves,
  erroresDesdeIssuesCon,
  MENSAJES_DE_LISTAS,
  mediosARequest,
  redesARequest,
} from "@/Presentation/Formularios/comunes/formulario.js";

export const IDENTIFICACION = Object.freeze({
  FANTASIA: "FANTASIA",
  NOMBRE: "NOMBRE",
});

function identificacionDe(colaboradora) {
  if (!colaboradora) return "";
  return colaboradora.nombreFantasia ? IDENTIFICACION.FANTASIA : IDENTIFICACION.NOMBRE;
}

export function estadoInicial(colaboradora) {
  return {
    identificacion: identificacionDe(colaboradora),
    nombreFantasia: colaboradora?.nombreFantasia ?? "",
    nombre: colaboradora?.nombre ?? "",
    apellido: colaboradora?.apellido ?? "",
    cuentaGit: colaboradora?.cuentaGit ?? "",
    pronombres: [...(colaboradora?.pronombres ?? [])],
    presentacion: colaboradora?.presentacion ?? "",
    recibeMensajeriaInterna: colaboradora?.recibeMensajeriaInterna ?? false,
    habilidades: [...(colaboradora?.habilidades ?? [])],
    mediosDeContacto: [],
    redesSociales: conClaves(colaboradora?.redesSociales, ["nombre", "url"]),
  };
}

function textoONulo(valor) {
  return valor.trim() || null;
}

export function aRequestAlta(estado) {
  const conFantasia = estado.identificacion === IDENTIFICACION.FANTASIA;
  return {
    nombreFantasia: conFantasia ? estado.nombreFantasia.trim() : null,
    nombre: conFantasia ? null : estado.nombre.trim(),
    apellido: conFantasia ? null : estado.apellido.trim(),
    cuentaGit: textoONulo(estado.cuentaGit),
    presentacion: textoONulo(estado.presentacion),
    pronombres: estado.pronombres,
    codigosHabilidades: estado.habilidades.map((habilidad) => habilidad.codigo),
    recibeMensajeriaInterna: estado.recibeMensajeriaInterna,
    mediosDeContacto: mediosARequest(estado.mediosDeContacto),
    redesSociales: redesARequest(estado.redesSociales),
  };
}

function editables(estado) {
  return {
    pronombres: estado.pronombres,
    presentacion: textoONulo(estado.presentacion),
    recibeMensajeriaInterna: estado.recibeMensajeriaInterna,
    redesSociales: redesARequest(estado.redesSociales),
  };
}

export function cambios(estadoOriginal, estadoActual) {
  const original = editables(estadoOriginal);
  const actual = editables(estadoActual);
  return Object.fromEntries(
    Object.keys(actual)
      .filter(
        (campo) => JSON.stringify(original[campo]) !== JSON.stringify(actual[campo]),
      )
      .map((campo) => [campo, actual[campo]]),
  );
}

const CAMPOS = [
  "nombreFantasia",
  "nombre",
  "apellido",
  "cuentaGit",
  "presentacion",
  "pronombres",
  "recibeMensajeriaInterna",
];

export function claveDeError(path, estado) {
  const enLista = claveEnLista(path, estado);
  if (enLista !== undefined) return enLista;
  const [raiz] = path;
  if (raiz === "codigosHabilidades") return "habilidades";
  return CAMPOS.includes(raiz) ? raiz : null;
}

const MENSAJES_DE_CAMPOS = Object.freeze({
  ...MENSAJES_DE_LISTAS,
  nombreFantasia: {
    too_small: "Escribí tu nombre de fantasía.",
    defecto: "Revisá tu nombre de fantasía.",
  },
  nombre: { too_small: "Escribí tu nombre.", defecto: "Revisá tu nombre." },
  apellido: { too_small: "Escribí tu apellido.", defecto: "Revisá tu apellido." },
  cuentaGit: "Revisá tu usuario de GitHub o GitLab.",
  presentacion: "Revisá tu presentación.",
  pronombres: "Revisá los pronombres.",
  recibeMensajeriaInterna: "Revisá esta opción.",
  habilidades: {
    too_small: "Elegí al menos una habilidad.",
    defecto: "Revisá las habilidades.",
  },
});

export function erroresDesdeIssues(issues, estado) {
  return erroresDesdeIssuesCon(claveDeError, issues, estado, MENSAJES_DE_CAMPOS);
}
