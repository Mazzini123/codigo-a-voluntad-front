import { Outlet, ScrollRestoration, useMatches } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/Presentation/Context/AuthProvider.jsx";
import { ProveedorDeAvisos } from "@/Presentation/Components/App/avisos/ProveedorDeAvisos.jsx";
import { PieDePagina } from "./PieDePagina.jsx";
import { TIPO_DE_PANTALLA } from "@/Presentation/Routes/rutas.js";
import estilos from "./Raiz.module.css";
import { clases } from "@/Presentation/Components/App/ui/clases.js";

const BarraDemo =
  import.meta.env.DEV && import.meta.env.MODE === "demo"
    ? lazy(() => import("@/Presentation/Components/Demo/BarraDemo.jsx"))
    : null;

const CLASES_POR_TIPO = Object.freeze({
  [TIPO_DE_PANTALLA.INICIO]: [estilos.inicio],
  [TIPO_DE_PANTALLA.EXPLORACION]: [estilos.exploracion],
  [TIPO_DE_PANTALLA.ACCESO]: [estilos.exploracion, estilos.acceso],
  [TIPO_DE_PANTALLA.PANEL]: [estilos.exploracion, estilos.panelColectivo],
});

function useTipoDePantalla() {
  return useMatches().findLast((ruta) => ruta.handle?.tipoDePantalla)?.handle
    .tipoDePantalla;
}

export function Raiz({ usarSesion, CallbackComponent, dependencies }) {
  const tipo = useTipoDePantalla();
  return (
    <ProveedorDeAvisos>
      <div className={clases(estilos.pagina, ...(CLASES_POR_TIPO[tipo] ?? []))}>
        <AuthProvider
          usarSesion={usarSesion}
          CallbackComponent={CallbackComponent}
          dependencies={dependencies}
        >
          {BarraDemo && (
            <Suspense fallback={null}>
              <BarraDemo />
            </Suspense>
          )}
          <Outlet />
          <ScrollRestoration />
        </AuthProvider>
        <PieDePagina />
      </div>
    </ProveedorDeAvisos>
  );
}
