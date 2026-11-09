import { crearClave } from "@/Presentation/Formularios/comunes/formulario.js";
import { estadoInicial, OPCION_UBICACION } from "./formularioColectivo.js";
import { validarColectivo, validarEtiqueta } from "./validarColectivo.js";

function valido() {
  return {
    ...estadoInicial(null),
    nombre: "Asamblea de Fiorito",
    descripcion: "Comedor.",
    tipoColectivo: "ASAMBLEA",
  };
}

test("un colectivo con lo obligatorio no tiene errores", () => {
  expect(validarColectivo(valido(), { esAlta: true })).toEqual({});
});

test("pide nombre, descripción y, en el alta, el tipo", () => {
  const estado = { ...estadoInicial(null), nombre: "   " };
  expect(Object.keys(validarColectivo(estado, { esAlta: true }))).toEqual([
    "nombre",
    "tipoColectivo",
    "descripcion",
  ]);
  expect(validarColectivo(estado, { esAlta: false }).tipoColectivo).toBeUndefined();
});

test("pide la provincia o la localidad según la opción elegida", () => {
  const estado = valido();
  estado.ubicacion = { opcion: OPCION_UBICACION.PROVINCIA, provincia: "", localidad: "" };
  expect(validarColectivo(estado, { esAlta: true })["ubicacion.provincia"]).toBeDefined();
  estado.ubicacion = {
    opcion: OPCION_UBICACION.LOCALIDAD,
    provincia: "",
    localidad: " ",
  };
  expect(validarColectivo(estado, { esAlta: true })["ubicacion.localidad"]).toBeDefined();
});

test.each([
  ["EMAIL", "hola@colectivo.org", false],
  ["EMAIL", "hola@colectivo", true],
  ["WHATSAPP", "+54 9 11 2222-3333", false],
  ["SMS", "1234", true],
  ["SMS", "", true],
])("medio %s con %j → error: %s", (tipo, valor, conError) => {
  const estado = valido();
  const clave = crearClave();
  estado.mediosDeContacto = [{ clave, tipo, valor }];
  const errores = validarColectivo(estado, { esAlta: true });
  expect(Boolean(errores[`mediosDeContacto.${clave}.valor`])).toBe(conError);
});

test("una red social necesita nombre y dirección web completa", () => {
  const estado = valido();
  const clave = crearClave();
  estado.redesSociales = [{ clave, nombre: "", url: "instagram.com/x" }];
  const errores = validarColectivo(estado, { esAlta: true });
  expect(errores[`redesSociales.${clave}.nombre`]).toBeDefined();
  expect(errores[`redesSociales.${clave}.url`]).toBeDefined();
});

test("las etiquetas no pueden estar vacías, ser muy largas ni repetirse", () => {
  expect(validarEtiqueta("  ", [])).not.toBeNull();
  expect(validarEtiqueta("a".repeat(31), [])).not.toBeNull();
  expect(validarEtiqueta("Educación", ["educación"])).not.toBeNull();
  expect(validarEtiqueta("huerta", ["educación"])).toBeNull();
});
