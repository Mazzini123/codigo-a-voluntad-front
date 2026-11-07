import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Paginacion } from "./Paginacion.jsx";
import { numerosAlrededor } from "./numerosAlrededor.js";

test("ventana de tres números alrededor de la actual", () => {
  expect(numerosAlrededor(1, 5)).toEqual([1, 2, 3]);
  expect(numerosAlrededor(3, 5)).toEqual([2, 3, 4]);
  expect(numerosAlrededor(5, 5)).toEqual([3, 4, 5]);
  expect(numerosAlrededor(1, 2)).toEqual([1, 2]);
});

test("marca la página actual, ofrece las vecinas y navega", async () => {
  const user = userEvent.setup();
  const alCambiar = vi.fn();
  render(
    <Paginacion
      pagina={3}
      totalPaginas={5}
      etiqueta="Paginación"
      alCambiar={alCambiar}
    />,
  );
  const nav = screen.getByRole("navigation", { name: "Paginación" });
  const actual = nav.querySelector('[aria-current="page"]');
  expect(actual).toHaveTextContent("Página 3 de 5");
  expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
  expect(within(nav).getAllByRole("listitem")).toHaveLength(3);
  await user.click(within(nav).getByRole("button", { name: "Página 4" }));
  expect(alCambiar).toHaveBeenCalledWith(4);
  await user.click(within(nav).getByRole("button", { name: "Anterior" }));
  expect(alCambiar).toHaveBeenCalledWith(2);
});

test("no se muestra con una sola página", () => {
  const { container } = render(
    <Paginacion pagina={1} totalPaginas={1} etiqueta="Paginación" alCambiar={() => {}} />,
  );
  expect(container).toBeEmptyDOMElement();
});
