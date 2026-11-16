import { expect, test } from "@playwright/test";
import { abrirComoAdministracion } from "../apoyo/administracion.js";
import {
  esperarSinScrollHorizontal,
  esperarSinViolaciones,
} from "../apoyo/accesibilidad.js";
import { unProyecto } from "../apoyo/datos.js";
import { esperarUnaSolaAccionCoral } from "../apoyo/diseno.js";

const TITULO = "Sistema de turnos del comedor";

function conProyectos(estado, cantidad) {
  for (let numero = 2; numero <= cantidad; numero++) {
    const id = `p${numero}`;
    estado.proyectos.set(id, {
      ...unProyecto(id, { titulo: `Proyecto ${numero}`, etiquetas: ["ambiente"] }),
      colectivoId: "cl-fiorito",
    });
  }
}

test("/admin lleva a destacados y se destaca, cambia y quita un proyecto con el teclado", async ({
  page,
}) => {
  const { estado, noAtendidos } = await abrirComoAdministracion(page, "/admin", {
    preparar: (inicial) => conProyectos(inicial, 2),
  });
  await expect(page).toHaveURL("/admin/destacados");
  const vigentes = page.getByRole("region", { name: "Destacados vigentes" });
  await expect(vigentes.getByText("Todavía no hay proyectos destacados")).toBeVisible();
  await expect(page.getByRole("list", { name: "Proyectos abiertos" })).toBeVisible();
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  await esperarUnaSolaAccionCoral(page);

  await page.getByRole("button", { name: `Destacar ${TITULO}` }).focus();
  await page.keyboard.press("Enter");
  const dialogo = page.getByRole("dialog", { name: `Destacar «${TITULO}»` });
  await expect(dialogo).toBeVisible();
  await expect(dialogo.getByRole("button", { name: "Cancelar" })).toBeFocused();
  await expect(dialogo.getByLabel(/Destacado hasta/)).not.toHaveValue("");
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  await dialogo.getByRole("button", { name: "Destacar", exact: true }).click();

  await expect(dialogo).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await expect(page.getByRole("status")).toContainText(`Destacaste «${TITULO}»`);
  const listaDeVigentes = page.getByRole("list", {
    name: "Proyectos destacados vigentes",
  });
  await expect(listaDeVigentes).toContainText(TITULO);
  await expect(listaDeVigentes.getByText(/^Hasta el \d+ de \w+ de \d{4}$/)).toBeVisible();
  await expect(vigentes).toContainText("1 lugar usado de 6");
  expect(estado.destacados.has("p1")).toBe(true);
  const hastaOriginal = estado.destacados.get("p1").hasta;

  const cambiarFecha = page.getByRole("button", { name: `Cambiar fecha de ${TITULO}` });
  await cambiarFecha.click();
  const cambiar = page.getByRole("dialog", { name: `Cambiar la fecha de «${TITULO}»` });
  await expect(cambiar.getByRole("button", { name: "Cancelar" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(cambiar).toBeHidden();
  await expect(cambiarFecha).toBeFocused();
  expect(estado.destacados.get("p1").hasta).toBe(hastaOriginal);

  await page.getByRole("button", { name: `Quitar ${TITULO} de los destacados` }).click();
  const quitar = page.getByRole("dialog", {
    name: `¿Quitar «${TITULO}» de los destacados?`,
  });
  await expect(quitar.getByRole("button", { name: "Cancelar" })).toBeFocused();
  await esperarSinViolaciones(page);
  await quitar.getByRole("button", { name: "Quitar destacado" }).click();
  await expect(quitar).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await expect(vigentes.getByText("Todavía no hay proyectos destacados")).toBeVisible();
  expect(estado.destacados.size).toBe(0);

  await page.goto("/admin/auditoria");
  const tabla = page.getByRole("table", { name: "Acciones administrativas" });
  await expect(tabla).toContainText("Destacó un proyecto");
  await expect(tabla).toContainText("Quitó un destacado");
  expect(noAtendidos).toEqual([]);
});

test("en el celular, el menú principal muestra todos los enlaces con el actual marcado", async ({
  page,
}) => {
  const { noAtendidos } = await abrirComoAdministracion(page, "/admin/destacados");
  await page.getByRole("button", { name: "Menú" }).click();
  const principal = page.getByRole("navigation", { name: "Principal" });
  await expect(principal.getByRole("link", { name: "Proyectos" })).toBeVisible();
  const actual = principal.getByRole("link", { name: "Administración" });
  await expect(actual).toBeVisible();
  await expect(actual).toHaveAttribute("aria-current", "page");
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  expect(noAtendidos).toEqual([]);
});

test("con el cupo completo, «Destacar» queda deshabilitado y explica por qué", async ({
  page,
}) => {
  const { noAtendidos } = await abrirComoAdministracion(page, "/admin/destacados", {
    preparar: (inicial) => {
      conProyectos(inicial, 7);
      for (let numero = 2; numero <= 7; numero++)
        inicial.destacados.set(`p${numero}`, {
          desde: "2026-11-01T12:00:00.000Z",
          hasta: "2027-01-31T23:59:59.000-03:00",
        });
    },
  });
  await expect(page.getByText("6 lugares usados de 6")).toBeVisible();
  const destacar = page.getByRole("button", { name: `Destacar ${TITULO}` });
  await expect(destacar).toBeDisabled();
  await expect(destacar).toHaveAccessibleDescription(
    "Ya hay 6 proyectos destacados. Quitá uno para sumar otro.",
  );
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  expect(noAtendidos).toEqual([]);
});

test("la búsqueda por etiqueta queda en la URL y se puede limpiar", async ({ page }) => {
  const { noAtendidos } = await abrirComoAdministracion(page, "/admin/destacados", {
    preparar: (inicial) => conProyectos(inicial, 2),
  });
  await expect(page.getByText("2 proyectos abiertos")).toBeVisible();
  await page.getByLabel("Buscar por etiqueta").fill("ambiente");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("/admin/destacados?etiqueta=ambiente");
  await expect(page.getByText("1 proyecto abierto")).toBeVisible();

  await page.getByLabel("Buscar por etiqueta").fill("inexistente");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await expect(
    page.getByText("No encontramos proyectos abiertos con la etiqueta «inexistente»"),
  ).toBeVisible();
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  await page.getByRole("button", { name: "Limpiar búsqueda" }).click();
  await expect(page).toHaveURL("/admin/destacados");
  await expect(page.getByText("2 proyectos abiertos")).toBeVisible();
  expect(noAtendidos).toEqual([]);
});

test("si fallan los destacados, se ve el error y se puede reintentar", async ({
  page,
}) => {
  const { estado, noAtendidos } = await abrirComoAdministracion(
    page,
    "/admin/destacados",
    {
      preparar: (inicial) =>
        inicial.fallas.add("GET /administracion/proyectos/destacados"),
    },
  );
  const vigentes = page.getByRole("region", { name: "Destacados vigentes" });
  await expect(vigentes.getByText("No pudimos cargar los destacados")).toBeVisible();
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  estado.fallas.clear();
  await vigentes.getByRole("button", { name: "Reintentar" }).click();
  await expect(vigentes.getByText("Todavía no hay proyectos destacados")).toBeVisible();
  expect(noAtendidos).toEqual([]);
});
