import { crearIdentidad, MENSAJE_SIN_CONFIGURAR } from "./crearIdentidad.js";

const logto = {
  VITE_LOGTO_ENDPOINT: "https://tenant.logto.app",
  VITE_LOGTO_APP_ID: "app-123",
  VITE_LOGTO_RECURSO: "https://api.codigo-a-voluntad",
};

beforeEach(() => vi.spyOn(console, "warn").mockImplementation(() => {}));

test("sin endpoint, ingresar explica qué falta configurar", async () => {
  const identidad = crearIdentidad({ DEV: true, MODE: "development" });
  expect(await identidad.estaAutenticado()).toBe(false);
  await expect(identidad.iniciarSesion()).rejects.toMatchObject({
    mensaje: MENSAJE_SIN_CONFIGURAR,
  });
  expect(console.warn).toHaveBeenCalled();
});

test("con endpoint deja la sesión a cargo del provider de React", () => {
  expect(crearIdentidad({ DEV: true, MODE: "development", ...logto })).toBeNull();
});

test("en los tests no usa Logto aunque el .env lo tenga", async () => {
  const identidad = crearIdentidad({ DEV: true, MODE: "test", ...logto });
  expect(await identidad.estaAutenticado()).toBe(false);
});

test("el mensaje para la persona no menciona variables ni proveedores", () => {
  expect(MENSAJE_SIN_CONFIGURAR).not.toMatch(/VITE_|Logto|\.env/);
});

test.each(["VITE_LOGTO_ENDPOINT", "VITE_LOGTO_APP_ID", "VITE_LOGTO_RECURSO"])(
  "sin %s no monta una configuración parcial de Logto",
  async (variable) => {
    const identidad = crearIdentidad({ ...logto, [variable]: "", DEV: true });
    expect(await identidad.estaAutenticado()).toBe(false);
    await expect(identidad.iniciarSesion()).rejects.toMatchObject({
      mensaje: MENSAJE_SIN_CONFIGURAR,
    });
  },
);
