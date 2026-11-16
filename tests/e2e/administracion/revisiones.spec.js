import { expect, test } from "@playwright/test";
import { abrirComoAdministracion } from "../apoyo/administracion.js";
import {
  esperarEncabezadosEnOrden,
  esperarSinScrollHorizontal,
  esperarSinViolaciones,
} from "../apoyo/accesibilidad.js";
import { unaRevision } from "../apoyo/datos.js";
import { esperarUnaSolaAccionCoral } from "../apoyo/diseno.js";

const TURNOS = { id: "p1", titulo: "Sistema de turnos del comedor" };
const HUERTA = { id: "p2", titulo: "Huerta comunitaria" };

function conRevisiones(estado, cantidad = 2) {
  const proyectos = [TURNOS, HUERTA];
  for (let numero = 1; numero <= cantidad; numero++) {
    const proyecto = proyectos[numero - 1] ?? {
      id: `p${numero}`,
      titulo: `Proyecto ${numero}`,
    };
    estado.revisiones.set(`r${numero}`, unaRevision(`r${numero}`, proyecto));
  }
}

test("se marca una revisión como revisada y otra se descarta, con el foco en orden", async ({
  page,
}) => {
  const { estado, noAtendidos } = await abrirComoAdministracion(
    page,
    "/admin/revisiones",
    { preparar: (inicial) => conRevisiones(inicial) },
  );
  await expect(page.getByText("2 revisiones")).toBeVisible();
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  await esperarUnaSolaAccionCoral(page);

  await page
    .getByRole("button", { name: `Marcar como revisada ${TURNOS.titulo}` })
    .focus();
  await page.keyboard.press("Enter");
  const dialogo = page.getByRole("dialog", {
    name: `Marcar como revisada «${TURNOS.titulo}»`,
  });
  await expect(dialogo.getByRole("button", { name: "Cancelar" })).toBeFocused();
  await dialogo.getByLabel("Nota (opcional)").fill("Hablé con el colectivo.");
  await expect(dialogo.getByText("23 de 1000 caracteres")).toBeVisible();
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  await dialogo.getByRole("button", { name: "Marcar como revisada" }).click();
  await expect(dialogo).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await expect(page.getByRole("status")).toContainText(
    "Marcaste la revisión como revisada.",
  );
  await expect(page.getByText("1 revisión", { exact: true })).toBeVisible();
  expect(estado.revisiones.get("r1")).toMatchObject({
    estado: "REVISADA",
    nota: "Hablé con el colectivo.",
  });

  await page.getByRole("button", { name: `Descartar ${HUERTA.titulo}` }).click();
  const descartar = page.getByRole("dialog", {
    name: `Descartar la revisión de «${HUERTA.titulo}»`,
  });
  await page.keyboard.press("Escape");
  await expect(descartar).toBeHidden();
  await expect(
    page.getByRole("button", { name: `Descartar ${HUERTA.titulo}` }),
  ).toBeFocused();
  expect(estado.revisiones.get("r2").estado).toBe("PENDIENTE");
  await page.getByRole("button", { name: `Descartar ${HUERTA.titulo}` }).click();
  await descartar.getByRole("button", { name: "Descartar", exact: true }).click();
  await expect(page.getByText("No hay proyectos para revisar")).toBeVisible();
  await esperarSinViolaciones(page);

  await page.getByLabel("Estado").selectOption("REVISADA");
  await expect(page).toHaveURL("/admin/revisiones?estado=REVISADA");
  const revisadas = page.getByRole("list", { name: "Revisiones revisadas" });
  await expect(revisadas).toContainText("Resuelta por vos");
  await expect(revisadas).toContainText("Hablé con el colectivo.");
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  expect(noAtendidos).toEqual([]);
});

test("sin permiso para resolver, las revisiones se ven pero no se pueden resolver", async ({
  page,
}) => {
  const { noAtendidos } = await abrirComoAdministracion(page, "/admin/revisiones", {
    preparar: (inicial) => conRevisiones(inicial),
    permisos: ["REVISION_VER"],
  });
  await expect(page.getByText("2 revisiones")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Marcar como revisada/ })).toHaveCount(
    0,
  );
  await expect(page.getByRole("button", { name: /^Descartar/ })).toHaveCount(0);
  await esperarSinViolaciones(page);
  await esperarEncabezadosEnOrden(page);
  expect(noAtendidos).toEqual([]);
});

test("al cambiar de página, la página queda en la URL y el foco va al conteo", async ({
  page,
}) => {
  const { noAtendidos } = await abrirComoAdministracion(page, "/admin/revisiones", {
    preparar: (inicial) => conRevisiones(inicial, 25),
  });
  await expect(page.getByText("Mostrando 1–20 de 25 revisiones")).toBeVisible();
  await page.getByRole("button", { name: "Página 2" }).click();
  await expect(page).toHaveURL("/admin/revisiones?pagina=2");
  await expect(page.getByText("Mostrando 21–25 de 25 revisiones")).toBeFocused();
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  expect(noAtendidos).toEqual([]);
});

test("si fallan las revisiones, se ve el error y se puede reintentar", async ({
  page,
}) => {
  const { estado, noAtendidos } = await abrirComoAdministracion(
    page,
    "/admin/revisiones",
    { preparar: (inicial) => inicial.fallas.add("GET /administracion/revisiones") },
  );
  await expect(page.getByText("No pudimos cargar las revisiones")).toBeVisible();
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  estado.fallas.clear();
  await page.getByRole("button", { name: "Reintentar" }).click();
  await expect(page.getByText("No hay proyectos para revisar")).toBeVisible();
  expect(noAtendidos).toEqual([]);
});
