import { expect, test } from "@playwright/test";
import { abrirComoAdministracion } from "../apoyo/administracion.js";

const PANTALLAS = [
  ["/admin/destacados", "Proyectos destacados"],
  ["/admin/revisiones", "Revisiones de proyectos"],
  ["/admin/auditoria", "Auditoría"],
];

for (const [ruta, titulo] of PANTALLAS) {
  test(`el h1 de ${ruta} usa la escala headline de DESIGN.md`, async ({ page }) => {
    const { noAtendidos } = await abrirComoAdministracion(page, ruta);
    const h1 = page.getByRole("heading", { level: 1, name: titulo });
    await expect(h1).toBeVisible();
    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      const { actual, esperado } = await h1.evaluate((titular) => {
        const muestra = document.createElement("span");
        muestra.style.fontSize = "var(--texto-headline-tamano)";
        muestra.style.lineHeight = "var(--texto-headline-altura)";
        muestra.style.letterSpacing = "var(--texto-headline-espaciado)";
        document.body.append(muestra);
        const leer = (elemento) => {
          const estilo = getComputedStyle(elemento);
          return [estilo.fontSize, estilo.lineHeight, estilo.letterSpacing];
        };
        const valores = { actual: leer(titular), esperado: leer(muestra) };
        muestra.remove();
        return valores;
      });
      expect(actual).toEqual(esperado);
    }
    expect(noAtendidos).toEqual([]);
  });
}
