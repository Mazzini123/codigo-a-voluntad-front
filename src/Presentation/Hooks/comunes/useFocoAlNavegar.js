import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { RUTA_CALLBACK } from "@/Presentation/Routes/rutas.js";

function enfocarTitulo(contenido, hash) {
  const ancla = hash ? document.getElementById(hash.slice(1)) : null;
  const titulo =
    ancla && contenido.contains(ancla) ? ancla : contenido.querySelector("h1");
  if (titulo) {
    titulo.focus();
    return null;
  }
  contenido.focus();
  const observador = new MutationObserver(() => {
    const aparecido = contenido.querySelector("h1");
    if (!aparecido) return;
    observador.disconnect();
    const foco = document.activeElement;
    if (foco === contenido || foco === document.body) aparecido.focus();
  });
  observador.observe(contenido, { childList: true, subtree: true });
  return observador;
}

export function useFocoAlNavegar(refContenido) {
  const { pathname, hash } = useLocation();
  const destino = `${pathname}${hash}`;
  const tipoDeNavegacion = useNavigationType();
  const rutaAnterior = useRef(destino);
  const navegoLaPersona = useRef(false);
  const esperandoTitulo = useRef(null);

  useEffect(() => {
    if (rutaAnterior.current === destino) return;
    const veniaDelIngreso = rutaAnterior.current === RUTA_CALLBACK;
    rutaAnterior.current = destino;
    esperandoTitulo.current?.disconnect();
    esperandoTitulo.current = null;
    if (tipoDeNavegacion !== "REPLACE" || veniaDelIngreso) navegoLaPersona.current = true;
    if (!navegoLaPersona.current || !refContenido.current) return;
    esperandoTitulo.current = enfocarTitulo(refContenido.current, hash);
  }, [destino, hash, tipoDeNavegacion, refContenido]);

  useEffect(() => () => esperandoTitulo.current?.disconnect(), []);
}
