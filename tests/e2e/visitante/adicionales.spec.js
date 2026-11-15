import { expect, test } from "@playwright/test";
import { conBackFalso } from "../apoyo/backFalso.js";
import { esperarSinViolaciones } from "../apoyo/accesibilidad.js";

test("las cifras y la historia pública funcionan en escritorio y a 320 px", async ({
  page,
}) => {
  const { noAtendidos } = await conBackFalso(page);
  for (const width of [1280, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(
      page.getByRole("region", { name: "La plataforma en números" }),
    ).toContainText("React · 1");
    await esperarSinViolaciones(page);
    await page.screenshot({
      path: test.info().outputPath(`inicio-${width}.png`),
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.goto("/colectivos/cl-fiorito");
    await expect(page.getByRole("region", { name: "Historia" })).toContainText(
      "Publicó un proyecto.",
    );
    await expect(page.getByText("Todavía no recibió valoraciones.")).toBeVisible();
    await esperarSinViolaciones(page);
    await page.screenshot({
      path: test.info().outputPath(`colectivo-${width}.png`),
      fullPage: true,
    });
  }
  expect(noAtendidos).toEqual([]);
});
