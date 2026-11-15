const CLAVE = "codigo-a-voluntad:sesion-simulada";

export const PERMISOS_DE_ADMINISTRACION = Object.freeze([
  "PROYECTO_DESTACAR",
  "REVISION_VER",
  "REVISION_RESOLVER",
  "AUDITORIA_VER",
  "ADMIN_GESTIONAR",
]);

export async function conSesionIniciada(page, cuenta) {
  await page.addInitScript(
    ([clave, perfil]) => {
      sessionStorage.setItem(clave, "1");
      sessionStorage.setItem(`${clave}:perfil`, JSON.stringify(perfil));
    },
    [CLAVE, cuenta],
  );
}

export async function comoAdministracion(
  page,
  { permisos = PERMISOS_DE_ADMINISTRACION } = {},
) {
  const contexto = {
    id: "contexto-administracion-simulado",
    tipo: "ADMINISTRACION",
    rol: "ADMIN",
    colectivo: null,
    colaborador: null,
    permisos: [...permisos],
  };
  await conSesionIniciada(page, {
    rol: "ADMINISTRACION",
    perfilId: null,
    contextoActual: contexto,
    contextos: [contexto],
  });
}
