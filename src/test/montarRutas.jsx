import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createMemoryRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Raiz } from "../Presentation/Components/App/Raiz.jsx";
import { crearIdentidadFalsa } from "../Presentation/Dependencies/identidadDependencies.js";

export function montarRutas(
  hijos,
  { ruta = "/", cuenta = null, identidad, dependencies } = {},
) {
  const identidadUsada =
    identidad ?? crearIdentidadFalsa({ autenticado: Boolean(cuenta) });
  const dependenciasUsadas = dependencies ?? { obtenerCuentaActual: async () => cuenta };
  const router = createMemoryRouter(
    createRoutesFromElements(
      <Route
        element={<Raiz identidad={identidadUsada} dependencies={dependenciasUsadas} />}
      >
        {hijos}
      </Route>,
    ),
    { initialEntries: [ruta] },
  );
  const vista = render(<RouterProvider router={router} />);
  return { ...vista, router, identidad: identidadUsada, user: userEvent.setup() };
}
