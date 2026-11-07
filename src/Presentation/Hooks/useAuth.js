import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext.js";

export function useAuth() {
  const sesion = useContext(AuthContext);
  if (!sesion) throw new Error("useAuth se usa dentro de <AuthProvider>.");
  return sesion;
}
