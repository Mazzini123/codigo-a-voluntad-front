import { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/Presentation/Context/AuthProvider.jsx";
import { ProveedorDeAvisos } from "@/Presentation/Components/App/avisos/ProveedorDeAvisos.jsx";
import { crearSesionFalsa } from "@/Presentation/Dependencies/identidadDependencies.js";

export function Proveedores({
  ruta = "/",
  cuenta = null,
  sesion,
  dependencies,
  children,
}) {
  const [sesionDePrueba] = useState(
    () => sesion ?? crearSesionFalsa({ autenticado: Boolean(cuenta) }),
  );
  const [dependenciasDePrueba] = useState(() => ({
    registrarUsuario: async () => ({ creado: false }),
    obtenerCuentaActual: async () => cuenta,
    ...dependencies,
  }));
  return (
    <MemoryRouter initialEntries={[ruta]}>
      <ProveedorDeAvisos>
        <AuthProvider
          usarSesion={sesionDePrueba.usarSesion}
          CallbackComponent={sesionDePrueba.CallbackComponent}
          dependencies={dependenciasDePrueba}
        >
          {children}
        </AuthProvider>
      </ProveedorDeAvisos>
    </MemoryRouter>
  );
}
