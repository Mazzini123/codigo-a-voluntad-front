import { act, render, screen } from "@testing-library/react";
import { Esqueleto } from "./Esqueleto.jsx";

afterEach(() => vi.useRealTimers());

test("anuncia la etiqueta recién cuando aparece, no antes", () => {
  vi.useFakeTimers();
  render(<Esqueleto etiqueta="Cargando proyectos…">x</Esqueleto>);
  expect(screen.queryByText("Cargando proyectos…")).not.toBeInTheDocument();
  act(() => vi.advanceTimersByTime(300));
  expect(screen.getByText("Cargando proyectos…")).toBeInTheDocument();
});
