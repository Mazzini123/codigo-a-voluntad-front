import { expect, test } from "@playwright/test";
import { esperarSinViolaciones } from "../apoyo/accesibilidad.js";
import { conBackFalso } from "../apoyo/backFalso.js";
import { unaColaboradora } from "../apoyo/datos.js";
import { conSesionIniciada } from "../apoyo/sesion.js";

const ID = "colaboradora-simulada";

test("una colaboradora encuentra un proyecto y se postula a un perfil", async ({
  page,
}) => {
  const { estado, noAtendidos } = await conBackFalso(page, (inicial) => {
    inicial.colaboradores.set(ID, unaColaboradora(ID));
  });
  await conSesionIniciada(page, { rol: "COLABORADORA", perfilId: ID });

  await page.goto("/proyectos");
  await expect(
    page.getByRole("heading", { level: 1, name: "Proyectos de colectivos sociales" }),
  ).toBeVisible();
  await esperarSinViolaciones(page);
  await page.getByRole("link", { name: "Sistema de turnos del comedor" }).first().click();

  await expect(
    page.getByRole("heading", { level: 1, name: "Sistema de turnos del comedor" }),
  ).toBeVisible();
  const perfil = page.getByRole("article", { name: "Desarrolladora frontend" });
  await perfil.getByRole("button", { name: "Postularme" }).click();

  const dialogo = page.getByRole("dialog", { name: "¿Te postulás a este perfil?" });
  await expect(dialogo).toBeVisible();
  await esperarSinViolaciones(page);
  await dialogo.getByRole("button", { name: "Enviar postulación" }).click();

  await expect(dialogo).toBeHidden();
  await expect(perfil.getByText("Tu postulación está pendiente")).toBeVisible();
  const [colaboracion] = estado.proyectos.get("p1").colaboraciones;
  expect(colaboracion).toMatchObject({ perfil: "p1-pe1", estado: "PENDIENTE" });
  expect(colaboracion.colaborador.id).toBe(ID);
  expect(noAtendidos).toEqual([]);
});

test("el diálogo se puede usar solo con el teclado y Escape lo cierra", async ({
  page,
}) => {
  await conBackFalso(page, (inicial) => {
    inicial.colaboradores.set(ID, unaColaboradora(ID));
  });
  await conSesionIniciada(page, { rol: "COLABORADORA", perfilId: ID });

  await page.goto("/proyectos/p1");
  const boton = page
    .getByRole("article", { name: "Desarrolladora frontend" })
    .getByRole("button", { name: "Postularme" });
  await boton.focus();
  await page.keyboard.press("Enter");
  const dialogo = page.getByRole("dialog", { name: "¿Te postulás a este perfil?" });
  await expect(dialogo).toBeVisible();
  await expect(dialogo.locator(":focus")).toHaveCount(1);

  await page.keyboard.press("Escape");
  await expect(dialogo).toBeHidden();
  await expect(boton).toBeFocused();
});
