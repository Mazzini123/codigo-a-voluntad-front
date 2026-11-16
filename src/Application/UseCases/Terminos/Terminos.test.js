import { crearObtenerTerminosVigentes } from "./ObtenerTerminosVigentes.js";

const VIGENTES = { version: 2, texto: "Reglas", publicadoEn: "2026-11-16T12:00:00Z" };

test("devuelve los términos vigentes tal como los manda el back", async () => {
  const obtenerVigentes = vi.fn(async () => VIGENTES);
  const signal = new AbortController().signal;
  const terminos = await crearObtenerTerminosVigentes({ obtenerVigentes })({ signal });
  expect(obtenerVigentes).toHaveBeenCalledWith({ signal });
  expect(terminos).toEqual(VIGENTES);
});

test("sin términos publicados (404) devuelve null en lugar de un error", async () => {
  const obtenerVigentes = vi.fn(async () => {
    throw Object.assign(new Error("No existe"), { status: 404 });
  });
  await expect(crearObtenerTerminosVigentes({ obtenerVigentes })()).resolves.toBeNull();
});

test("cualquier otro error se propaga", async () => {
  const falla = Object.assign(new Error("Caído"), { status: 500 });
  const obtenerVigentes = vi.fn(async () => {
    throw falla;
  });
  await expect(crearObtenerTerminosVigentes({ obtenerVigentes })()).rejects.toBe(falla);
});
