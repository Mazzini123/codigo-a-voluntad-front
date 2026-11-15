import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";

export const demoActiva = import.meta.env.DEV && import.meta.env.MODE === "demo";

export async function iniciarDemo() {
  if (!demoActiva) return;
  const { activarDemo } = await import("@/Infrastructure/Demo/activarDemo.js");
  activarDemo(axiosClient);
}

export async function cambiarRolDemo(rol) {
  const { elegirRolDemo } = await import("@/Infrastructure/Demo/activarDemo.js");
  elegirRolDemo(rol);
  window.location.assign(
    rol === "COLECTIVO"
      ? "/colectivo/resumen"
      : rol === "COLABORADORA"
        ? "/colaboradora/postulaciones"
        : rol === "SIN_PERFIL"
          ? "/bienvenida"
          : "/",
  );
}

export function reiniciarDemo() {
  sessionStorage.removeItem("codigo-a-voluntad:demo:datos:v1");
  void cambiarRolDemo("COLECTIVO");
}
