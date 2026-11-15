import {
  aRequest,
  cambios,
  erroresDesdeIssues,
  estadoInicial,
  OPCION_UBICACION,
} from "./formularioColectivo.js";

const colectivo = {
  id: "c1",
  nombre: "Asamblea de Fiorito",
  descripcion: "Comedor y apoyo escolar.",
  tipoColectivo: "ASAMBLEA",
  ubicacion: { tipoUbicacion: "LOCALIDAD", nombre: "Villa Fiorito" },
  redesSociales: [{ nombre: "Instagram", url: "https://instagram.com/fiorito" }],
  etiquetas: ["educación"],
};

test("arma el request de alta, limpiando teléfonos y espacios", () => {
  const estado = estadoInicial(colectivo);
  estado.nombre = "  Asamblea de Fiorito  ";
  estado.mediosDeContacto = [
    { tipo: "EMAIL", valor: "hola@fiorito.org" },
    { tipo: "WHATSAPP", valor: "+54 9 11 2222-3333" },
  ];
  expect(aRequest(estado)).toEqual({
    nombre: "Asamblea de Fiorito",
    descripcion: "Comedor y apoyo escolar.",
    tipoColectivo: "ASAMBLEA",
    ubicacion: { tipoUbicacion: "LOCALIDAD", nombre: "Villa Fiorito" },
    mediosDeContacto: [
      { tipo: "EMAIL", valor: "hola@fiorito.org" },
      { tipo: "WHATSAPP", valor: "+5491122223333" },
    ],
    redesSociales: colectivo.redesSociales,
    etiquetas: ["educación"],
  });
});

test.each([
  [OPCION_UBICACION.NINGUNA, null],
  [OPCION_UBICACION.ARGENTINA, { tipoUbicacion: "ARGENTINA" }],
  [OPCION_UBICACION.CABA, { tipoUbicacion: "CABA" }],
  [OPCION_UBICACION.PROVINCIA, { tipoUbicacion: "PROVINCIA", nombre: "Córdoba" }],
])("la ubicación %s se manda como %j", (opcion, esperado) => {
  const estado = estadoInicial(null);
  estado.ubicacion = { opcion, provincia: "Córdoba", localidad: "" };
  expect(aRequest(estado).ubicacion).toEqual(esperado);
});

test("cambios devuelve solo los campos modificados y nunca el tipo", () => {
  const original = estadoInicial(colectivo);
  expect(cambios(original, original)).toEqual({});
  const editado = {
    ...original,
    descripcion: "Comedor, apoyo escolar y huerta.",
    tipoColectivo: "ONG",
  };
  expect(cambios(original, editado)).toEqual({
    descripcion: "Comedor, apoyo escolar y huerta.",
  });
});

test("una lista cambiada se manda completa", () => {
  const original = estadoInicial(colectivo);
  const editado = { ...original, etiquetas: [...original.etiquetas, "huerta"] };
  expect(cambios(original, editado)).toEqual({ etiquetas: ["educación", "huerta"] });
});

test("mapea los issues del back a cada campo, incluso dentro de las listas", () => {
  const estado = estadoInicial(colectivo);
  estado.mediosDeContacto = [
    { clave: "item-1", tipo: "EMAIL", valor: "hola@fiorito.org" },
    { clave: "item-2", tipo: "WHATSAPP", valor: "teléfono inválido" },
  ];
  const { errores, sinCampo } = erroresDesdeIssues(
    [
      { path: ["nombre"], message: "Demasiado largo" },
      { path: ["mediosDeContacto", 1, "valor"], message: "Teléfono inválido" },
      { path: ["ubicacion", "nombre"], message: "Localidad inválida" },
      { path: ["otraCosa"], message: "Algo más" },
    ],
    estado,
  );
  expect(errores).toEqual({
    nombre: "Revisá el nombre.",
    "mediosDeContacto.item-2.valor": "Revisá el dato de contacto.",
    "ubicacion.localidad": "Escribí la ciudad o el barrio.",
  });
  expect(sinCampo).toEqual(["Revisá este dato."]);
});

test("nunca muestra el texto del back, solo el del front según el campo y el código", () => {
  const estado = estadoInicial(colectivo);
  const { errores } = erroresDesdeIssues(
    [
      { path: ["nombre"], code: "too_small", message: "String must contain at least 1" },
      { path: ["descripcion"], code: "otro", message: "Required" },
    ],
    estado,
  );
  expect(errores).toEqual({
    nombre: "Escribí el nombre del colectivo.",
    descripcion: "Revisá la descripción.",
  });
  expect(Object.values(errores).join(" ")).not.toMatch(/String|Required/);
});
