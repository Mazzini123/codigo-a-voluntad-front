import { useContext } from "react";
import { AvisosContext } from "../Context/AvisosContext.js";

export function useAvisos() {
  const avisar = useContext(AvisosContext);
  if (!avisar) throw new Error("useAvisos se usa dentro de <AvisosProvider>.");
  return avisar;
}
