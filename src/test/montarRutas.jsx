import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createMemoryRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Raiz } from "@/Presentation/Components/App/layout/Raiz.jsx";
import { crearSesionFalsa } from "@/Presentation/Dependencies/identidadDependencies.js";

export function montarRutas(
  hijos,
  { ruta = "/", cuenta = null, sesion, dependencies } = {},
) {
  const sesionUsada = sesion ?? crearSesionFalsa({ autenticado: Boolean(cuenta) });
  const dependenciasUsadas = dependencies ?? { obtenerCuentaActual: async () => cuenta };
  const router = createMemoryRouter(
    createRoutesFromElements(
      <Route
        element={
          <Raiz
            usarSesion={sesionUsada.usarSesion}
            CallbackComponent={sesionUsada.CallbackComponent}
            dependencies={dependenciasUsadas}
          />
        }
      >
        {hijos}
      </Route>,
    ),
    { initialEntries: [ruta] },
  );
  const vista = render(<RouterProvider router={router} />);
  return { ...vista, router, sesion: sesionUsada, user: userEvent.setup() };
}
