import {
  cupoCompleto,
  DIAS_POR_DEFECTO,
  fechaDeFinPorDefecto,
  fechaMinimaDeFin,
  fechaDeFinValida,
  MAXIMO_DE_DESTACADOS,
} from "./destacados.js";

const HOY = new Date("2026-11-16T01:30:00Z");

test("la fecha de fin sugerida es dentro de 30 días, en formato de campo de fecha", () => {
  expect(DIAS_POR_DEFECTO).toBe(30);
  expect(fechaDeFinPorDefecto(HOY)).toBe("2026-12-15");
});

test("la fecha mínima es mañana, aunque sea de noche", () => {
  expect(fechaMinimaDeFin(HOY)).toBe("2026-11-16");
  expect(fechaMinimaDeFin(new Date("2027-01-01T02:59:00Z"))).toBe("2027-01-01");
});

test("una fecha de fin es válida si existe y no es anterior a mañana", () => {
  expect(fechaDeFinValida("2026-11-16", HOY)).toBe(true);
  expect(fechaDeFinValida("2027-02-01", HOY)).toBe(true);
  expect(fechaDeFinValida("2026-11-15", HOY)).toBe(false);
  expect(fechaDeFinValida("2020-01-01", HOY)).toBe(false);
  expect(fechaDeFinValida("", HOY)).toBe(false);
  expect(fechaDeFinValida("2026-02-30", HOY)).toBe(false);
});

test("el cupo se completa con el máximo de destacados vigentes", () => {
  expect(MAXIMO_DE_DESTACADOS).toBe(6);
  expect(cupoCompleto(5)).toBe(false);
  expect(cupoCompleto(6)).toBe(true);
  expect(cupoCompleto(7)).toBe(true);
});
