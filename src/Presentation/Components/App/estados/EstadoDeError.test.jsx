import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EstadoDeError } from "./EstadoDeError.jsx";

const ERROR = { mensaje: "No pudimos cargar.", esReintentable: true };

test("Reintentar muestra Reintentando… sin desmontar el error y vuelve a enfocar el título", async () => {
  const user = userEvent.setup();
  let terminar;
  const alReintentar = vi.fn(
    () =>
      new Promise((resolve) => {
        terminar = resolve;
      }),
  );
  render(
    <EstadoDeError
      titulo="No pudimos cargar"
      error={ERROR}
      alReintentar={alReintentar}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(screen.getByRole("button", { name: /Reintentando…/ })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "No pudimos cargar" })).toBeInTheDocument();
  terminar();
  expect(await screen.findByRole("button", { name: "Reintentar" })).toBeInTheDocument();
});

test("si el usuario está escribiendo, el primer error no le roba el foco", () => {
  const { rerender } = render(<input aria-label="Etiqueta" />);
  screen.getByLabelText("Etiqueta").focus();
  rerender(
    <>
      <input aria-label="Etiqueta" />
      <EstadoDeError titulo="No pudimos cargar" error={ERROR} />
    </>,
  );
  expect(screen.getByLabelText("Etiqueta")).toHaveFocus();
});

test("sin escribir, enfoca el título", () => {
  render(<EstadoDeError titulo="No pudimos cargar" error={ERROR} />);
  expect(screen.getByRole("heading", { name: "No pudimos cargar" })).toHaveFocus();
});
