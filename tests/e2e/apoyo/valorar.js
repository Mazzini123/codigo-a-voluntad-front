import { expect } from "@playwright/test";
import { conBackFalso } from "./backFalso.js";
import { conSesionIniciada } from "./sesion.js";
import { esperarSinViolaciones } from "./accesibilidad.js";
import { unaColaboradora } from "./datos.js";

export async function finalizarYValorar(page, rol) {
  const esColectivo = rol === "COLECTIVO";
  const perfilId = esColectivo ? "cl-fiorito" : "colaboradora-simulada";
  const { estado, noAtendidos } = await conBackFalso(page, (inicial) => {
    inicial.colaboradores.set(
      "colaboradora-simulada",
      unaColaboradora("colaboradora-simulada"),
    );
    inicial.proyectos.get("p1").colaboraciones.push({
      id: "col1",
      perfil: "p1-pe1",
      estado: "PENDIENTE",
      colaborador: unaColaboradora("colaboradora-simulada"),
      esPublica: true,
      fecha: "2026-11-01T12:00:00Z",
      valoracionDelColectivo: null,
      valoracionDelColaborador: null,
    });
    if (!esColectivo) inicial.proyectos.get("p1").colaboraciones[0].estado = "ACEPTADA";
  });
  await conSesionIniciada(page, { rol, perfilId });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(
    esColectivo ? "/proyectos/p1/postulaciones" : "/colaboradora/postulaciones",
  );
  if (esColectivo) {
    await page.getByRole("button", { name: "Aceptar", exact: true }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Aceptar", exact: true })
      .click();
  }
  const finalizar = page.getByRole("button", {
    name: "Finalizar colaboración",
    exact: true,
  });
  await expect(finalizar).toBeVisible();
  await finalizar.focus();
  await page.keyboard.press("Enter");
  await esperarSinViolaciones(page);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Finalizar colaboración", exact: true })
    .click();
  await page.getByRole("button", { name: "Valorar", exact: true }).click();
  const dialogo = page.getByRole("dialog");
  await expect(dialogo.getByRole("button", { name: "Enviar valoración" })).toBeDisabled();
  await page.getByLabel(/^Puntaje/).selectOption("5");
  await page.getByLabel("Comentario").fill("Trabajamos muy bien en equipo.");
  await esperarSinViolaciones(page);
  await dialogo.getByRole("button", { name: "Enviar valoración" }).click();
  await expect(page.getByText("Tu valoración:")).toContainText("5 de 5");
  await expect(page.getByRole("button", { name: "Valorar", exact: true })).toHaveCount(0);
  const colaboracion = estado.proyectos.get("p1").colaboraciones[0];
  expect(colaboracion.estado).toBe("FINALIZADA");
  expect(
    colaboracion[esColectivo ? "valoracionDelColectivo" : "valoracionDelColaborador"]
      .puntaje,
  ).toBe(5);
  await page.goto(
    esColectivo ? "/colaboradoras/colaboradora-simulada" : "/colectivos/cl-fiorito",
  );
  await expect(
    page.getByRole("region", { name: "Valoraciones recibidas" }),
  ).toContainText("Trabajamos muy bien en equipo.");
  await esperarSinViolaciones(page);
  expect(
    await page.evaluate(() =>
      [...document.querySelectorAll("body *")]
        .filter(
          (elemento) => elemento.getBoundingClientRect().right > window.innerWidth + 1,
        )
        .map((elemento) => ({
          etiqueta: elemento.tagName,
          clase: elemento.className,
          texto: elemento.textContent.slice(0, 80),
        })),
    ),
  ).toEqual([]);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true);
  expect(noAtendidos).toEqual([]);
}
