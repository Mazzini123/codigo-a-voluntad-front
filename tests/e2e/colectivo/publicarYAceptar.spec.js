import { expect, test } from "@playwright/test";
import { esperarSinViolaciones } from "../apoyo/accesibilidad.js";
import { conBackFalso } from "../apoyo/backFalso.js";
import { unColectivo, unProyecto } from "../apoyo/datos.js";
import { conSesionIniciada } from "../apoyo/sesion.js";

const ID = "colectivo-simulado";

async function preparar(page, extra = () => {}) {
  const back = await conBackFalso(page, (inicial) => {
    inicial.colectivos.set(ID, unColectivo(ID, { nombre: "Huerta Comunitaria Sur" }));
    extra(inicial);
  });
  await conSesionIniciada(page, { rol: "COLECTIVO", perfilId: ID });
  return back;
}

function paso(page, nombre) {
  return page.getByRole("heading", { level: 2, name: nombre });
}

test("un colectivo publica un proyecto en tres pasos y llega a su detalle", async ({
  page,
}) => {
  const { estado, noAtendidos } = await preparar(page);

  await page.goto("/colectivo/proyectos/nuevo");
  await expect(paso(page, "El proyecto")).toBeVisible();
  await esperarSinViolaciones(page);
  await page.getByLabel(/^Título/).fill("Mapa de huertas");
  await page.getByLabel(/^Descripción/).fill("Un mapa para **coordinar** las huertas.");
  await page.getByLabel("Nueva etiqueta").fill("ambiente");
  await page.getByLabel("Nueva etiqueta").press("Enter");
  await page.getByLabel(/^Fecha de cierre del proyecto/).fill("2099-12-31");
  await page.getByRole("button", { name: "Siguiente" }).click();

  await expect(paso(page, "Los perfiles")).toBeVisible();
  await page.getByLabel(/^Qué necesitan/).fill("Desarrolladora de mapas");
  await page
    .getByRole("group", { name: /^Habilidades requeridas/ })
    .getByRole("checkbox", { name: "React" })
    .check();
  await page.getByLabel(/^¿Cuántas horas\?/).fill("4");
  await page.getByRole("button", { name: "Guardar perfil" }).click();
  await expect(page.getByRole("list", { name: "Perfiles cargados" })).toContainText(
    "Desarrolladora de mapas",
  );
  await esperarSinViolaciones(page);
  await page.getByRole("button", { name: "Siguiente" }).click();

  await expect(paso(page, "Revisar y publicar")).toBeVisible();
  await expect(page.locator("strong", { hasText: "coordinar" })).toBeVisible();
  await page.getByRole("button", { name: "Publicar proyecto" }).click();

  await expect(
    page.getByRole("heading", { level: 1, name: "Mapa de huertas" }),
  ).toBeVisible();
  await expect(page.getByText("Publicaste el proyecto.")).toBeVisible();
  await expect(page.getByText("Este proyecto es de tu colectivo")).toBeVisible();
  const [publicado] = [...estado.proyectos.values()].filter(
    (proyecto) => proyecto.colectivoId === ID,
  );
  expect(publicado).toMatchObject({ titulo: "Mapa de huertas", etiquetas: ["ambiente"] });
  expect(publicado.perfiles[0].habilidadesRequeridas.map(({ codigo }) => codigo)).toEqual(
    ["react"],
  );
  expect(noAtendidos).toEqual([]);
});

test("un colectivo acepta una postulación pendiente", async ({ page }) => {
  const { estado, noAtendidos } = await preparar(page, (inicial) => {
    inicial.proyectos.set("pc", {
      ...unProyecto("pc", {
        titulo: "Turnos de la huerta",
        colaboraciones: [
          {
            id: "col-ada",
            perfil: "pc-pe1",
            colaborador: { id: "co-ada", nombreFantasia: "Ada", nombre: "Ada" },
            esPublica: true,
            fecha: "2026-11-05T12:00:00.000Z",
            estado: "PENDIENTE",
            fechaResolucion: null,
            fechaFin: null,
            valoracionDelColectivo: null,
            valoracionDelColaborador: null,
          },
        ],
      }),
      colectivoId: ID,
    });
  });

  await page.goto("/proyectos/pc/postulaciones");
  const aceptar = page.getByRole("button", { name: "Aceptar" });
  await expect(aceptar).toBeVisible();
  await esperarSinViolaciones(page);
  await aceptar.click();

  const dialogo = page.getByRole("dialog", { name: "¿Aceptar la postulación?" });
  await expect(dialogo).toBeVisible();
  await dialogo.getByRole("button", { name: "Aceptar" }).click();

  await expect(page.getByText("Se aceptó la postulación.")).toBeVisible();
  expect(estado.proyectos.get("pc").colaboraciones[0].estado).toBe("ACEPTADA");
  expect(noAtendidos).toEqual([]);
});
