import { expect, test } from "@playwright/test";
import { esperarSinViolaciones } from "../apoyo/accesibilidad.js";
import { conBackFalso } from "../apoyo/backFalso.js";

test("una cuenta nueva ingresa, elige ser colectivo y crea su perfil", async ({
  page,
}) => {
  const { estado, noAtendidos } = await conBackFalso(page);

  await page.goto("/bienvenida");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole("button", { name: "Ingresar" }).click();

  await expect(
    page.getByRole("heading", { level: 1, name: "¿Cómo vas a usar Código a Voluntad?" }),
  ).toBeVisible();
  await esperarSinViolaciones(page);
  await page.getByRole("link", { name: /Soy un colectivo/ }).click();

  await expect(
    page.getByRole("heading", { level: 1, name: "Creá el perfil de tu colectivo" }),
  ).toBeVisible();
  await esperarSinViolaciones(page);

  await page.getByRole("button", { name: "Crear perfil" }).click();
  await expect(page.getByLabel(/^Nombre/)).toBeFocused();
  await expect(page.getByLabel(/^Nombre/)).toHaveAttribute("aria-invalid", "true");

  await page.getByLabel(/^Nombre/).fill("Huerta Comunitaria Sur");
  await page.getByRole("radio", { name: "ONG" }).check();
  await page
    .getByLabel(/^Descripción/)
    .fill("Huertas en escuelas del barrio.\n\n- Talleres\n- **Semillero**");
  await page.getByRole("button", { name: "Crear perfil" }).click();

  await expect(page).toHaveURL(/\/colectivo\/resumen$/);
  await expect(page.getByText("Huerta Comunitaria Sur").first()).toBeVisible();
  const creados = [...estado.colectivos.values()].filter(
    (colectivo) => colectivo.nombre === "Huerta Comunitaria Sur",
  );
  expect(creados).toHaveLength(1);
  expect(creados[0].tipoColectivo).toBe("ONG");
  await esperarSinViolaciones(page);
  expect(noAtendidos).toEqual([]);
});
