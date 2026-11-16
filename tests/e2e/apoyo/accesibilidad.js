import AxeBuilder from "@axe-core/playwright";
import { expect } from "@playwright/test";

const NORMAS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

function resumir(violaciones) {
  return violaciones.map(
    ({ id, impact, nodes }) =>
      `${id} (${impact}): ${nodes.map((nodo) => nodo.target.join(" ")).join(", ")}`,
  );
}

export async function esperarSinScrollHorizontal(page) {
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
}

export async function esperarEncabezadosEnOrden(page) {
  const saltos = await page.evaluate(() => {
    const niveles = [...document.querySelectorAll("main :is(h1, h2, h3, h4, h5, h6)")]
      .filter((titulo) => titulo.getClientRects().length > 0)
      .map((titulo) => ({ nivel: Number(titulo.tagName[1]), texto: titulo.textContent }));
    return niveles
      .filter(
        (actual, indice) => indice > 0 && actual.nivel > niveles[indice - 1].nivel + 1,
      )
      .map(({ nivel, texto }) => `h${nivel}: ${texto.slice(0, 60)}`);
  });
  expect(saltos).toEqual([]);
}

export async function esperarSinViolaciones(page) {
  await page.evaluate(async () => {
    await Promise.all(
      document
        .getAnimations()
        .filter((animacion) => animacion.effect?.getTiming().iterations !== Infinity)
        .map((animacion) => animacion.finished.catch(() => {})),
    );
  });
  const { violations } = await new AxeBuilder({ page }).withTags(NORMAS).analyze();
  expect(resumir(violations)).toEqual([]);
}
