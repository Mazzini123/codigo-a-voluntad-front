import { act, fireEvent, renderHook, screen, within } from "@testing-library/react";
import { ProveedorDeAvisos, DURACION_AVISO_MS } from "./ProveedorDeAvisos.jsx";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";

let avisar;

function montar() {
  const { result } = renderHook(() => useAvisos(), { wrapper: ProveedorDeAvisos });
  avisar = result.current;
}

function regionDeEstado() {
  return screen.getByRole("status");
}

beforeEach(() => {
  vi.useFakeTimers();
  montar();
});

afterEach(() => {
  vi.useRealTimers();
});

test("muestra el éxito en la región de estado y el error en la de alerta", () => {
  act(() => {
    avisar.exito("Habilidad creada correctamente.");
    avisar.error("No pudimos guardar el perfil.");
  });
  expect(regionDeEstado()).toHaveTextContent("Habilidad creada correctamente.");
  expect(screen.getByRole("alert")).toHaveTextContent("No pudimos guardar el perfil.");
});

test("el éxito se cierra solo a los 6 segundos", () => {
  act(() => {
    avisar.exito("Guardado.");
  });
  act(() => vi.advanceTimersByTime(DURACION_AVISO_MS - 1));
  expect(regionDeEstado()).toHaveTextContent("Guardado.");
  act(() => vi.advanceTimersByTime(1));
  expect(regionDeEstado()).toBeEmptyDOMElement();
});

test("con el mouse encima no se cierra y al salir sigue contando lo que faltaba", () => {
  act(() => {
    avisar.exito("Guardado.");
  });
  act(() => vi.advanceTimersByTime(2000));
  const aviso = within(regionDeEstado()).getByText("Guardado.").parentElement;
  fireEvent.mouseEnter(aviso);
  act(() => vi.advanceTimersByTime(20000));
  expect(regionDeEstado()).toHaveTextContent("Guardado.");
  fireEvent.mouseLeave(aviso);
  act(() => vi.advanceTimersByTime(DURACION_AVISO_MS - 2000 - 1));
  expect(regionDeEstado()).toHaveTextContent("Guardado.");
  act(() => vi.advanceTimersByTime(1));
  expect(regionDeEstado()).toBeEmptyDOMElement();
});

test("con el foco adentro no se cierra", () => {
  act(() => {
    avisar.info("Se comparten cuando aceptes su postulación.");
  });
  act(() => screen.getByRole("button", { name: "Cerrar aviso" }).focus());
  act(() => vi.advanceTimersByTime(DURACION_AVISO_MS * 3));
  expect(regionDeEstado()).toHaveTextContent("Se comparten");
});

test("el error queda hasta que se cierra con su botón", () => {
  act(() => {
    avisar.error("No pudimos guardar el perfil.");
  });
  act(() => vi.advanceTimersByTime(DURACION_AVISO_MS * 5));
  const alerta = screen.getByRole("alert");
  expect(alerta).toHaveTextContent("No pudimos guardar el perfil.");
  fireEvent.click(within(alerta).getByRole("button", { name: "Cerrar aviso" }));
  expect(alerta).toBeEmptyDOMElement();
});

test("muestra como máximo tres y se va primero el más viejo", () => {
  act(() => {
    ["Uno", "Dos", "Tres", "Cuatro"].forEach((texto) => avisar.exito(texto));
  });
  const textos = within(regionDeEstado())
    .getAllByRole("paragraph")
    .map((p) => p.textContent);
  expect(textos).toEqual(["Dos", "Tres", "Cuatro"]);
});

test("cerrar(id) cierra un aviso antes de tiempo", () => {
  act(() => {
    const id = avisar.exito("Guardado.");
    avisar.cerrar(id);
  });
  expect(regionDeEstado()).toBeEmptyDOMElement();
});

test("useAvisos fuera del provider lanza un error claro", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => renderHook(() => useAvisos())).toThrow(
    "useAvisos se usa dentro de <ProveedorDeAvisos>.",
  );
});
