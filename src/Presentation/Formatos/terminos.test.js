import {
  errorDeTextoDeTerminos,
  LARGO_MAXIMO_DE_TERMINOS,
  mensajeDePublicarTerminos,
  textoDeAceptacion,
  textoDeVersion,
} from "./terminos.js";

const VIGENTES = { version: 3, texto: "Reglas", publicadoEn: "2026-11-16T15:00:00Z" };

test("la versión se dice con su número y su fecha de publicación", () => {
  expect(textoDeVersion(VIGENTES)).toBe(
    "Versión 3, publicada el 16 de noviembre de 2026",
  );
  expect(textoDeVersion({ version: 1 })).toBe("Versión 1");
});

test("la casilla del alta nombra la versión que se acepta", () => {
  expect(textoDeAceptacion(VIGENTES)).toBe(
    "Acepto los términos y condiciones (versión 3)",
  );
});

test("el texto de los términos es obligatorio y tiene un largo máximo", () => {
  expect(errorDeTextoDeTerminos("   ")).toBe("Escribí el texto de los términos.");
  expect(errorDeTextoDeTerminos("x".repeat(LARGO_MAXIMO_DE_TERMINOS + 1))).toBe(
    `El texto puede tener hasta ${LARGO_MAXIMO_DE_TERMINOS.toLocaleString("es-AR")} caracteres.`,
  );
  expect(errorDeTextoDeTerminos("Reglas")).toBeNull();
});

test("publicar términos explica cada falla con un mensaje propio", () => {
  expect(mensajeDePublicarTerminos({ status: 409 })).toBe(
    "Se publicó otra versión al mismo tiempo. Actualizamos el texto vigente: revisalo antes de publicar.",
  );
  expect(mensajeDePublicarTerminos({ status: 403 })).toBe(
    "Tu cuenta no puede publicar los términos.",
  );
  expect(mensajeDePublicarTerminos({ status: 500, message: "crudo" })).toBe(
    "No pudimos publicar los términos. Probá de nuevo.",
  );
});
