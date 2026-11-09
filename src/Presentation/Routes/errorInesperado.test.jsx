import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { rutas } from "./RutasDeLaApp.jsx";

const control = vi.hoisted(() => ({ fallaLaRaiz: false }));

vi.mock("@/Presentation/Pages/sistema/SinPermisoPage.jsx", () => ({
  SinPermisoPage: () => {
    throw new Error("Falla de prueba en una pantalla");
  },
}));

vi.mock("@/Presentation/Components/App/layout/Raiz.jsx", async (importarOriginal) => {
  const { Raiz } = await importarOriginal();
  return {
    Raiz: (props) => {
      if (control.fallaLaRaiz) throw new Error("Falla de prueba en la raíz");
      return <Raiz {...props} />;
    },
  };
});

beforeEach(() => {
  control.fallaLaRaiz = false;
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

function montarEn(ruta) {
  const router = createMemoryRouter(rutas, { initialEntries: [ruta] });
  render(<RouterProvider router={router} />);
}

test("si falla una pantalla, muestra el error dentro del diseño de la app", async () => {
  montarEn("/sin-permiso");

  expect(
    await screen.findByRole("heading", { level: 1, name: "Algo salió mal" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("banner")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Volver al inicio" })).toHaveAttribute(
    "href",
    "/",
  );
});

test("si falla la raíz, muestra el error igual", async () => {
  control.fallaLaRaiz = true;

  montarEn("/proyectos");

  expect(
    await screen.findByRole("heading", { level: 1, name: "Algo salió mal" }),
  ).toBeInTheDocument();
  expect(screen.queryByRole("banner")).not.toBeInTheDocument();
});
