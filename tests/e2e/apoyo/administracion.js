import { conBackFalso } from "./backFalso.js";
import { comoAdministracion } from "./sesion.js";

export const CELULAR = { width: 320, height: 800 };

export async function abrirComoAdministracion(
  page,
  ruta,
  { preparar = () => {}, permisos } = {},
) {
  const back = await conBackFalso(page, preparar);
  await comoAdministracion(page, { permisos });
  await page.setViewportSize(CELULAR);
  await page.goto(ruta);
  return back;
}
