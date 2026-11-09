import { useContext } from "react";
import { AvisosContext } from "@/Presentation/Context/AvisosContext.js";

export function useAvisos() {
  const avisar = useContext(AvisosContext);
  if (!avisar) throw new Error("useAvisos se usa dentro de <ProveedorDeAvisos>.");
  return avisar;
}
