import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/Presentation/Styles/tokens.css";
import "@/Presentation/Styles/base.css";
import App from "@/Presentation/App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
