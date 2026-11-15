const CLAVE = "codigo-a-voluntad:sesion-simulada";

export async function conSesionIniciada(page, { rol, perfilId }) {
  await page.addInitScript(
    ([clave, perfil]) => {
      sessionStorage.setItem(clave, "1");
      sessionStorage.setItem(`${clave}:perfil`, JSON.stringify(perfil));
    },
    [CLAVE, { rol, perfilId }],
  );
}
