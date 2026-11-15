import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectorDeHabilidades } from "./SelectorDeHabilidades.jsx";

const CATALOGO = [
  { codigo: "diseno", titulo: "Diseño UX" },
  { codigo: "python", titulo: "Python" },
  { codigo: "react", titulo: "React" },
  { codigo: "realidad", titulo: "Realidad aumentada" },
];

function Prueba({ catalogo = { habilidades: CATALOGO }, iniciales = [], minimo = 0 }) {
  const [elegidas, setElegidas] = useState(iniciales);
  return (
    <SelectorDeHabilidades
      catalogo={catalogo}
      elegidas={elegidas}
      minimo={minimo}
      motivoMinimo="Necesitás al menos una habilidad."
      alMarcar={(h) => setElegidas((lista) => [...lista, h])}
      alDesmarcar={(h) =>
        setElegidas((lista) => lista.filter((o) => o.codigo !== h.codigo))
      }
    />
  );
}

test("filtra mientras se escribe, sin distinguir tildes ni mayúsculas, y anuncia la cantidad", async () => {
  const user = userEvent.setup();
  render(<Prueba />);
  await user.type(screen.getByRole("searchbox", { name: "Buscar habilidad" }), "REA");
  expect(screen.getAllByRole("checkbox").map((c) => c.parentElement.textContent)).toEqual(
    ["React", "Realidad aumentada"],
  );
  expect(screen.getByText("2 habilidades")).toBeInTheDocument();
  await user.clear(screen.getByRole("searchbox"));
  await user.type(screen.getByRole("searchbox"), "diseno");
  expect(screen.getByRole("checkbox", { name: "Diseño UX" })).toBeInTheDocument();
});

test("se marca con el teclado y aparece como elegida", async () => {
  const user = userEvent.setup();
  render(<Prueba />);
  await user.click(screen.getByRole("searchbox"));
  await user.tab();
  await user.keyboard(" ");
  expect(screen.getByRole("checkbox", { name: "Diseño UX" })).toBeChecked();
  const elegidas = screen.getByRole("list", { name: "Habilidades elegidas" });
  expect(within(elegidas).getByText("Diseño UX")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Quitar habilidad Diseño UX" }));
  expect(screen.getByRole("checkbox", { name: "Diseño UX" })).not.toBeChecked();
});

test("sin coincidencias lo dice", async () => {
  const user = userEvent.setup();
  render(<Prueba />);
  await user.type(screen.getByRole("searchbox"), "cobol");
  expect(
    screen.getByText("No hay habilidades que coincidan con «cobol»."),
  ).toBeInTheDocument();
  expect(screen.getByText("0 habilidades")).toBeInTheDocument();
});

test("con el mínimo alcanzado no deja quitar y explica por qué", () => {
  render(<Prueba iniciales={[CATALOGO[2]]} minimo={1} />);
  const quitar = screen.getByRole("button", { name: "Quitar habilidad React" });
  expect(quitar).toBeDisabled();
  expect(quitar).toHaveAccessibleDescription("Necesitás al menos una habilidad.");
  expect(screen.getByRole("checkbox", { name: "React" })).toBeDisabled();
});

test("si falla el catálogo ofrece Reintentar", async () => {
  const recargar = vi.fn();
  const user = userEvent.setup();
  render(
    <Prueba
      catalogo={{ habilidades: null, error: { mensaje: "Sin conexión" }, recargar }}
    />,
  );
  expect(screen.getByText("No pudimos cargar las habilidades")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(recargar).toHaveBeenCalled();
});

test("con el catálogo vacío lo explica", () => {
  render(<Prueba catalogo={{ habilidades: [] }} />);
  expect(screen.getByText("Todavía no hay habilidades cargadas.")).toBeInTheDocument();
});
