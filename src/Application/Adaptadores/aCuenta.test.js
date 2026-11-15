import { aCuenta } from "./aCuenta.js";

test("aplana la cuenta del back: nombre, contexto actual y contextos", () => {
  const contexto = { id: "ctx-1", tipo: "COLECTIVO", rol: "LIDER" };
  expect(
    aCuenta({
      id: "sub-1",
      rol: "COLECTIVO",
      perfilId: "c1",
      usuario: { id: "u1", nombre: "Ana", nombrePendiente: false },
      contextoActual: contexto,
      contextos: [contexto],
    }),
  ).toEqual({
    id: "sub-1",
    rol: "COLECTIVO",
    perfilId: "c1",
    usuarioId: "u1",
    nombre: "Ana",
    nombrePendiente: false,
    contextoActual: contexto,
    contextos: [contexto],
  });
});

test("tolera la forma vieja de la cuenta, sin usuario ni contextos", () => {
  expect(aCuenta({ id: "sub-1", rol: null, perfilId: null })).toEqual({
    id: "sub-1",
    rol: null,
    perfilId: null,
    usuarioId: null,
    nombre: null,
    nombrePendiente: false,
    contextoActual: null,
    contextos: [],
  });
  expect(aCuenta(null)).toBeNull();
});
