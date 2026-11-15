import { render, screen } from "@testing-library/react";
import { TextoConFormato } from "./TextoConFormato.jsx";

function montar(texto, nivel) {
  return render(<TextoConFormato texto={texto} nivel={nivel} />);
}

describe("TextoConFormato", () => {
  test("muestra párrafos, listas, énfasis y código", async () => {
    montar("Hacemos **apoyo escolar**.\n\n- Lunes\n- Jueves\n\nUsamos `git` y *mate*.");
    expect(await screen.findByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "Lunes",
      "Jueves",
    ]);
    expect(screen.getByText("apoyo escolar").tagName).toBe("STRONG");
    expect(screen.getByText("git").tagName).toBe("CODE");
    expect(screen.getByText("mate").tagName).toBe("EM");
  });

  test("los títulos toman el nivel que corresponde a la página", async () => {
    montar("# Objetivo\n\n## Detalle", 3);
    expect(
      await screen.findByRole("heading", { level: 3, name: "Objetivo" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 4, name: "Detalle" }),
    ).toBeInTheDocument();
  });

  test("los enlaces http abren en otra pestaña y avisan", async () => {
    montar("Mirá [el repo](https://github.com/org/repo).");
    const enlace = await screen.findByRole("link", {
      name: /^el repo\s*\(se abre en otra pestaña\)$/,
    });
    expect(enlace).toHaveAttribute("href", "https://github.com/org/repo");
    expect(enlace).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("un enlace con otro protocolo queda como texto", async () => {
    montar("Hacé [clic acá](javascript:alert(1)).");
    expect(await screen.findByText("clic acá")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  test("no interpreta HTML ni muestra imágenes", async () => {
    const { container } = montar(
      "Texto <script>alert(1)</script><b>negrita</b>\n\n![foto](https://a.org/f.png)",
    );
    await screen.findByText(/^Texto/);
    expect(container.querySelector("script, b, img")).toBeNull();
    expect(container).toHaveTextContent("foto");
  });

  test("sin texto no muestra nada", () => {
    const { container } = montar("   ");
    expect(container).toBeEmptyDOMElement();
  });
});
