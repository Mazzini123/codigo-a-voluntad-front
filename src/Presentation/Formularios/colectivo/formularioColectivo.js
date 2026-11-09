import {
  claveEnLista,
  conClaves,
  erroresDesdeIssuesCon,
  MENSAJES_DE_LISTAS,
  mediosARequest,
  redesARequest,
} from "@/Presentation/Formularios/comunes/formulario.js";
import { TIPO_UBICACION } from "@/Application/Domain/Enums/TIPO_UBICACION.js";

export const OPCION_UBICACION = Object.freeze({
  NINGUNA: "NINGUNA",
  ...TIPO_UBICACION,
});

function ubicacionInicial(ubicacion) {
  const vacia = { opcion: OPCION_UBICACION.NINGUNA, provincia: "", localidad: "" };
  if (!ubicacion) return vacia;
  switch (ubicacion.tipoUbicacion) {
    case TIPO_UBICACION.PROVINCIA:
      return {
        ...vacia,
        opcion: OPCION_UBICACION.PROVINCIA,
        provincia: ubicacion.nombre ?? "",
      };
    case TIPO_UBICACION.LOCALIDAD:
      return {
        ...vacia,
        opcion: OPCION_UBICACION.LOCALIDAD,
        localidad: ubicacion.nombre ?? "",
      };
    default:
      return { ...vacia, opcion: ubicacion.tipoUbicacion };
  }
}

export function estadoInicial(colectivo) {
  return {
    nombre: colectivo?.nombre ?? "",
    descripcion: colectivo?.descripcion ?? "",
    tipoColectivo: colectivo?.tipoColectivo ?? "",
    ubicacion: ubicacionInicial(colectivo?.ubicacion),
    mediosDeContacto: [],
    redesSociales: conClaves(colectivo?.redesSociales, ["nombre", "url"]),
    etiquetas: [...(colectivo?.etiquetas ?? [])],
  };
}

function ubicacionARequest({ opcion, provincia, localidad }) {
  switch (opcion) {
    case OPCION_UBICACION.NINGUNA:
      return null;
    case OPCION_UBICACION.PROVINCIA:
      return { tipoUbicacion: TIPO_UBICACION.PROVINCIA, nombre: provincia };
    case OPCION_UBICACION.LOCALIDAD:
      return { tipoUbicacion: TIPO_UBICACION.LOCALIDAD, nombre: localidad.trim() };
    default:
      return { tipoUbicacion: opcion };
  }
}

export function aRequest(estado) {
  return {
    nombre: estado.nombre.trim(),
    descripcion: estado.descripcion.trim(),
    tipoColectivo: estado.tipoColectivo,
    ubicacion: ubicacionARequest(estado.ubicacion),
    mediosDeContacto: mediosARequest(estado.mediosDeContacto),
    redesSociales: redesARequest(estado.redesSociales),
    etiquetas: estado.etiquetas,
  };
}

const CAMPOS_EDITABLES = [
  "nombre",
  "descripcion",
  "ubicacion",
  "redesSociales",
  "etiquetas",
];

export function cambios(estadoOriginal, estadoActual) {
  const original = aRequest(estadoOriginal);
  const actual = aRequest(estadoActual);
  return Object.fromEntries(
    CAMPOS_EDITABLES.filter(
      (campo) => JSON.stringify(original[campo]) !== JSON.stringify(actual[campo]),
    ).map((campo) => [campo, actual[campo]]),
  );
}

export function claveDeError(path, estado) {
  const enLista = claveEnLista(path, estado);
  if (enLista !== undefined) return enLista;
  const [raiz] = path;
  if (raiz === "ubicacion") {
    if (estado.ubicacion.opcion === OPCION_UBICACION.LOCALIDAD)
      return "ubicacion.localidad";
    if (estado.ubicacion.opcion === OPCION_UBICACION.PROVINCIA)
      return "ubicacion.provincia";
    return "ubicacion";
  }
  if (["nombre", "descripcion", "tipoColectivo", "etiquetas"].includes(raiz)) return raiz;
  return null;
}

const MENSAJES_DE_CAMPOS = Object.freeze({
  ...MENSAJES_DE_LISTAS,
  nombre: { too_small: "Escribí el nombre del colectivo.", defecto: "Revisá el nombre." },
  descripcion: {
    too_small: "Contá en pocas líneas a qué se dedican.",
    defecto: "Revisá la descripción.",
  },
  tipoColectivo: "Elegí el tipo de colectivo.",
  etiquetas: "Revisá las etiquetas.",
  ubicacion: "Revisá dónde trabajan.",
  "ubicacion.provincia": "Elegí la provincia.",
  "ubicacion.localidad": "Escribí la ciudad o el barrio.",
});

export function erroresDesdeIssues(issues, estado) {
  return erroresDesdeIssuesCon(claveDeError, issues, estado, MENSAJES_DE_CAMPOS);
}
