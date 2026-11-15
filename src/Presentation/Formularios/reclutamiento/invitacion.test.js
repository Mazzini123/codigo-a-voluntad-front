import {
  armarInvitacion,
  caracteresRestantes,
  LIMITE_DE_MENSAJE,
  validarInvitacion,
} from "./invitacion.js";

test("un mensaje vacío o solo de espacios no es válido", () => {
  expect(validarInvitacion("")).toBe("Escribí un mensaje para la invitación.");
  expect(validarInvitacion("  \n ")).toBe("Escribí un mensaje para la invitación.");
});

test("acepta hasta 500 caracteres y rechaza uno más", () => {
  expect(validarInvitacion("a".repeat(LIMITE_DE_MENSAJE))).toBeNull();
  expect(validarInvitacion("a".repeat(LIMITE_DE_MENSAJE + 1))).toBe(
    "El mensaje puede tener hasta 500 caracteres.",
  );
});

test("cuenta los caracteres que quedan, también por debajo de cero", () => {
  expect(caracteresRestantes("hola")).toBe(496);
  expect(caracteresRestantes("a".repeat(503))).toBe(-3);
});

test("arma el request con la persona y el mensaje tal como se escribió", () => {
  expect(armarInvitacion("c1", " Hola ")).toEqual({
    colaboradorId: "c1",
    mensaje: " Hola ",
  });
});
