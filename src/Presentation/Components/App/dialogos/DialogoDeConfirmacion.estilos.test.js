import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const css = readFileSync(
  resolve(
    process.cwd(),
    "src/Presentation/Components/App/dialogos/DialogoDeConfirmacion.module.css",
  ),
  "utf8",
);

function bloque(selector) {
  const inicio = css.indexOf(`${selector} {`);
  return css.slice(inicio, css.indexOf("}", inicio));
}

test("el diálogo se centra con margin auto, porque el reset global le quita el margen", () => {
  expect(bloque(".dialogo")).toMatch(/margin:\s*auto/);
});

test("en celular las acciones se apilan en el orden del DOM: Cancelar arriba", () => {
  const celular = css.slice(css.indexOf("@media (width < 30rem)"));
  expect(celular).toMatch(/\.acciones\s*\{[^}]*flex-direction:\s*column;/);
  expect(celular).not.toMatch(/column-reverse/);
});
