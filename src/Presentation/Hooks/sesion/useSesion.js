import { useContext } from "react";
import { ContextoDeSesion } from "@/Presentation/Context/ContextoDeSesion.js";

export function useSesion() {
  const sesion = useContext(ContextoDeSesion);
  if (!sesion) throw new Error("useSesion se usa dentro de <ProveedorDeSesion>.");
  return sesion;
}
