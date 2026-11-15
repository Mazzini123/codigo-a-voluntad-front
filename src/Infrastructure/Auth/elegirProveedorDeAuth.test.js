import { obtenerConfiguracionAuth } from "./authFactory.js";
import { elegirProveedorDeAuth, PROVEEDOR_DE_AUTH } from "./elegirProveedorDeAuth.js";
import { MENSAJE_SIN_CONFIGURAR, useSesionSinConfigurar } from "./sinConfigurar.js";
import { ErrorDeIngreso } from "./ErrorDeIngreso.js";

const logto = {
  VITE_LOGTO_ENDPOINT: "https://tenant.logto.app",
  VITE_LOGTO_APP_ID: "app-123",
  VITE_LOGTO_API_RESOURCE: "https://api.codigo-a-voluntad",
};

beforeEach(() => vi.spyOn(console, "warn").mockImplementation(() => {}));

test("sin endpoint, ingresar explica qué falta configurar", async () => {
  const { tipo } = elegirProveedorDeAuth({ DEV: true, MODE: "development" });
  expect(tipo).toBe(PROVEEDOR_DE_AUTH.SIN_CONFIGURAR);
  const sesion = useSesionSinConfigurar();
  expect(sesion.autenticado).toBe(false);
  expect(sesion.sinConfigurar).toBe(true);
  await expect(sesion.iniciar()).rejects.toMatchObject({
    mensaje: MENSAJE_SIN_CONFIGURAR,
  });
  await expect(sesion.iniciar()).rejects.toBeInstanceOf(ErrorDeIngreso);
  expect(console.warn).toHaveBeenCalled();
});

test("con Logto configurado elige el proveedor de Logto", () => {
  expect(elegirProveedorDeAuth({ DEV: true, MODE: "development", ...logto })).toEqual({
    tipo: PROVEEDOR_DE_AUTH.LOGTO,
  });
});

test("con sesión simulada en desarrollo usa la simulada aunque haya Logto", () => {
  expect(
    elegirProveedorDeAuth({
      DEV: true,
      MODE: "development",
      VITE_SESION_SIMULADA: "colectivo",
      ...logto,
    }),
  ).toEqual({ tipo: PROVEEDOR_DE_AUTH.SIMULADA, simulada: "COLECTIVO" });
});

test("el build de producción ignora la sesión simulada", () => {
  expect(
    elegirProveedorDeAuth({
      DEV: false,
      MODE: "production",
      VITE_SESION_SIMULADA: "COLECTIVO",
      ...logto,
    }).tipo,
  ).toBe(PROVEEDOR_DE_AUTH.LOGTO);
});

test("en los tests no usa Logto ni la sesión simulada aunque el .env los tenga", () => {
  expect(
    elegirProveedorDeAuth({
      DEV: true,
      MODE: "test",
      VITE_SESION_SIMULADA: "COLECTIVO",
      ...logto,
    }).tipo,
  ).toBe(PROVEEDOR_DE_AUTH.SIN_CONFIGURAR);
});

test("el mensaje para la persona no menciona variables ni proveedores", () => {
  expect(MENSAJE_SIN_CONFIGURAR).not.toMatch(/VITE_|Logto|\.env/);
});

test.each(["VITE_LOGTO_ENDPOINT", "VITE_LOGTO_APP_ID", "VITE_LOGTO_API_RESOURCE"])(
  "sin %s no monta una configuración parcial de Logto",
  (variable) => {
    expect(elegirProveedorDeAuth({ ...logto, [variable]: "", DEV: true }).tipo).toBe(
      PROVEEDOR_DE_AUTH.SIN_CONFIGURAR,
    );
  },
);

test("un proveedor no soportado falla al arrancar", () => {
  expect(() => elegirProveedorDeAuth({ VITE_AUTH_PROVIDER: "firebase" })).toThrow(
    "Proveedor de autenticación no soportado: firebase",
  );
});

test("la configuración entrega provider, hook de sesión y componente de callback", () => {
  const configuracion = obtenerConfiguracionAuth({
    DEV: true,
    MODE: "development",
    ...logto,
  });
  expect(configuracion.tipo).toBe(PROVEEDOR_DE_AUTH.LOGTO);
  expect(configuracion.Provider).toEqual(expect.any(Function));
  expect(configuracion.usarSesion).toEqual(expect.any(Function));
  expect(configuracion.CallbackComponent).toEqual(expect.any(Function));
});
