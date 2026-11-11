import { test, expect } from "@playwright/test";
import { esperarSinViolaciones } from "../e2e/apoyo/accesibilidad.js";

test("la demo permite recorrer los roles sin hacer pedidos al backend y conserva las valoraciones", async ({
  page,
}) => {
  const pedidos = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/")) pedidos.push(request.url());
  });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Resumen del colectivo", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Tus proyectos en números" }),
  ).toContainText("Proyectos abiertos");
  const barra = page.getByRole("complementary", { name: "Controles de la demo" });
  await esperarSinViolaciones(page);
  await barra.getByLabel("Ver como").selectOption("COLABORADORA");
  await expect(
    page.getByRole("heading", { name: "Mis postulaciones", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Valorar", exact: true }).click();
  await page.getByLabel(/^Puntaje/).selectOption("5");
  await page.getByLabel("Comentario").fill("Probando la demo sin backend");
  await page.getByRole("button", { name: "Enviar valoración" }).click();
  await expect(page.getByText("Tu valoración:")).toContainText(
    "Probando la demo sin backend",
  );
  await barra.getByLabel("Ver como").selectOption("VISITANTE");
  await expect(
    page.getByRole("region", { name: "La plataforma en números" }),
  ).toContainText("React");
  await page.goto("/colectivos/colectivo-simulado");
  await expect(
    page.getByRole("region", { name: "Valoraciones recibidas" }),
  ).toContainText("Probando la demo sin backend");
  await expect(page.getByRole("region", { name: "Historia" })).toContainText(
    "Publicó un proyecto.",
  );
  await barra.getByLabel("Ver como").selectOption("COLABORADORA");
  await expect(
    page.getByRole("heading", { name: "Mis postulaciones", exact: true }),
  ).toBeVisible();
  await page.goto("/mensajes");
  await expect(page.getByText("Te invitamos a sumarte a la huerta")).toBeVisible();
  await esperarSinViolaciones(page);
  await barra.getByLabel("Ver como").selectOption("SIN_PERFIL");
  await expect(
    page.getByRole("heading", { name: "¿Cómo vas a usar Código a Voluntad?" }),
  ).toBeVisible();
  await barra.getByRole("button", { name: "Reiniciar ejemplos" }).click();
  await expect(
    page.getByRole("heading", { name: "Resumen del colectivo", exact: true }),
  ).toBeVisible();
  await barra.getByLabel("Ver como").selectOption("COLABORADORA");
  await expect(page.getByRole("button", { name: "Valorar", exact: true })).toBeVisible();
  expect(pedidos).toEqual([]);
});

test("administración, avances, perfil y búsqueda de colaboradoras tienen datos de ejemplo", async ({
  page,
}) => {
  await page.goto("/proyectos/demo-huerta/administrar");
  await expect(page.getByRole("heading", { level: 1 })).not.toContainText("No pudimos");
  await page.goto("/proyectos/demo-huerta/avance");
  await expect(page.getByText("Primer prototipo")).toBeVisible();
  await page.goto("/proyectos/demo-huerta/perfiles/demo-huerta-pe1/colaboradoras");
  await expect(page.getByRole("heading", { name: "Ada", exact: true })).toBeVisible();
  await page.goto("/colectivo/perfil");
  await expect(page.getByLabel(/^Nombre \(obligatorio\)$/)).toHaveValue(
    "Huerta Comunitaria Sur",
  );
  await expect(
    page.getByRole("button", { name: "Dar de baja el colectivo", exact: true }),
  ).toBeVisible();
});
