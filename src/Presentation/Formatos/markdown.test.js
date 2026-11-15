import { sinMarcas } from "./markdown.js";

describe("sinMarcas", () => {
  test("deja solo el texto de títulos, énfasis, código y enlaces", () => {
    expect(
      sinMarcas(
        "## Qué hacemos\n\nUn **comedor** con *apoyo* y `turnos`: [ver más](https://a.org).",
      ),
    ).toBe("Qué hacemos\n\nUn comedor con apoyo y turnos: ver más.");
  });

  test("saca las viñetas, las citas y los bloques de código", () => {
    expect(sinMarcas("> Cita\n\n- Uno\n* Dos\n1. Tres\n\n```js\ncodigo()\n```")).toBe(
      "Cita\n\nUno\nDos\nTres\n\ncodigo()",
    );
  });

  test("conserva los guiones bajos y asteriscos sueltos del texto común", () => {
    expect(sinMarcas("2 * 3 = 6 y un_nombre_de_archivo")).toBe(
      "2 * 3 = 6 y un_nombre_de_archivo",
    );
  });

  test("sin texto devuelve vacío", () => {
    expect(sinMarcas(undefined)).toBe("");
  });
});
