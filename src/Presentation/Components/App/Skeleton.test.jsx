import { act, render, screen } from "@testing-library/react";
import { Skeleton } from "./Skeleton.jsx";

afterEach(() => vi.useRealTimers());

test("anuncia la etiqueta recién cuando aparece, no antes", () => {
  vi.useFakeTimers();
  render(<Skeleton etiqueta="Cargando proyectos…">x</Skeleton>);
  expect(screen.queryByText("Cargando proyectos…")).not.toBeInTheDocument();
  act(() => vi.advanceTimersByTime(300));
  expect(screen.getByText("Cargando proyectos…")).toBeInTheDocument();
});
