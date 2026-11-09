import { expect, test } from "@playwright/test";
import { finalizarYValorar } from "../apoyo/valorar.js";
import { conBackFalso } from "../apoyo/backFalso.js";
import { conSesionIniciada } from "../apoyo/sesion.js";
import { esperarSinViolaciones } from "../apoyo/accesibilidad.js";

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
    estadisticas.getByText("Visualizaciones", { exact: true }).first(),
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
