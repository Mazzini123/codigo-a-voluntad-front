import { expect } from "@playwright/test";

export async function esperarUnaSolaAccionCoral(page) {
  const corales = await page.evaluate(() => {
    const muestra = document.createElement("span");
    muestra.style.color = "var(--color-coral)";
    document.body.append(muestra);
    const coral = getComputedStyle(muestra).color;
    muestra.remove();
    return [...document.querySelectorAll("main :is(button, a)")]
      .filter((control) => control.getClientRects().length > 0)
      .filter((control) => getComputedStyle(control).backgroundColor === coral)
      .map((control) => control.textContent.trim());
  });
  expect(corales.length).toBeLessThanOrEqual(1);
}
