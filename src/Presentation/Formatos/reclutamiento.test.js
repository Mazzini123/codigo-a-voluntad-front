import {
  avisoDeInvitacionEnviada,
  cantidadDeOpcionalesQueTiene,
  descripcionDeInvitacion,
  recibeMensajeriaInterna,
  textoDeCaracteresRestantes,
  textoOpcionalesQueTiene,
} from "./reclutamiento.js";

test("solo un true explícito habilita el contacto", () => {
  expect(recibeMensajeriaInterna({ recibeMensajeriaInterna: true })).toBe(true);
  expect(recibeMensajeriaInterna({ recibeMensajeriaInterna: false })).toBe(false);
  expect(recibeMensajeriaInterna({ recibeMensajeriaInterna: "true" })).toBe(false);
  expect(recibeMensajeriaInterna({})).toBe(false);
  expect(recibeMensajeriaInterna(undefined)).toBe(false);
});

test("las opcionales que tiene pueden venir como cantidad o como lista", () => {
  expect(cantidadDeOpcionalesQueTiene({ habilidadesOpcionalesQueTiene: 2 })).toBe(2);
  expect(
    cantidadDeOpcionalesQueTiene({ habilidadesOpcionalesQueTiene: [{}, {}, {}] }),
  ).toBe(3);
  expect(cantidadDeOpcionalesQueTiene({})).toBe(0);
});

test("el texto de opcionales usa el plural correcto y se omite sin opcionales", () => {
  expect(textoOpcionalesQueTiene(1, 3)).toBe("Tiene 1 de 3 habilidades opcionales");
  expect(textoOpcionalesQueTiene(1, 1)).toBe("Tiene 1 de 1 habilidad opcional");
  expect(textoOpcionalesQueTiene(0, 0)).toBe("");
});

test("la descripción del diálogo recorta el perfil y no habla de contacto", () => {
  const texto = descripcionDeInvitacion(
    { descripcion: "x".repeat(150) },
    { titulo: "Turnos del barrio" },
  );
  expect(texto).toBe(
    `Va a recibir tu mensaje en su bandeja de la plataforma, para el perfil «${"x".repeat(100)}…» de «Turnos del barrio».`,
  );
  expect(texto).not.toMatch(/contacto|correo/i);
});

test("el contador habla en singular y plural y avisa cuando se pasa", () => {
  expect(textoDeCaracteresRestantes(500)).toBe("Quedan 500 caracteres");
  expect(textoDeCaracteresRestantes(1)).toBe("Queda 1 carácter");
  expect(textoDeCaracteresRestantes(0)).toBe("Quedan 0 caracteres");
  expect(textoDeCaracteresRestantes(-1)).toBe("Te pasaste por 1 carácter");
  expect(textoDeCaracteresRestantes(-4)).toBe("Te pasaste por 4 caracteres");
});

test("el aviso nombra a la persona invitada", () => {
  expect(avisoDeInvitacionEnviada("Ada")).toBe("Invitación enviada a «Ada».");
});
