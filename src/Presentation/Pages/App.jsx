import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { rutas } from "../Routes/AppRoutes.jsx";

export default function App() {
  const [router] = useState(() => createBrowserRouter(rutas));
  return <RouterProvider router={router} />;
}
