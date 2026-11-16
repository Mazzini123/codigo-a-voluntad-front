import { aceptacionPendiente, conTerminosAceptados, hayTerminos } from "./terminos.js";

const VIGENTES = { version: 3, texto: "Reglas", publicadoEn: "2026-11-16T12:00:00Z" };

test("sin términos publicados no se pide aceptarlos", () => {
  expect(hayTerminos(null)).toBe(false);
  expect(hayTerminos(VIGENTES)).toBe(true);
  expect(aceptacionPendiente(null, null)).toBe(false);
});

test("la aceptación vale solo para la versión vigente", () => {
  expect(aceptacionPendiente(VIGENTES, null)).toBe(true);
  expect(aceptacionPendiente(VIGENTES, 2)).toBe(true);
  expect(aceptacionPendiente(VIGENTES, 3)).toBe(false);
});

test("el pedido de alta lleva la versión aceptada solo si hay términos", () => {
  const pedido = { titulo: "Huerta" };
  expect(conTerminosAceptados(pedido, VIGENTES)).toEqual({
    titulo: "Huerta",
    terminosAceptados: 3,
  });
  expect(conTerminosAceptados(pedido, null)).toBe(pedido);
});
