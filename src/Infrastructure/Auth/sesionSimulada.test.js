import {
  crearAuthHttpClientSimulado,
  crearIdentidadSimulada,
  leerSesionSimulada,
} from "./sesionSimulada.js";

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

test("arranca sin sesión, ingresa yendo a /callback y sale yendo al inicio", async () => {
  const ubicacion = { assign: vi.fn() };
  const identidad = crearIdentidadSimulada("COLECTIVO", ubicacion);
  expect(identidad.simulada).toBe("Colectivo");
  expect(await identidad.estaAutenticado()).toBe(false);

  await identidad.iniciarSesion({ registro: false });
  expect(ubicacion.assign).toHaveBeenLastCalledWith("/callback");
  expect(await identidad.estaAutenticado()).toBe(true);

  await identidad.cerrarSesion();
  expect(ubicacion.assign).toHaveBeenLastCalledWith("/");
  expect(await identidad.estaAutenticado()).toBe(false);
});

test("la sesión sobrevive a una identidad nueva en la misma pestaña", async () => {
  await crearIdentidadSimulada("COLECTIVO", { assign: () => {} }).iniciarSesion();
  expect(await crearIdentidadSimulada("COLECTIVO").estaAutenticado()).toBe(true);
});

test("no manda token al back", async () => {
  const identidad = crearIdentidadSimulada("COLECTIVO", { assign: () => {} });
  await identidad.iniciarSesion();
  expect(await identidad.obtenerToken()).toBeNull();
});

test.each([
  ["COLECTIVO", { rol: "COLECTIVO", perfilId: "colectivo-simulado" }],
  ["COLABORADORA", { rol: "COLABORADORA", perfilId: "colaboradora-simulada" }],
  ["SIN_PERFIL", { rol: null, perfilId: null }],
])("la cuenta simulada de %s", async (tipo, esperado) => {
  expect(await crearAuthHttpClientSimulado(tipo).obtenerCuentaActual()).toEqual({
    id: "cuenta-simulada",
    ...esperado,
  });
});

test("la cuenta simulada usa el perfil configurado y adopta el que se crea", async () => {
  const cliente = crearAuthHttpClientSimulado("COLECTIVO", "colectivo-real-1");
  expect((await cliente.obtenerCuentaActual()).perfilId).toBe("colectivo-real-1");

  const sinPerfil = crearAuthHttpClientSimulado("SIN_PERFIL", "colectivo-real-1");
  expect((await sinPerfil.obtenerCuentaActual()).perfilId).toBeNull();

  const identidad = crearIdentidadSimulada("SIN_PERFIL", { assign: () => {} });
  await identidad.iniciarSesion();
  await identidad.asociarPerfil("COLECTIVO", "c-nuevo");
  expect(await sinPerfil.obtenerCuentaActual()).toEqual({
    id: "cuenta-simulada",
    rol: "COLECTIVO",
    perfilId: "c-nuevo",
  });

  await identidad.cerrarSesion();
  expect((await sinPerfil.obtenerCuentaActual()).rol).toBeNull();
});
