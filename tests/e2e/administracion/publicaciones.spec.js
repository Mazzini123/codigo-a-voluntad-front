import { expect, test } from "@playwright/test";
import { abrirComoAdministracion } from "../apoyo/administracion.js";
import {
  esperarEncabezadosEnOrden,
  esperarSinScrollHorizontal,
  esperarSinViolaciones,
} from "../apoyo/accesibilidad.js";
import { unaRevision, unColectivo, unProyecto } from "../apoyo/datos.js";
import { esperarUnaSolaAccionCoral } from "../apoyo/diseno.js";

const FERIA = { id: "pf", titulo: "Feria del barrio" };
const RUTA = "/admin/revisiones?motivo=PUBLICACION";

function conPedidoDePublicacion(estado, campos = {}) {
  estado.colectivos.set("cl-sur", unColectivo("cl-sur", { nombre: "Huerta Sur" }));
  estado.proyectos.set(FERIA.id, {
    ...unProyecto(FERIA.id, {
      titulo: FERIA.titulo,
      estado: "EN_REVISION",
      publicacion: {
        solicitadaEn: "2026-11-14T12:00:00.000Z",
        revisionId: "rp",
        rechazo: null,
        aprobadaEn: null,
      },
      ...campos,
    }),
    colectivoId: "cl-sur",
  });
  estado.revisiones.set(
    "rp",
    unaRevision("rp", FERIA, {
      motivo: "PUBLICACION",
      creadaEn: "2026-11-14T12:00:00.000Z",
    }),
  );
}

test("administración aprueba una publicación y queda auditada", async ({ page }) => {
  const { estado, noAtendidos } = await abrirComoAdministracion(page, RUTA, {
    preparar: conPedidoDePublicacion,
  });
  const lista = page.getByRole("list", { name: "Revisiones pendientes" });
  await expect(lista).toContainText("Pidió publicar el proyecto");
  await expect(
    lista.getByRole("link", { name: `Ver vista previa de ${FERIA.titulo}` }),
  ).toHaveAttribute("href", `/proyectos/${FERIA.id}`);
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  await esperarEncabezadosEnOrden(page);
  await esperarUnaSolaAccionCoral(page);

  await page
    .getByRole("button", { name: `Aprobar la publicación de ${FERIA.titulo}` })
    .click();
  const dialogo = page.getByRole("dialog", {
    name: `Aprobar la publicación de «${FERIA.titulo}»`,
  });
  await expect(dialogo.getByRole("button", { name: "Cancelar" })).toBeFocused();
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  await dialogo.getByRole("button", { name: "Aprobar", exact: true }).click();

  await expect(page.getByRole("status")).toContainText(
    `Aprobaste la publicación de «${FERIA.titulo}».`,
  );
  await expect(page.getByText("No hay pedidos de publicación pendientes")).toBeVisible();
  expect(estado.proyectos.get(FERIA.id).estado).toBe("ABIERTO");
  expect(estado.auditoria).toEqual([
    expect.objectContaining({
      accion: "PROYECTO_PUBLICADO",
      entidad: { tipo: "PROYECTO", id: FERIA.id },
      detalle: { revisionId: "rp" },
    }),
  ]);

  await page.getByLabel("Estado").selectOption("REVISADA");
  await expect(page).toHaveURL(`${RUTA}&estado=REVISADA`);
  await expect(
    page.getByRole("list", { name: "Revisiones revisadas" }).getByText("Aprobada"),
  ).toBeVisible();
  await esperarSinViolaciones(page);
  expect(noAtendidos).toEqual([]);
});

test("administración pide cambios con una nota y la auditoría lo muestra en texto", async ({
  page,
}) => {
  const { estado, noAtendidos } = await abrirComoAdministracion(page, RUTA, {
    preparar: conPedidoDePublicacion,
  });
  await page
    .getByRole("button", { name: `Pedir cambios en la publicación de ${FERIA.titulo}` })
    .click();
  const dialogo = page.getByRole("dialog", {
    name: `Pedir cambios en «${FERIA.titulo}»`,
  });
  const nota = dialogo.getByLabel("Qué tiene que cambiar el colectivo (obligatorio)");
  await dialogo.getByRole("button", { name: "Pedir cambios", exact: true }).click();
  await expect(nota).toHaveAttribute("aria-invalid", "true");
  await expect(nota).toBeFocused();
  await expect(dialogo).toContainText(
    "Escribí qué tiene que cambiar el colectivo: es lo único que va a ver para corregir el proyecto.",
  );
  expect(estado.revisiones.get("rp").estado).toBe("PENDIENTE");
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);

  await nota.fill("Falta la fecha de inicio.");
  await esperarSinViolaciones(page);
  await dialogo.getByRole("button", { name: "Pedir cambios", exact: true }).click();

  await expect(page.getByRole("status")).toContainText(
    "Pediste cambios. El colectivo ve tu nota.",
  );
  expect(estado.proyectos.get(FERIA.id)).toMatchObject({
    estado: "BORRADOR",
    publicacion: { rechazo: { nota: "Falta la fecha de inicio." } },
  });

  await page.goto("/admin/auditoria");
  const tabla = page.getByRole("table", { name: "Acciones administrativas" });
  await expect(tabla).toContainText("Pidió cambios en la publicación de un proyecto");
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  expect(noAtendidos).toEqual([]);
});

test("si la fecha de cierre venció, aprobar lo explica y la revisión sigue pendiente", async ({
  page,
}) => {
  const { estado } = await abrirComoAdministracion(page, RUTA, {
    preparar: (inicial) =>
      conPedidoDePublicacion(inicial, { fechaCierre: "2026-01-01T23:59:59.000-03:00" }),
  });
  await page
    .getByRole("button", { name: `Aprobar la publicación de ${FERIA.titulo}` })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Aprobar", exact: true })
    .click();
  await expect(
    page.getByText(
      "La fecha de cierre del proyecto ya pasó. Pedí cambios con una nota para que el colectivo la corrija.",
    ),
  ).toBeVisible();
  expect(estado.revisiones.get("rp").estado).toBe("PENDIENTE");
  await expect(
    page.getByRole("button", {
      name: `Pedir cambios en la publicación de ${FERIA.titulo}`,
    }),
  ).toBeVisible();
  await esperarSinViolaciones(page);
});

test("la vista previa avisa que el proyecto no está publicado", async ({ page }) => {
  await abrirComoAdministracion(page, `/proyectos/${FERIA.id}`, {
    preparar: conPedidoDePublicacion,
  });
  await expect(page.getByRole("heading", { level: 1, name: FERIA.titulo })).toBeVisible();
  const aviso = page.getByRole("region", { name: "En revisión" });
  await expect(aviso).toContainText("Vista previa: todavía no está publicado.");
  await expect(aviso.getByRole("link", { name: "Ir a las revisiones" })).toHaveAttribute(
    "href",
    RUTA,
  );
  await expect(page.getByRole("button", { name: "Postularme" })).toHaveCount(0);
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
});

async function alto(locator) {
  return (await locator.boundingBox()).height;
}

test("desde la cola, la vista previa vuelve a las revisiones con el filtro y los enlaces se tocan bien", async ({
  page,
}) => {
  await abrirComoAdministracion(page, RUTA, { preparar: conPedidoDePublicacion });
  const vistaPrevia = page.getByRole("link", {
    name: `Ver vista previa de ${FERIA.titulo}`,
  });
  expect(await alto(vistaPrevia)).toBeGreaterThanOrEqual(44);
  await vistaPrevia.click();

  await expect(page.getByRole("heading", { level: 1, name: FERIA.titulo })).toBeVisible();
  const irARevisiones = page
    .getByRole("region", { name: "En revisión" })
    .getByRole("link", { name: "Ir a las revisiones" });
  expect(await alto(irARevisiones)).toBeGreaterThanOrEqual(44);
  await page.getByRole("link", { name: "Volver a las revisiones" }).click();
  await expect(page).toHaveURL(RUTA);
  await expect(
    page.getByRole("button", { name: `Aprobar la publicación de ${FERIA.titulo}` }),
  ).toBeVisible();
});

test("sin pedidos de publicación lo dice y ofrece ver todos los motivos", async ({
  page,
}) => {
  const { noAtendidos } = await abrirComoAdministracion(page, RUTA);
  await expect(page.getByText("No hay pedidos de publicación pendientes")).toBeVisible();
  await esperarSinViolaciones(page);
  await esperarSinScrollHorizontal(page);
  await page.getByRole("button", { name: "Ver todos los motivos" }).click();
  await expect(page).toHaveURL("/admin/revisiones");
  await expect(page.getByText("No hay proyectos para revisar")).toBeVisible();
  expect(noAtendidos).toEqual([]);
});

test("si fallan los pedidos de publicación, se ve el error y se puede reintentar", async ({
  page,
}) => {
  const { estado, noAtendidos } = await abrirComoAdministracion(page, RUTA, {
    preparar: (inicial) => {
      conPedidoDePublicacion(inicial);
      inicial.fallas.add("GET /administracion/revisiones");
    },
  });
  await expect(page.getByText("No pudimos cargar las revisiones")).toBeVisible();
  await esperarSinViolaciones(page);
  estado.fallas.clear();
  await page.getByRole("button", { name: "Reintentar" }).click();
  await expect(
    page.getByRole("button", { name: `Aprobar la publicación de ${FERIA.titulo}` }),
  ).toBeVisible();
  expect(noAtendidos).toEqual([]);
});
