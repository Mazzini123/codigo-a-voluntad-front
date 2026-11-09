import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./useAuth.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { esRutaDeAcceso, rutaDe } from "@/Presentation/Routes/rutas.js";

export function useIngreso() {
  const { iniciarSesion, errorDeIngreso } = useAuth();
  const location = useLocation();
  const avisar = useAvisos();
  const [abriendo, setAbriendo] = useState(null);
  const enCurso = useRef(false);
  const esAcceso = esRutaDeAcceso(location.pathname);
  const desde = rutaDe(esAcceso ? location.state?.desde : location);

  useEffect(() => {
    if (!errorDeIngreso || !enCurso.current) return;
    enCurso.current = false;
    setAbriendo(null);
    avisar.error("No pudimos abrir la pantalla de ingreso. Probá de nuevo.");
  }, [errorDeIngreso, avisar]);

  async function abrir(registro) {
    if (enCurso.current) return;
    enCurso.current = true;
    setAbriendo(registro ? "registro" : "ingreso");
    try {
      await iniciarSesion({ desde, registro });
    } catch (error) {
      enCurso.current = false;
      setAbriendo(null);
      avisar.error(
        error?.mensaje ?? "No pudimos abrir la pantalla de ingreso. Probá de nuevo.",
      );
    }
  }

  return { abriendo, abrir };
}
