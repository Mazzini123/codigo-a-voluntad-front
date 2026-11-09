import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/Presentation/Styles/tokens.css";
import "@/Presentation/Styles/base.css";
import App from "@/Presentation/App.jsx";
import { ProveedorAuth } from "@/Presentation/Dependencies/identidadDependencies.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ProveedorAuth>
      <App />
    </ProveedorAuth>
  </StrictMode>,
);
