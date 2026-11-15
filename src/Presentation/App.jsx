import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { rutas } from "@/Presentation/Routes/RutasDeLaApp.jsx";

export default function App() {
  const [router] = useState(() => createBrowserRouter(rutas));
  return <RouterProvider router={router} />;
}
