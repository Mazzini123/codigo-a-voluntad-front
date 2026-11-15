import { crearPedidos, ruta } from "./pedidos.js";

describe("ruta", () => {
  test("codifica cada valor y deja el texto fijo como está", () => {
    expect(ruta`/proyectos/${"a/b"}/colaboraciones/${"c d"}`).toBe(
      "/proyectos/a%2Fb/colaboraciones/c%20d",
    );
  });

  test("sin valores devuelve el texto", () => {
    expect(ruta`/habilidades`).toBe("/habilidades");
  });
});

describe("crearPedidos", () => {
  test("pasa la misma firma a axios y devuelve solo el cuerpo", async () => {
    const http = {
      get: vi.fn(async () => ({ data: "g" })),
      delete: vi.fn(async () => ({ data: "d" })),
      post: vi.fn(async () => ({ data: "p" })),
      put: vi.fn(async () => ({ data: "u" })),
    };
    const api = crearPedidos(http);
    const config = { requiereSesion: true };
    expect(await api.get("/a", config)).toBe("g");
    expect(await api.delete("/a", config)).toBe("d");
    expect(await api.post("/a", { x: 1 }, config)).toBe("p");
    expect(await api.put("/a", { x: 2 }, config)).toBe("u");
    expect(http.get).toHaveBeenCalledWith("/a", config);
    expect(http.post).toHaveBeenCalledWith("/a", { x: 1 }, config);
    expect(http.put).toHaveBeenCalledWith("/a", { x: 2 }, config);
  });
});
