import AxeBuilder from "@axe-core/playwright";
import { expect } from "@playwright/test";

const NORMAS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

function resumir(violaciones) {
  return violaciones.map(
    ({ id, impact, nodes }) =>
      `${id} (${impact}): ${nodes.map((nodo) => nodo.target.join(" ")).join(", ")}`,
  );
}

export async function esperarSinViolaciones(page) {
  const { violations } = await new AxeBuilder({ page }).withTags(NORMAS).analyze();
  expect(resumir(violations)).toEqual([]);
}
