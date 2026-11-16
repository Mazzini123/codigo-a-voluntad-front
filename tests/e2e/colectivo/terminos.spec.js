import { expect, test } from "@playwright/test";
import {
  esperarSinScrollHorizontal,
  esperarSinViolaciones,
} from "../apoyo/accesibilidad.js";
import { conBackFalso } from "../apoyo/backFalso.js";
import { unColectivo, unProyecto } from "../apoyo/datos.js";
import { conSesionIniciada } from "../apoyo/sesion.js";

const ID = "colectivo-simulado";
const CELULAR = { width: 320, height: 800 };

function terminos(version) {
  return {
    version,
    texto: `# Reglas de uso\n\nVersión ${version} de las reglas.`,
    publicadoEn: "2026-11-16T15:00:00.000Z",
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

async function llegarARevisar(page) {
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
}

test("al crear un proyecto acepta los términos vigentes y queda registrada la versión", async ({
  page,
}) => {
  const { estado, noAtendidos } = await preparar(page, (inicial) => {
    inicial.terminos.push(terminos(1), terminos(2));
  });
  await page.setViewportSize(CELULAR);
  await llegarARevisar(page);

  const acepto = page.getByRole("checkbox", {
    name: "Acepto los términos y condiciones (versión 2)",
  });
  await expect(acepto).not.toBeChecked();
  const enlace = page.getByRole("link", { name: /Leer los términos y condiciones/ });
  await expect(enlace).toHaveAttribute("href", "/terminos");
  await expect(enlace).toHaveAttribute("target", "_blank");
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);

  await page.getByRole("button", { name: "Publicar proyecto" }).click();
  await expect(acepto).toBeFocused();
  await expect(
    page.getByText("Aceptá los términos y condiciones para seguir."),
  ).toBeVisible();
  await esperarSinViolaciones(page);
  expect([...estado.proyectos.values()].filter((p) => p.colectivoId === ID)).toHaveLength(
    0,
  );

  await page.keyboard.press("Space");
  await expect(acepto).toBeChecked();
  await page.getByRole("button", { name: "Publicar proyecto" }).click();
  await expect(page.getByRole("status")).toContainText("Publicaste el proyecto.");
  const [creado] = [...estado.proyectos.values()].filter((p) => p.colectivoId === ID);
  expect(creado.terminos).toMatchObject({ version: 2 });
  expect(noAtendidos).toEqual([]);
});

test("si los términos cambian mientras completa el alta, recarga la versión nueva y la pide", async ({
  page,
}) => {
  const { estado, noAtendidos } = await preparar(page, (inicial) => {
    inicial.terminos.push(terminos(1));
  });
  await llegarARevisar(page);
  await page
    .getByRole("checkbox", { name: "Acepto los términos y condiciones (versión 1)" })
    .check();
  estado.terminos.push(terminos(2));

  await page.getByRole("button", { name: "Guardar como borrador" }).click();
  await expect(
    page.getByText(
      "Los términos y condiciones cambiaron mientras completabas el proyecto. Leé la versión nueva y aceptala para seguir.",
    ),
  ).toBeVisible();
  const nueva = page.getByRole("checkbox", {
    name: "Acepto los términos y condiciones (versión 2)",
  });
  await expect(nueva).not.toBeChecked();
  await esperarSinViolaciones(page);

  await nueva.check();
  await page.getByRole("button", { name: "Guardar como borrador" }).click();
  await expect(page).toHaveURL("/colectivo/proyectos");
  const [guardado] = [...estado.proyectos.values()].filter((p) => p.colectivoId === ID);
  expect(guardado).toMatchObject({ estado: "BORRADOR", terminos: { version: 2 } });
  expect(noAtendidos).toEqual([]);
});

test("sin términos publicados el alta no muestra la casilla", async ({ page }) => {
  const { noAtendidos } = await preparar(page);
  await llegarARevisar(page);
  await expect(page.getByRole("checkbox", { name: /términos/ })).toHaveCount(0);
  expect(noAtendidos).toEqual([]);
});

test("un proyecto dado de baja se ve en Mis proyectos con el motivo y sin acciones", async ({
  page,
}) => {
  const { noAtendidos } = await preparar(page, (inicial) => {
    inicial.proyectos.set("p9", {
      ...unProyecto("p9", {
        titulo: "Padrón del barrio",
        estado: "DADO_DE_BAJA",
        publicacion: null,
        baja: {
          motivo: "Publica datos personales sin consentimiento.",
          fecha: "2026-11-16T15:00:00.000Z",
        },
      }),
      colectivoId: ID,
    });
  });
  await page.setViewportSize(CELULAR);
  await page.goto("/colectivo/proyectos");
  const fila = page.getByRole("article", { name: "Padrón del barrio" });
  await expect(fila.getByText("Dado de baja", { exact: true })).toBeVisible();
  await expect(fila).toContainText(
    "Administración lo dio de baja el 16 de noviembre de 2026: Publica datos personales sin consentimiento.",
  );
  await expect(fila.getByRole("link", { name: "Administrar" })).toHaveCount(0);
  await expect(fila.getByRole("button", { name: /Pedir publicación/ })).toHaveCount(0);
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);

  await fila.getByRole("link", { name: "Padrón del barrio" }).click();
  const aviso = page.getByRole("region", { name: "Dado de baja" });
  await expect(aviso).toContainText("Publica datos personales sin consentimiento.");
  await expect(aviso.getByRole("link", { name: "Administrar proyecto" })).toHaveCount(0);
  await esperarSinViolaciones(page);
  expect(noAtendidos).toEqual([]);
});
