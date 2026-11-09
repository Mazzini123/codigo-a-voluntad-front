import { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { ProveedorDeSesion } from "@/Presentation/Components/App/sesion/ProveedorDeSesion.jsx";
import { ProveedorDeAvisos } from "@/Presentation/Components/App/avisos/ProveedorDeAvisos.jsx";
import { crearIdentidadFalsa } from "@/Presentation/Dependencies/identidadDependencies.js";

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
      <ProveedorDeAvisos>
        <ProveedorDeSesion
          identidad={identidadDePrueba}
          dependencies={dependenciasDePrueba}
        >
          {children}
        </ProveedorDeSesion>
      </ProveedorDeAvisos>
    </MemoryRouter>
  );
}
