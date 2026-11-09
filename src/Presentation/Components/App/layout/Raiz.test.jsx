import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { TIPO_DE_PANTALLA } from "@/Presentation/Routes/rutas.js";
import { Raiz } from "./Raiz.jsx";
import estilos from "./Raiz.module.css";

vi.mock("@/Presentation/Context/AuthProvider.jsx", () => ({
  AuthProvider: ({ children }) => children,
}));
vi.mock("./PieDePagina.jsx", () => ({ PieDePagina: () => null }));

function montar(ruta) {
  const pantalla = <main>Pantalla</main>;
  const router = createMemoryRouter(
    [
      {
        element: <Raiz />,
        children: [
          {
            path: "/proyectos",
            element: pantalla,
            handle: { tipoDePantalla: TIPO_DE_PANTALLA.EXPLORACION },
          },
          {
            path: "/login",
            element: pantalla,
            handle: { tipoDePantalla: TIPO_DE_PANTALLA.ACCESO },
          },
          {
            handle: { tipoDePantalla: TIPO_DE_PANTALLA.PANEL },
            children: [{ path: "/colectivo/resumen", element: pantalla }],
          },
          { path: "/otra", element: pantalla },
        ],
      },
    ],
    { initialEntries: [ruta] },
  );
  render(<RouterProvider router={router} />);
  return screen.getByRole("main").parentElement;
}

test.each([
  ["/proyectos", [estilos.exploracion]],
  ["/login", [estilos.exploracion, estilos.acceso]],
  ["/colectivo/resumen", [estilos.exploracion, estilos.panelColectivo]],
])("%s toma las clases que declara su ruta", (ruta, esperadas) => {
  const pagina = montar(ruta);
  for (const clase of esperadas) expect(pagina).toHaveClass(clase);
});

test("una ruta sin tipo de pantalla queda con el fondo por defecto", () => {
  const pagina = montar("/otra");
  expect(pagina.className).toBe(estilos.pagina);
});
