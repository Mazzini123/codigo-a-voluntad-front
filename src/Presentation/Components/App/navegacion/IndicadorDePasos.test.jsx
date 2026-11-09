import { render, screen, within } from "@testing-library/react";
import { IndicadorDePasos } from "./IndicadorDePasos.jsx";

const PASOS = ["El proyecto", "Los perfiles", "Revisar y publicar"];

function montar(actual) {
  render(
    <IndicadorDePasos pasos={PASOS} actual={actual} etiqueta="Pasos para publicar" />,
  );
  return screen.getByRole("list", { name: "Pasos para publicar" });
}

test("lista los tres pasos sin enlaces y marca solo el actual", () => {
  const lista = montar(2);
  const pasos = within(lista).getAllByRole("listitem");
  expect(pasos.map((paso) => paso.textContent)).toEqual([
    "1. El proyecto·",
    "2. Los perfiles·",
    "3. Revisar y publicar",
  ]);
  expect(within(lista).queryByRole("link")).not.toBeInTheDocument();
  expect(pasos.map((paso) => paso.getAttribute("aria-current"))).toEqual([
    null,
    "step",
    null,
  ]);
});

test("trae la versión compacta para celular", () => {
  montar(3);
  expect(screen.getByText("Paso 3 de 3 · Revisar y publicar")).toBeInTheDocument();
});
