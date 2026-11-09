import { render, screen } from "@testing-library/react";
import { EnlaceExterno } from "./EnlaceExterno.jsx";

test("abre una URL válida en otra pestaña y lo anuncia", () => {
  render(<EnlaceExterno url="https://turnos.example.org">Ver el sistema</EnlaceExterno>);

  const enlace = screen.getByRole("link", {
    name: /^Ver el sistema\s*\(se abre en otra pestaña\)$/,
  });
  expect(enlace).toHaveAttribute("href", "https://turnos.example.org");
  expect(enlace).toHaveAttribute("target", "_blank");
  expect(enlace).toHaveAttribute("rel", "noopener noreferrer");
});

test("con una URL que no es http ni https muestra solo el texto", () => {
  render(<EnlaceExterno url="javascript:alert(1)">Instagram</EnlaceExterno>);

  expect(screen.queryByRole("link")).not.toBeInTheDocument();
  expect(screen.getByText("Instagram")).toBeInTheDocument();
});
