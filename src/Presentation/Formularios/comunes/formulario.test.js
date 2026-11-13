import { validarMedio, mediosARequest } from "./formulario.js";

test.each(["+12345678", "+123456789012345", " +54 9 11-5555-1234 "])(
  "acepta SMS internacional %s",
  (valor) => {
    expect(validarMedio({ tipo: "SMS", valor })).toBeNull();
  },
);

test.each(["1155551234", "+0123456789", "+1234567", "+1234567890123456", "+54abc123456"])(
  "rechaza SMS invalido %s",
  (valor) => {
    expect(validarMedio({ tipo: "SMS", valor })).toMatch(/internacional/);
  },
);

test("normaliza el SMS antes de enviarlo", () => {
  expect(mediosARequest([{ tipo: "SMS", valor: " +54 9 11-5555-1234 " }])).toEqual([
    { tipo: "SMS", valor: "+5491155551234" },
  ]);
});

test("conserva los formatos de email y WhatsApp", () => {
  expect(validarMedio({ tipo: "EMAIL", valor: "ada@example.org" })).toBeNull();
  expect(validarMedio({ tipo: "WHATSAPP", valor: "11 5555-1234" })).toBeNull();
});
