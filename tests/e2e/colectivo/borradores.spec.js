import { expect, test } from "@playwright/test";
import {
  esperarEncabezadosEnOrden,
  esperarSinScrollHorizontal,
  esperarSinViolaciones,
} from "../apoyo/accesibilidad.js";
import { conBackFalso } from "../apoyo/backFalso.js";
import { esperarUnaSolaAccionCoral } from "../apoyo/diseno.js";
import { unColectivo, unProyecto } from "../apoyo/datos.js";
import { conSesionIniciada } from "../apoyo/sesion.js";

const ID = "colectivo-simulado";
const CELULAR = { width: 320, height: 800 };
const RECHAZO = {
  nota: "Contá quién coordina el proyecto.",
  fecha: "2026-11-12T15:00:00.000Z",
};

function unBorrador(id, campos = {}) {
  return {
    ...unProyecto(id, {
      titulo: "Biblioteca popular",
      estado: "BORRADOR",
      publicacion: null,
      ...campos,
    }),
    colectivoId: ID,
  };
}

async function preparar(page, extra = () => {}) {
  const back = await conBackFalso(page, (inicial) => {
    inicial.colectivos.set(ID, unColectivo(ID, { nombre: "Huerta Comunitaria Sur" }));
    extra(inicial);
  });
  await conSesionIniciada(page, { rol: "COLECTIVO", perfilId: ID });
  return back;
}

function tarjeta(page, titulo) {
  return page.getByRole("article", { name: titulo });
}

test("un colectivo guarda el alta como borrador y lo encuentra en Mis proyectos", async ({
  page,
}) => {
  const { estado, noAtendidos } = await preparar(page);

  await page.goto("/colectivo/proyectos/nuevo");
  await page.getByLabel(/^Título/).fill("Mapa de huertas");
  await page.getByLabel(/^Descripción/).fill("Un mapa para coordinar las huertas.");
  await page.getByRole("button", { name: "Siguiente" }).click();
  await page.getByLabel(/^Qué necesitan/).fill("Desarrolladora de mapas");
  await page
    .getByRole("group", { name: /^Habilidades requeridas/ })
    .getByRole("checkbox", { name: "React" })
    .check();
  await page.getByLabel(/^¿Cuántas horas\?/).fill("4");
  await page.getByRole("button", { name: "Guardar perfil" }).click();
  await page.getByRole("button", { name: "Siguiente" }).click();

  await expect(
    page.getByRole("heading", { level: 2, name: "Revisar y publicar" }),
  ).toBeVisible();
  await esperarSinViolaciones(page);
  await page.getByRole("button", { name: "Guardar como borrador" }).click();

  await expect(page).toHaveURL("/colectivo/proyectos");
  await expect(page.getByRole("status")).toContainText("Guardaste el borrador.");
  const borrador = tarjeta(page, "Mapa de huertas");
  await expect(borrador.getByText("Borrador", { exact: true })).toBeVisible();
  await expect(
    borrador.getByRole("button", { name: "Pedir publicación de Mapa de huertas" }),
  ).toBeVisible();
  const [guardado] = [...estado.proyectos.values()].filter((p) => p.colectivoId === ID);
  expect(guardado).toMatchObject({ titulo: "Mapa de huertas", estado: "BORRADOR" });
  expect(guardado).not.toHaveProperty("borrador");
  await esperarSinViolaciones(page);
  expect(noAtendidos).toEqual([]);
});

test("pedir la publicación de un borrador lo deja en revisión y crea la revisión", async ({
  page,
}) => {
  const { estado, noAtendidos } = await preparar(page, (inicial) =>
    inicial.proyectos.set("pb", unBorrador("pb")),
  );
  await page.setViewportSize(CELULAR);
  await page.goto("/colectivo/proyectos");

  const borrador = tarjeta(page, "Biblioteca popular");
  await expect(borrador.getByText("Borrador", { exact: true })).toBeVisible();
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  await esperarEncabezadosEnOrden(page);

  await borrador
    .getByRole("button", { name: "Pedir publicación de Biblioteca popular" })
    .click();
  const dialogo = page.getByRole("dialog", { name: "¿Pedir la publicación?" });
  await expect(dialogo.getByRole("button", { name: "Cancelar" })).toBeFocused();
  await esperarSinViolaciones(page);
  await dialogo.getByRole("button", { name: "Pedir publicación" }).click();

  await expect(borrador.getByText("En revisión", { exact: true })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Pediste la publicación.");
  await expect(borrador.getByRole("link", { name: "Biblioteca popular" })).toBeFocused();
  await expect(borrador.getByRole("button", { name: /Pedir publicación/ })).toHaveCount(
    0,
  );
  expect(estado.proyectos.get("pb").estado).toBe("EN_REVISION");
  expect([...estado.revisiones.values()]).toEqual([
    expect.objectContaining({
      motivo: "PUBLICACION",
      estado: "PENDIENTE",
      proyecto: expect.objectContaining({ id: "pb", titulo: "Biblioteca popular" }),
    }),
  ]);

  await borrador.getByRole("link", { name: "Administrar" }).click();
  const aviso = page.getByRole("region", { name: "En revisión" });
  await expect(aviso).toContainText("no se puede editar");
  await expect(aviso).toContainText(
    "No te llega un aviso: el resultado lo ves acá y en Mis proyectos.",
  );
  await expect(page.getByRole("button", { name: "Editar proyecto" })).toHaveCount(0);
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  expect(noAtendidos).toEqual([]);
});

test("un borrador rechazado muestra la nota y se puede corregir", async ({ page }) => {
  const { noAtendidos } = await preparar(page, (inicial) =>
    inicial.proyectos.set(
      "pr",
      unBorrador("pr", {
        titulo: "Radio comunitaria",
        publicacion: { solicitadaEn: "2026-11-10T12:00:00.000Z", rechazo: RECHAZO },
      }),
    ),
  );
  await page.goto("/colectivo/proyectos");

  const rechazado = tarjeta(page, "Radio comunitaria");
  await expect(rechazado.getByText("Con cambios pedidos", { exact: true })).toBeVisible();
  await expect(rechazado).toContainText(
    "Administración pidió cambios el 12 de noviembre de 2026: Contá quién coordina el proyecto.",
  );
  await esperarSinViolaciones(page);

  await rechazado.getByRole("link", { name: "Administrar" }).click();
  const aviso = page.getByRole("region", { name: "Con cambios pedidos" });
  await expect(aviso).toContainText("Contá quién coordina el proyecto.");
  await expect(page.getByRole("button", { name: "Editar proyecto" })).toBeEnabled();
  await expect(page.getByRole("link", { name: "Ver postulaciones" })).toHaveCount(0);
  await esperarUnaSolaAccionCoral(page);
  await expect(page.getByRole("button", { name: "Editar proyecto" })).toHaveClass(
    /primario/,
  );
  await esperarSinViolaciones(page);
  await esperarEncabezadosEnOrden(page);
  expect(noAtendidos).toEqual([]);
});

test("con la fecha de cierre vencida, pedir la publicación explica qué cambiar", async ({
  page,
}) => {
  const { estado, noAtendidos } = await preparar(page, (inicial) =>
    inicial.proyectos.set(
      "pv",
      unBorrador("pv", { fechaCierre: "2026-01-01T23:59:59.000-03:00" }),
    ),
  );
  await page.goto("/colectivo/proyectos");
  const borrador = tarjeta(page, "Biblioteca popular");
  await borrador
    .getByRole("button", { name: "Pedir publicación de Biblioteca popular" })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Pedir publicación" })
    .click();
  await expect(borrador.getByRole("alert")).toHaveText(
    "La fecha de cierre ya pasó. Cambiala en el borrador y volvé a pedir la publicación.",
  );
  expect(estado.proyectos.get("pv").estado).toBe("BORRADOR");
  await esperarSinViolaciones(page);
  expect(noAtendidos).toEqual([]);
});
