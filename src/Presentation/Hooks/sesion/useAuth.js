import { useContext } from "react";
import { ContextoDeSesion } from "@/Presentation/Context/ContextoDeSesion.js";

export function useAuth() {
  const sesion = useContext(ContextoDeSesion);
  if (!sesion) throw new Error("useAuth se usa dentro de <AuthProvider>.");
  return sesion;
}
