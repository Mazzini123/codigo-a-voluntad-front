import { expect, test } from "@playwright/test";
import {
  esperarEncabezadosEnOrden,
  esperarSinScrollHorizontal,
  esperarSinViolaciones,
} from "../apoyo/accesibilidad.js";
import { conBackFalso } from "../apoyo/backFalso.js";

const CELULAR = { width: 320, height: 800 };

const TERMINOS = {
  version: 2,
  texto:
    "# Uso de la plataforma\n\nTratá a las demás personas con **respeto**.\n\n# Proyectos\n\n- Sin datos personales sin consentimiento\n- Sin fines comerciales encubiertos",
  publicadoEn: "2026-11-16T15:00:00.000Z",
};

test("desde el pie se llega a los términos vigentes, con su versión, en el celular", async ({
  page,
}) => {
  const { noAtendidos } = await conBackFalso(page, (estado) => {
    estado.terminos.push(TERMINOS);
  });
  await page.setViewportSize(CELULAR);
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Información del sitio" })
    .getByRole("link", { name: "Términos y condiciones" })
    .click();

  await expect(page).toHaveURL("/terminos");
  await expect(
    page.getByRole("heading", { level: 1, name: "Términos y condiciones" }),
  ).toBeVisible();
  await expect(
    page.getByText("Versión 2, publicada el 16 de noviembre de 2026"),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Uso de la plataforma" }),
  ).toBeVisible();
  await expect(page.locator("main strong")).toHaveText("respeto");
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  await esperarEncabezadosEnOrden(page);
  expect(noAtendidos).toEqual([]);
});

test("sin términos publicados lo dice sin mostrar un error", async ({ page }) => {
  const { noAtendidos } = await conBackFalso(page);
  await page.goto("/terminos");
  await expect(
    page.getByRole("heading", { name: "Todavía no hay términos publicados" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Reintentar" })).toHaveCount(0);
  await esperarSinViolaciones(page);
  expect(noAtendidos).toEqual([]);
});

test("si falla la carga ofrece reintentar", async ({ page }) => {
  const { estado } = await conBackFalso(page, (inicial) => {
    inicial.terminos.push(TERMINOS);
    inicial.fallas.add("GET /terminos");
  });
  await page.goto("/terminos");
  await expect(
    page.getByRole("heading", { name: "No pudimos cargar los términos" }),
  ).toBeVisible();
  await esperarSinViolaciones(page);
  estado.fallas.clear();
  await page.getByRole("button", { name: "Reintentar" }).click();
  await expect(page.getByText(/^Versión 2/)).toBeVisible();
});
