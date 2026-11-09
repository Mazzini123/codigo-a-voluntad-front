import { ErrorDeIngreso } from "./ErrorDeIngreso.js";
import {
  elegirProveedorDeIdentidad,
  MENSAJE_SIN_CONFIGURAR,
  PROVEEDOR_DE_IDENTIDAD,
} from "./elegirProveedorDeIdentidad.js";

const logto = {
  VITE_LOGTO_ENDPOINT: "https://tenant.logto.app",
  VITE_LOGTO_APP_ID: "app-123",
  VITE_LOGTO_RECURSO: "https://api.codigo-a-voluntad",
};

beforeEach(() => vi.spyOn(console, "warn").mockImplementation(() => {}));

test("sin endpoint, ingresar explica qué falta configurar", async () => {
  const { tipo, identidad } = elegirProveedorDeIdentidad({
    DEV: true,
    MODE: "development",
  });
  expect(tipo).toBe(PROVEEDOR_DE_IDENTIDAD.SIN_CONFIGURAR);
  expect(await identidad.estaAutenticado()).toBe(false);
  await expect(identidad.iniciarSesion()).rejects.toMatchObject({
    mensaje: MENSAJE_SIN_CONFIGURAR,
  });
  expect(console.warn).toHaveBeenCalled();
});

test("completar el ingreso sin configurar falla con el mismo error que ingresar", async () => {
  const { identidad } = elegirProveedorDeIdentidad({ DEV: true, MODE: "development" });
  const error = await identidad.completarIngreso("/callback").catch((falla) => falla);
  expect(error).toBeInstanceOf(ErrorDeIngreso);
  expect(error.mensaje).toBe(MENSAJE_SIN_CONFIGURAR);
});

test("con Logto configurado deja la sesión a cargo del provider de React", () => {
  expect(
    elegirProveedorDeIdentidad({ DEV: true, MODE: "development", ...logto }),
  ).toEqual({
    tipo: PROVEEDOR_DE_IDENTIDAD.LOGTO,
  });
});

test("con sesión simulada en desarrollo usa la identidad simulada aunque haya Logto", () => {
  const { tipo, identidad } = elegirProveedorDeIdentidad({
    DEV: true,
    MODE: "development",
    VITE_SESION_SIMULADA: "colectivo",
    ...logto,
  });
  expect(tipo).toBe(PROVEEDOR_DE_IDENTIDAD.SIMULADA);
  expect(identidad.simulada).toBe("Colectivo");
});

test("el build de producción ignora la sesión simulada", () => {
  expect(
    elegirProveedorDeIdentidad({
      DEV: false,
      MODE: "production",
      VITE_SESION_SIMULADA: "COLECTIVO",
      ...logto,
    }).tipo,
  ).toBe(PROVEEDOR_DE_IDENTIDAD.LOGTO);
});

test("en los tests no usa Logto ni la sesión simulada aunque el .env los tenga", async () => {
  const { tipo, identidad } = elegirProveedorDeIdentidad({
    DEV: true,
    MODE: "test",
    VITE_SESION_SIMULADA: "COLECTIVO",
    ...logto,
  });
  expect(tipo).toBe(PROVEEDOR_DE_IDENTIDAD.SIN_CONFIGURAR);
  expect(await identidad.estaAutenticado()).toBe(false);
});

test("el mensaje para la persona no menciona variables ni proveedores", () => {
  expect(MENSAJE_SIN_CONFIGURAR).not.toMatch(/VITE_|Logto|\.env/);
});

test.each(["VITE_LOGTO_ENDPOINT", "VITE_LOGTO_APP_ID", "VITE_LOGTO_RECURSO"])(
  "sin %s no monta una configuración parcial de Logto",
  async (variable) => {
    const { tipo, identidad } = elegirProveedorDeIdentidad({
      ...logto,
      [variable]: "",
      DEV: true,
    });
    expect(tipo).toBe(PROVEEDOR_DE_IDENTIDAD.SIN_CONFIGURAR);
    await expect(identidad.iniciarSesion()).rejects.toMatchObject({
      mensaje: MENSAJE_SIN_CONFIGURAR,
    });
  },
);
