import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./Styles/global.css";
import App from "./App.jsx";
import { obtenerConfiguracionAuth } from "./Infrastructure/Auth/authFactory";
import { AuthProvider } from "./Presentation/Context/AuthProvider.jsx";

const { Provider: ProveedorAuth } = obtenerConfiguracionAuth();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ProveedorAuth>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ProveedorAuth>
  </StrictMode>,
);
