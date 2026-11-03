import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../Components/App/AppLayout.jsx";
import { HabilidadesPage } from "../Pages/HabilidadesPage.jsx";
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/habilidades" replace />} />
        <Route path="/habilidades" element={<HabilidadesPage />} />
        <Route path="*" element={<h1>Página no encontrada</h1>} />
      </Route>
    </Routes>
  );
}
