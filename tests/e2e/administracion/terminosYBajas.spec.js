import { expect, test } from "@playwright/test";
import {
  esperarEncabezadosEnOrden,
  esperarSinScrollHorizontal,
  esperarSinViolaciones,
} from "../apoyo/accesibilidad.js";
import { abrirComoAdministracion } from "../apoyo/administracion.js";
import { unColectivo, unProyecto } from "../apoyo/datos.js";

const TITULO = "Sistema de turnos del comedor";

const VERSION_1 = {
  version: 1,
  texto: "# Uso de la plataforma\n\nTratá a las demás personas con **respeto**.",
  publicadoEn: "2026-11-10T15:00:00.000Z",
};

test("publica una versión nueva de los términos con confirmación y queda en la auditoría", async ({
  page,
}) => {
  const { estado, noAtendidos } = await abrirComoAdministracion(page, "/admin/terminos", {
    preparar: (inicial) => inicial.terminos.push(VERSION_1),
  });
  await expect(
    page.getByRole("heading", { level: 1, name: "Términos y condiciones" }),
  ).toBeVisible();
  const vigente = page.getByRole("region", { name: "Versión vigente" });
  await expect(
    vigente.getByText("Versión 1, publicada el 10 de noviembre de 2026"),
  ).toBeVisible();
  await expect(vigente.locator("strong")).toHaveText("respeto");
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  await esperarEncabezadosEnOrden(page);

  await page.getByRole("button", { name: "Editar los términos" }).click();
  const campo = page.getByLabel(/^Texto de los términos/);
  await expect(campo).toBeFocused();
  await campo.fill("# Uso de la plataforma\n\nNo publiques datos personales.");
  await esperarSinViolaciones(page);
  await page.getByRole("button", { name: "Publicar versión 2" }).click();

  const dialogo = page.getByRole("dialog", {
    name: "¿Publicar la versión 2 de los términos?",
  });
  await expect(dialogo.getByRole("button", { name: "Cancelar" })).toBeFocused();
  await expect(dialogo).toContainText("Esta acción no se puede deshacer.");
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  await dialogo.getByRole("button", { name: "Publicar versión 2" }).click();

  await expect(dialogo).toBeHidden();
  await expect(page.getByRole("status")).toContainText(
    "Publicaste la versión 2 de los términos.",
  );
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await expect(vigente.getByText(/^Versión 2/)).toBeVisible();
  await expect(vigente).toContainText("No publiques datos personales.");
  expect(estado.terminos.map(({ version }) => version)).toEqual([1, 2]);

  await page.goto("/admin/auditoria");
  const tabla = page.getByRole("table", { name: "Acciones administrativas" });
  await expect(tabla).toContainText("Publicó una versión de los términos");
  await expect(tabla).toContainText("Versión 2");
  expect(noAtendidos).toEqual([]);
});

test("sin términos publicados ofrece escribir la primera versión", async ({ page }) => {
  const { noAtendidos } = await abrirComoAdministracion(page, "/admin/terminos");
  await expect(
    page.getByRole("heading", { name: "Todavía no hay términos publicados" }),
  ).toBeVisible();
  await esperarSinViolaciones(page);
  await page.getByRole("button", { name: "Escribir los términos" }).click();
  await expect(page.getByLabel(/^Texto de los términos/)).toHaveValue("");
  expect(noAtendidos).toEqual([]);
});

test("si los términos no cargan, ofrece reintentar", async ({ page }) => {
  const { estado } = await abrirComoAdministracion(page, "/admin/terminos", {
    preparar: (inicial) => {
      inicial.terminos.push(VERSION_1);
      inicial.fallas.add("GET /terminos");
    },
  });
  await expect(
    page.getByRole("heading", { name: "No pudimos cargar los términos" }),
  ).toBeVisible();
  await esperarSinViolaciones(page);
  estado.fallas.clear();
  await page.getByRole("button", { name: "Reintentar" }).click();
  await expect(page.getByText(/^Versión 1/)).toBeVisible();
});

test("da de baja un proyecto con motivo; el colectivo deja de verlo publicado y queda auditado", async ({
  page,
}) => {
  const { estado, noAtendidos } = await abrirComoAdministracion(page, "/admin/bajas");
  await expect(
    page.getByRole("heading", { level: 1, name: "Bajas por infracción" }),
  ).toBeVisible();
  const lista = page.getByRole("list", { name: "Proyectos" });
  await expect(lista.getByRole("listitem")).toHaveCount(1);
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  await esperarEncabezadosEnOrden(page);

  await page.getByRole("button", { name: `Dar de baja ${TITULO}` }).click();
  const dialogo = page.getByRole("dialog", { name: `¿Dar de baja «${TITULO}»?` });
  await expect(dialogo.getByRole("button", { name: "Cancelar" })).toBeFocused();
  await expect(dialogo).toContainText("Esta acción no se puede deshacer.");
  await dialogo.getByRole("button", { name: "Dar de baja" }).click();
  await expect(dialogo.getByLabel(/^Motivo/)).toBeFocused();
  await expect(dialogo.getByText("Contá el motivo de la baja.")).toBeVisible();
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);

  await dialogo
    .getByLabel(/^Motivo/)
    .fill("Publica datos personales sin consentimiento.");
  await dialogo.getByRole("button", { name: "Dar de baja" }).click();
  await expect(dialogo).toBeHidden();
  await expect(page.getByRole("status")).toContainText(
    `Diste de baja «${TITULO}». El colectivo ve el motivo en Mis proyectos.`,
  );
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await expect(
    page.getByRole("heading", { name: "No hay proyectos para dar de baja" }),
  ).toBeVisible();
  expect(estado.proyectos.get("p1")).toMatchObject({
    estado: "DADO_DE_BAJA",
    baja: { motivo: "Publica datos personales sin consentimiento." },
  });

  await page.goto("/admin/auditoria");
  const tabla = page.getByRole("table", { name: "Acciones administrativas" });
  await expect(tabla).toContainText("Dio de baja un proyecto");
  await expect(tabla).toContainText(
    "Motivo: Publica datos personales sin consentimiento.",
  );
  expect(noAtendidos).toEqual([]);
});

test("filtra por estado, busca un borrador por el título sin tildes y lo da de baja", async ({
  page,
}) => {
  const { estado, noAtendidos } = await abrirComoAdministracion(page, "/admin/bajas", {
    preparar: (inicial) =>
      inicial.proyectos.set("p2", {
        ...unProyecto("p2", { titulo: "Padrón del barrio", estado: "BORRADOR" }),
        colectivoId: "cl-fiorito",
      }),
  });
  const lista = page.getByRole("list", { name: "Proyectos" });
  await expect(lista.getByRole("listitem")).toHaveCount(2);
  await expect(lista.getByText("Borrador")).toBeVisible();

  await page.getByLabel("Estado").selectOption("BORRADOR");
  await expect(page).toHaveURL("/admin/bajas?estado=BORRADOR");
  await expect(lista.getByRole("listitem")).toHaveCount(1);
  await page.getByLabel("Buscar por título o colectivo").fill("padron");
  await page.getByLabel("Buscar por título o colectivo").press("Enter");
  await expect(page).toHaveURL("/admin/bajas?estado=BORRADOR&q=padron");
  await expect(lista.getByRole("listitem")).toHaveCount(1);
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);

  await page.getByRole("button", { name: "Dar de baja Padrón del barrio" }).click();
  const dialogo = page.getByRole("dialog", { name: "¿Dar de baja «Padrón del barrio»?" });
  await dialogo.getByLabel(/^Motivo/).fill("Publica datos personales.");
  await dialogo.getByRole("button", { name: "Dar de baja" }).click();
  await expect(dialogo).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "No encontramos proyectos con «padron»" }),
  ).toBeVisible();
  expect(estado.proyectos.get("p2").estado).toBe("DADO_DE_BAJA");
  expect(noAtendidos).toEqual([]);
});

test("busca un colectivo por nombre y lo da de baja", async ({ page }) => {
  const { estado, noAtendidos } = await abrirComoAdministracion(page, "/admin/bajas", {
    preparar: (inicial) => {
      inicial.colectivos.set(
        "cl-huerta",
        unColectivo("cl-huerta", { nombre: "Huerta Comunitaria Sur" }),
      );
      inicial.proyectos.set("p2", {
        ...unProyecto("p2", { titulo: "Mapa de huertas" }),
        colectivoId: "cl-huerta",
      });
    },
  });
  await page.getByRole("radio", { name: "Un colectivo" }).click();
  await expect(page).toHaveURL("/admin/bajas?tipo=colectivo");
  await expect(page.getByRole("radio", { name: "Un colectivo" })).toBeChecked();
  await page.getByLabel("Buscar por nombre").fill("huerta");
  await page.getByLabel("Buscar por nombre").press("Enter");
  await expect(page).toHaveURL("/admin/bajas?tipo=colectivo&q=huerta");
  const lista = page.getByRole("list", { name: "Colectivos" });
  await expect(lista.getByRole("listitem")).toHaveCount(1);
  await esperarSinViolaciones(page);

  await lista.getByRole("button", { name: "Dar de baja Huerta Comunitaria Sur" }).click();
  const dialogo = page.getByRole("dialog", {
    name: "¿Dar de baja «Huerta Comunitaria Sur»?",
  });
  await dialogo.getByLabel(/^Motivo/).fill("Organización en infracción.");
  await dialogo.getByRole("button", { name: "Dar de baja" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Diste de baja «Huerta Comunitaria Sur». Sus proyectos abiertos se finalizaron.",
  );
  await expect(
    page.getByRole("heading", { name: "No encontramos colectivos con «huerta»" }),
  ).toBeVisible();
  expect(estado.colectivos.get("cl-huerta").fechaBaja).not.toBeNull();
  expect(estado.proyectos.get("p2").estado).toBe("FINALIZADO");
  expect(estado.auditoria.at(-1)).toMatchObject({
    accion: "COLECTIVO_DADO_DE_BAJA",
    entidad: { tipo: "COLECTIVO", id: "cl-huerta" },
    detalle: { motivo: "Organización en infracción." },
  });
  expect(noAtendidos).toEqual([]);
});

test("sin colectivos activos lo dice y si la búsqueda falla ofrece reintentar", async ({
  page,
}) => {
  const { estado } = await abrirComoAdministracion(page, "/admin/bajas?tipo=colectivo", {
    preparar: (inicial) => inicial.fallas.add("GET /colectivos"),
  });
  await expect(
    page.getByRole("heading", { name: "No pudimos cargar los colectivos" }),
  ).toBeVisible();
  await esperarSinViolaciones(page);
  estado.fallas.clear();
  estado.colectivos.clear();
  await page.getByRole("button", { name: "Reintentar" }).click();
  await expect(
    page.getByRole("heading", { name: "No hay colectivos activos" }),
  ).toBeVisible();
  await esperarSinViolaciones(page);
});

test("sin los permisos nuevos no aparecen las secciones", async ({ page }) => {
  await abrirComoAdministracion(page, "/admin/terminos", {
    permisos: ["AUDITORIA_VER"],
  });
  await expect(
    page.getByText("Tu cuenta no puede gestionar los términos y condiciones."),
  ).toBeVisible();
  await page.goto("/admin/auditoria");
  const menu = page.getByRole("navigation", { name: "Secciones de administración" });
  await expect(menu.getByRole("link", { name: "Términos" })).toHaveCount(0);
  await expect(menu.getByRole("link", { name: "Bajas por infracción" })).toHaveCount(0);
});
