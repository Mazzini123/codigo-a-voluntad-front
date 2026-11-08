import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../Components/App/AppLayout.jsx";
import { HabilidadesPage } from "../Pages/HabilidadesPage.jsx";
import { AuthTestPage } from "../Pages/AuthTestPage.jsx";
import { obtenerConfiguracionAuth } from "../../Infrastructure/Auth/authFactory";
import { RUTA_CALLBACK } from "../../Infrastructure/Auth/authRoutes";

const { CallbackComponent } = obtenerConfiguracionAuth();

export function AppRoutes() {
  return (
    <Routes>
      {/* El proveedor de auth redirige acá después del login; no lleva el AppLayout */}
      <Route path={RUTA_CALLBACK} element={<CallbackComponent />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/habilidades" replace />} />
        <Route path="/habilidades" element={<HabilidadesPage />} />
        {import.meta.env.DEV && (
          <Route path="/auth-test" element={<AuthTestPage />} />
        )}
        <Route path="*" element={<h1>Página no encontrada</h1>} />
      </Route>
    </Routes>
  );
}
