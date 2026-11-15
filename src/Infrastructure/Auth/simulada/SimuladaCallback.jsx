import { useEffect } from "react";
import { recordarSesion } from "../sesionSimulada.js";

export function SimuladaCallback({ alCompletar }) {
  useEffect(() => {
    recordarSesion(true);
    alCompletar();
  }, [alCompletar]);
  return null;
}
