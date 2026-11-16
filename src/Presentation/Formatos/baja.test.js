import { CODIGO_ERROR } from "@/Application/Domain/Enums/CODIGO_ERROR.js";
import {
  errorDeMotivoDeBaja,
  LARGO_MAXIMO_DE_MOTIVO,
  mensajeDeBaja,
  textoDeBajaDelProyecto,
  TIPO_DE_BAJA,
} from "./baja.js";

const BAJA = { motivo: "Publica datos personales.", fecha: "2026-11-16T15:00:00.000Z" };

test("el motivo de la baja es obligatorio y tiene un largo máximo", () => {
  expect(errorDeMotivoDeBaja("  ")).toBe("Contá el motivo de la baja.");
  expect(errorDeMotivoDeBaja("x".repeat(LARGO_MAXIMO_DE_MOTIVO + 1))).toBe(
    `El motivo puede tener hasta ${LARGO_MAXIMO_DE_MOTIVO} caracteres.`,
  );
  expect(errorDeMotivoDeBaja("Spam")).toBeNull();
});

test("el colectivo lee quién dio de baja su proyecto, cuándo y por qué", () => {
  expect(textoDeBajaDelProyecto(BAJA)).toBe(
    "Administración lo dio de baja el 16 de noviembre de 2026: Publica datos personales.",
  );
  expect(textoDeBajaDelProyecto(null)).toBe(
    "Administración lo dio de baja por no cumplir los términos y condiciones.",
  );
});

test.each([
  [
    TIPO_DE_BAJA.PROYECTO,
    { status: 409 },
    "Este proyecto ya estaba dado de baja. Actualizamos la lista.",
  ],
  [
    TIPO_DE_BAJA.COLECTIVO,
    { status: 409 },
    "Este colectivo ya estaba dado de baja. Actualizamos la lista.",
  ],
  [
    TIPO_DE_BAJA.PROYECTO,
    { status: 404 },
    "No encontramos este proyecto. Actualizamos la lista.",
  ],
  [
    TIPO_DE_BAJA.PROYECTO,
    { status: 422, codigo: CODIGO_ERROR.CONFLICTO_DE_INTERESES },
    "No podés dar de baja un proyecto de un colectivo del que formás parte.",
  ],
  [
    TIPO_DE_BAJA.COLECTIVO,
    { status: 422, codigo: CODIGO_ERROR.CONFLICTO_DE_INTERESES },
    "No podés dar de baja un colectivo del que formás parte.",
  ],
  [
    TIPO_DE_BAJA.COLECTIVO,
    { status: 500, message: "crudo" },
    "No pudimos dar de baja el colectivo. Probá de nuevo.",
  ],
])("la baja de un %s explica la falla %o", (tipo, error, esperado) => {
  expect(mensajeDeBaja(error, tipo)).toBe(esperado);
});
