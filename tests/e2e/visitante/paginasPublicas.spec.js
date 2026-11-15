import { expect, test } from "@playwright/test";
import { esperarSinViolaciones } from "../apoyo/accesibilidad.js";
import { conBackFalso } from "../apoyo/backFalso.js";

const PAGINAS = [
  ["inicio", "/", "Conectamos colectivos sociales con personas que desarrollan software"],
  ["búsqueda de proyectos", "/proyectos", "Proyectos de colectivos sociales"],
  ["detalle de un proyecto", "/proyectos/p1", "Sistema de turnos del comedor"],
  ["página de un colectivo", "/colectivos/cl-fiorito", "Asamblea de Fiorito"],
];

for (const [nombre, ruta, titulo] of PAGINAS) {
  test(`${nombre} carga y no tiene problemas de accesibilidad detectables`, async ({
    page,
  }) => {
    const { noAtendidos } = await conBackFalso(page);
    await page.goto(ruta);
    await expect(page.getByRole("heading", { level: 1, name: titulo })).toBeVisible();
    await esperarSinViolaciones(page);
    expect(noAtendidos).toEqual([]);
  });
}

test("el detalle muestra la descripción con formato", async ({ page }) => {
  await conBackFalso(page);
  await page.goto("/proyectos/p1");
  const sobre = page.getByRole("region", { name: "Sobre este proyecto" });
  await expect(sobre.getByRole("listitem")).toHaveText([
    "Turnos por familia",
    "Avisos por WhatsApp",
  ]);
  await expect(sobre.locator("strong")).toHaveText("Avisos");
});

test("en celular la búsqueda no tiene scroll horizontal", async ({ page }) => {
  await conBackFalso(page);
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/proyectos");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const desborde = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(desborde).toBe(0);
});
