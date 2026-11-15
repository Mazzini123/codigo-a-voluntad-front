import { clases } from "./clases.js";

test("une las clases presentes y descarta las vacías", () => {
  expect(clases("tarjeta", false, null, undefined, "", "activa")).toBe("tarjeta activa");
});

test("sin clases devuelve un texto vacío", () => {
  expect(clases(false, null)).toBe("");
});
