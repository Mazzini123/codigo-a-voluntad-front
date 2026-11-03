import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "../Routes/AppRoutes.jsx";
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
