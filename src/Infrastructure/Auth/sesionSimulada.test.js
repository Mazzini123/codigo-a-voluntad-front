import { crearAuthHttpClientSimulado, leerSesionSimulada } from "./sesionSimulada.js";
import { crearSesionSimulada } from "./simulada/crearSesionSimulada.js";

beforeEach(() => sessionStorage.clear());

test("lee los tres tipos válidos e ignora el resto", () => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  expect(leerSesionSimulada("COLECTIVO")).toBe("COLECTIVO");
  expect(leerSesionSimulada(" colaboradora ")).toBe("COLABORADORA");
  expect(leerSesionSimulada("SIN_PERFIL")).toBe("SIN_PERFIL");
  expect(leerSesionSimulada("")).toBeNull();
  expect(leerSesionSimulada(undefined)).toBeNull();
  expect(leerSesionSimulada("ADMIN")).toBeNull();
  expect(console.warn).toHaveBeenCalledTimes(1);
});

test("arranca sin sesión, ingresa yendo a /auth/callback y sale yendo al inicio", async () => {
  const ubicacion = { assign: vi.fn() };
  const sesion = crearSesionSimulada("COLECTIVO", ubicacion);
  expect(sesion.simulada).toBe("Colectivo");
  expect(sesion.estaAutenticado()).toBe(false);

  await sesion.iniciar({ registro: false });
  expect(ubicacion.assign).toHaveBeenLastCalledWith("/auth/callback");
  expect(sesion.estaAutenticado()).toBe(true);

  await sesion.cerrar();
  expect(ubicacion.assign).toHaveBeenLastCalledWith("/");
  expect(sesion.estaAutenticado()).toBe(false);
});

test("la sesión sobrevive a una sesión nueva en la misma pestaña", async () => {
  await crearSesionSimulada("COLECTIVO", { assign: () => {} }).iniciar();
  expect(crearSesionSimulada("COLECTIVO").estaAutenticado()).toBe(true);
});

test("no manda token al back", async () => {
  const sesion = crearSesionSimulada("COLECTIVO", { assign: () => {} });
  await sesion.iniciar();
  expect(await sesion.obtenerToken()).toBeNull();
});

test.each([
  ["COLECTIVO", { rol: "COLECTIVO", perfilId: "colectivo-simulado" }],
  ["COLABORADORA", { rol: "COLABORADORA", perfilId: "colaboradora-simulada" }],
  ["SIN_PERFIL", { rol: null, perfilId: null }],
])("la cuenta simulada de %s", async (tipo, esperado) => {
  expect(await crearAuthHttpClientSimulado(tipo).obtenerCuentaActual()).toEqual({
    id: "cuenta-simulada",
    ...esperado,
    usuario: {
      id: "cuenta-simulada",
      nombre: "Persona de prueba",
      nombrePendiente: false,
    },
  });
});

test("la cuenta simulada usa el perfil configurado y adopta el que se crea", async () => {
  const cliente = crearAuthHttpClientSimulado("COLECTIVO", "colectivo-real-1");
  expect((await cliente.obtenerCuentaActual()).perfilId).toBe("colectivo-real-1");

  const sinPerfil = crearAuthHttpClientSimulado("SIN_PERFIL", "colectivo-real-1");
  expect((await sinPerfil.obtenerCuentaActual()).perfilId).toBeNull();

  const sesion = crearSesionSimulada("SIN_PERFIL", { assign: () => {} });
  await sesion.iniciar();
  await sesion.asociarPerfil("COLECTIVO", "c-nuevo");
  expect(await sinPerfil.obtenerCuentaActual()).toMatchObject({
    id: "cuenta-simulada",
    rol: "COLECTIVO",
    perfilId: "c-nuevo",
  });

  await sesion.cerrar();
  expect((await sinPerfil.obtenerCuentaActual()).rol).toBeNull();
});

test("la sesión simulada guarda el nombre que se carga", async () => {
  const cliente = crearAuthHttpClientSimulado("COLECTIVO");
  await cliente.cambiarNombre({ nombre: "Ana" });
  expect((await cliente.obtenerCuentaActual()).usuario.nombre).toBe("Ana");
});
