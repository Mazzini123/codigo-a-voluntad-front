import { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../Presentation/Components/App/AuthProvider.jsx";
import { AvisosProvider } from "../Presentation/Components/App/AvisosProvider.jsx";
import { crearIdentidadFalsa } from "../Presentation/Dependencies/identidadDependencies.js";

export function Proveedores({
  ruta = "/",
  cuenta = null,
  identidad,
  dependencies,
  children,
}) {
  const [identidadDePrueba] = useState(
    () => identidad ?? crearIdentidadFalsa({ autenticado: Boolean(cuenta) }),
  );
  const [dependenciasDePrueba] = useState(
    () => dependencies ?? { obtenerCuentaActual: async () => cuenta },
  );
  return (
    <MemoryRouter initialEntries={[ruta]}>
      <AvisosProvider>
        <AuthProvider identidad={identidadDePrueba} dependencies={dependenciasDePrueba}>
          {children}
        </AuthProvider>
      </AvisosProvider>
    </MemoryRouter>
  );
}
