import { expect, test } from "@playwright/test";
import { finalizarYValorar } from "../apoyo/valorar.js";
import { conBackFalso } from "../apoyo/backFalso.js";
import { conSesionIniciada } from "../apoyo/sesion.js";
import {
  esperarSinScrollHorizontal,
  esperarSinViolaciones,
} from "../apoyo/accesibilidad.js";

for (const ruta of ["/colectivo/resumen", "/colectivo/proyectos"]) {
  test(`en el celular, el menú principal de ${ruta} muestra todos los enlaces con el panel marcado`, async ({
    page,
  }) => {
    const { noAtendidos } = await conBackFalso(page);
    await conSesionIniciada(page, { rol: "COLECTIVO", perfilId: "cl-fiorito" });
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(ruta);
    await page.getByRole("button", { name: "Menú" }).click();
    const principal = page.getByRole("navigation", { name: "Principal" });
    await expect(principal.getByRole("link", { name: "Proyectos" })).toBeVisible();
    const actual = principal.getByRole("link", { name: "Panel del colectivo" });
    await expect(actual).toBeVisible();
    await expect(actual).toHaveAttribute("aria-current", "page");
    await esperarSinViolaciones(page);
    await esperarSinScrollHorizontal(page);
    expect(noAtendidos).toEqual([]);
  });
}

test("el colectivo acepta, finaliza y valora una colaboración", async ({ page }) => {
  await finalizarYValorar(page, "COLECTIVO");
});

test("el colectivo ve estadísticas y confirma su baja escribiendo el nombre", async ({
  page,
}) => {
  const { estado, noAtendidos } = await conBackFalso(page);
  await conSesionIniciada(page, { rol: "COLECTIVO", perfilId: "cl-fiorito" });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/colectivo/resumen");
  const estadisticas = page.getByRole("region", { name: "Tus proyectos en números" });
  await expect(
    estadisticas.getByText("Visitas", { exact: true }).first(),
  ).toBeVisible();
  await esperarSinViolaciones(page);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true);
  await page.goto("/colectivo/perfil");
  await page
    .getByRole("button", { name: "Dar de baja el colectivo", exact: true })
    .click();
  const dialogo = page.getByRole("dialog");
  const confirmar = dialogo.getByRole("button", {
    name: "Dar de baja el colectivo",
    exact: true,
  });
  await expect(confirmar).toBeDisabled();
  await page.getByLabel("Nombre del colectivo").fill("Asamblea de Fiorito");
  await esperarSinViolaciones(page);
  await confirmar.click();
  await expect(page).toHaveURL("/");
  expect(estado.colectivos.get("cl-fiorito").fechaBaja).toBeTruthy();
  expect(estado.proyectos.get("p1").estado).toBe("FINALIZADO");
  await page.goto("/colectivos/cl-fiorito");
  await expect(page.getByText(/Este colectivo se dio de baja el/)).toBeVisible();
  await expect(page.getByRole("region", { name: "Historia" })).toContainText(
    "El colectivo se dio de baja.",
  );
  expect(noAtendidos).toEqual([]);
});

test("en el celular, el menú de cuenta entra en la pantalla y muestra el nombre", async ({
  page,
}) => {
  const { noAtendidos } = await conBackFalso(page);
  await conSesionIniciada(page, { rol: "COLECTIVO", perfilId: "cl-fiorito" });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/colectivo/resumen");
  await page.getByRole("button", { name: "Mi cuenta", exact: true }).click();
  const menu = page.locator("#menu-de-cuenta");
  await expect(menu.getByText("Asamblea de Fiorito")).toBeVisible();
  const caja = await menu.boundingBox();
  expect(caja.x).toBeGreaterThanOrEqual(0);
  expect(caja.x + caja.width).toBeLessThanOrEqual(320);
  await esperarSinViolaciones(page);
  expect(noAtendidos).toEqual([]);
});
