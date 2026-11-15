import { expect, test } from "@playwright/test";
import { abrirComoAdministracion } from "../apoyo/administracion.js";
import {
  esperarSinScrollHorizontal,
  esperarSinViolaciones,
} from "../apoyo/accesibilidad.js";
import { unaAccionAdministrativa } from "../apoyo/datos.js";

function conAcciones(estado, cantidad = 3) {
  for (let numero = 1; numero <= cantidad; numero++) {
    estado.auditoria.push(
      unaAccionAdministrativa(`a${numero}`, {
        fecha: `2026-10-${String(numero).padStart(2, "0")}T15:00:00.000Z`,
      }),
    );
  }
}

function conAccionesVariadas(estado) {
  estado.auditoria.push(
    unaAccionAdministrativa("a1"),
    unaAccionAdministrativa("a2", {
      accion: "REVISION_RESUELTA",
      entidad: { tipo: "REVISION", id: "r1" },
      detalle: { estado: "DESCARTADA" },
      fecha: "2026-11-02T12:00:00.000Z",
    }),
    unaAccionAdministrativa("a3", {
      usuarioId: null,
      contextoId: null,
      accion: "ADMIN_OTORGADO",
      entidad: { tipo: "USUARIO", id: "u1" },
      detalle: null,
      fecha: "2026-10-15T12:00:00.000Z",
    }),
  );
}

test("la auditoría se lee en el celular y los filtros quedan en la URL", async ({
  page,
}) => {
  const { noAtendidos } = await abrirComoAdministracion(page, "/admin/auditoria", {
    preparar: conAccionesVariadas,
  });
  const tabla = page.getByRole("table", { name: "Acciones administrativas" });
  await expect(page.getByText("3 acciones")).toBeVisible();
  await expect(tabla).toContainText("Comando del sistema");
  await expect(tabla).toContainText("Descartada");
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);

  await page.getByLabel("Acción").selectOption("REVISION_RESUELTA");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page).toHaveURL("/admin/auditoria?accion=REVISION_RESUELTA");
  await expect(page.getByText("1 acción", { exact: true })).toBeVisible();

  await page.getByLabel("Desde").fill("2026-11-10");
  await page.getByLabel("Hasta").fill("2026-11-01");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(
    page.getByText("La fecha «hasta» no puede ser anterior a «desde».").first(),
  ).toBeVisible();
  await expect(page).toHaveURL("/admin/auditoria?accion=REVISION_RESUELTA");

  await page.getByLabel("Hasta").fill("2026-11-12");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page.getByText("No hay acciones con esos filtros")).toBeVisible();
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  await expect(page).toHaveURL("/admin/auditoria");
  await expect(page.getByText("3 acciones")).toBeVisible();
  expect(noAtendidos).toEqual([]);
});

test("al cambiar de página, la página queda en la URL y el foco va al conteo", async ({
  page,
}) => {
  const { noAtendidos } = await abrirComoAdministracion(page, "/admin/auditoria", {
    preparar: (inicial) => conAcciones(inicial, 25),
  });
  await expect(page.getByText("Mostrando 1–20 de 25 acciones")).toBeVisible();
  await page.getByRole("button", { name: "Página 2" }).click();
  await expect(page).toHaveURL("/admin/auditoria?pagina=2");
  await expect(page.getByText("Mostrando 21–25 de 25 acciones")).toBeFocused();
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  expect(noAtendidos).toEqual([]);
});

test("en escritorio, «Hasta» comparte fila con «Desde» en los filtros", async ({
  page,
}) => {
  const { noAtendidos } = await abrirComoAdministracion(page, "/admin/auditoria");
  for (const width of [1024, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const desde = await page.getByLabel("Desde").boundingBox();
    const hasta = await page.getByLabel("Hasta").boundingBox();
    expect(Math.round(hasta.y)).toBe(Math.round(desde.y));
  }
  expect(noAtendidos).toEqual([]);
});

test("en escritorio, la tabla no parte las palabras a la mitad", async ({ page }) => {
  const { noAtendidos } = await abrirComoAdministracion(page, "/admin/auditoria", {
    preparar: (inicial) => conAcciones(inicial, 3),
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  const tabla = page.getByRole("table", { name: "Acciones administrativas" });
  await expect(tabla).toBeVisible();
  const palabrasPartidas = await tabla.evaluate((elemento) =>
    [...elemento.querySelectorAll("th, td")].flatMap((celda) => {
      const caminante = document.createTreeWalker(celda, NodeFilter.SHOW_TEXT);
      const partidas = [];
      for (let nodo = caminante.nextNode(); nodo; nodo = caminante.nextNode()) {
        for (const palabra of nodo.textContent.matchAll(/\S+/g)) {
          const rango = document.createRange();
          rango.setStart(nodo, palabra.index);
          rango.setEnd(nodo, palabra.index + palabra[0].length);
          const lineas = new Set([...rango.getClientRects()].map((r) => Math.round(r.top)));
          if (lineas.size > 1) partidas.push(palabra[0]);
        }
      }
      return partidas;
    }),
  );
  expect(palabrasPartidas).toEqual([]);
  expect(noAtendidos).toEqual([]);
});

test("sin acciones, la auditoría muestra el vacío", async ({ page }) => {
  const { noAtendidos } = await abrirComoAdministracion(page, "/admin/auditoria");
  await expect(page.getByText("Todavía no hay acciones registradas")).toBeVisible();
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  expect(noAtendidos).toEqual([]);
});

test("sin permiso de auditoría, la pantalla lo explica sin consultar al back", async ({
  page,
}) => {
  const { noAtendidos } = await abrirComoAdministracion(page, "/admin/auditoria", {
    permisos: ["PROYECTO_DESTACAR", "REVISION_VER"],
  });
  await expect(page.getByText("Tu cuenta no puede ver la auditoría.")).toBeVisible();
  await expect(page.getByRole("table")).toHaveCount(0);
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  expect(noAtendidos).toEqual([]);
});

test("si falla la auditoría, se ve el error y se puede reintentar", async ({ page }) => {
  const { estado, noAtendidos } = await abrirComoAdministracion(
    page,
    "/admin/auditoria",
    { preparar: (inicial) => inicial.fallas.add("GET /administracion/auditoria") },
  );
  await expect(page.getByText("No pudimos cargar la auditoría")).toBeVisible();
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  estado.fallas.clear();
  await page.getByRole("button", { name: "Reintentar" }).click();
  await expect(page.getByText("Todavía no hay acciones registradas")).toBeVisible();
  expect(noAtendidos).toEqual([]);
});
