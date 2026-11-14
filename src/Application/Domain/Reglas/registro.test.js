import { describe, expect, it } from "vitest";
import {
  contextoParaRetomar,
  PASO_DE_REGISTRO,
  pasoDeRegistro,
  esperandoIngreso,
  necesitaPedidosPendientes,
  registroIncompleto,
  tieneModalidad,
  tienePedidoPendiente,
} from "./registro.js";

const CONTEXTO = { id: "ctx-1", tipo: "COLECTIVO", rol: "LIDER" };
const RECIEN_REGISTRADA = {
  nombrePendiente: true,
  rol: null,
  contextoActual: null,
  contextos: [],
};
const CON_NOMBRE = { ...RECIEN_REGISTRADA, nombrePendiente: false };
const COMPLETA = {
  nombrePendiente: false,
  rol: "COLECTIVO",
  contextoActual: CONTEXTO,
  contextos: [CONTEXTO],
};
const EN_ESPERA = { ...CON_NOMBRE, pedidosPendientes: ["colectivo-9"] };
const SIN_CONTEXTO_ELEGIDO = { ...COMPLETA, rol: null, contextoActual: null };

describe("pasoDeRegistro", () => {
  it("sin cuenta no hay paso", () => {
    expect(pasoDeRegistro(null)).toBeNull();
    expect(registroIncompleto(null)).toBe(false);
  });

  it("primero pide el nombre, aunque ya haya modalidad", () => {
    expect(pasoDeRegistro(RECIEN_REGISTRADA)).toBe(PASO_DE_REGISTRO.NOMBRE);
    expect(pasoDeRegistro({ ...COMPLETA, nombrePendiente: true })).toBe(
      PASO_DE_REGISTRO.NOMBRE,
    );
  });

  it("con nombre y sin contextos pide la modalidad", () => {
    expect(pasoDeRegistro(CON_NOMBRE)).toBe(PASO_DE_REGISTRO.MODALIDAD);
    expect(registroIncompleto(CON_NOMBRE)).toBe(true);
  });

  it("con nombre, sin contextos y con un pedido pendiente espera la aceptación", () => {
    expect(pasoDeRegistro(EN_ESPERA)).toBe(PASO_DE_REGISTRO.ESPERA);
    expect(registroIncompleto(EN_ESPERA)).toBe(true);
    expect(esperandoIngreso(EN_ESPERA)).toBe(true);
  });

  it("sin pedidos pendientes vuelve a pedir la modalidad", () => {
    expect(pasoDeRegistro({ ...CON_NOMBRE, pedidosPendientes: [] })).toBe(
      PASO_DE_REGISTRO.MODALIDAD,
    );
    expect(esperandoIngreso(CON_NOMBRE)).toBe(false);
  });

  it("el nombre pendiente va antes que la espera", () => {
    expect(pasoDeRegistro({ ...EN_ESPERA, nombrePendiente: true })).toBe(
      PASO_DE_REGISTRO.NOMBRE,
    );
  });

  it("con un contexto aceptado el pedido pendiente ya no cuenta", () => {
    expect(pasoDeRegistro({ ...COMPLETA, pedidosPendientes: ["colectivo-9"] })).toBe(
      PASO_DE_REGISTRO.COMPLETO,
    );
    expect(
      pasoDeRegistro({ ...SIN_CONTEXTO_ELEGIDO, pedidosPendientes: ["colectivo-9"] }),
    ).toBe(PASO_DE_REGISTRO.COMPLETO);
    expect(esperandoIngreso(COMPLETA)).toBe(false);
  });

  it("solo consulta los pedidos quien tiene nombre y ninguna modalidad", () => {
    expect(necesitaPedidosPendientes(CON_NOMBRE)).toBe(true);
    expect(necesitaPedidosPendientes(RECIEN_REGISTRADA)).toBe(false);
    expect(necesitaPedidosPendientes(COMPLETA)).toBe(false);
    expect(necesitaPedidosPendientes(SIN_CONTEXTO_ELEGIDO)).toBe(false);
    expect(necesitaPedidosPendientes(null)).toBe(false);
  });

  it("tienePedidoPendiente tolera una cuenta sin la lista", () => {
    expect(tienePedidoPendiente(CON_NOMBRE)).toBe(false);
    expect(tienePedidoPendiente(EN_ESPERA)).toBe(true);
    expect(tienePedidoPendiente(null)).toBe(false);
  });

  it("con nombre y algún contexto el registro está completo", () => {
    expect(pasoDeRegistro(COMPLETA)).toBe(PASO_DE_REGISTRO.COMPLETO);
    expect(pasoDeRegistro(SIN_CONTEXTO_ELEGIDO)).toBe(PASO_DE_REGISTRO.COMPLETO);
    expect(registroIncompleto(SIN_CONTEXTO_ELEGIDO)).toBe(false);
  });

  it("una cuenta con rol y sin lista de contextos también tiene modalidad", () => {
    expect(tieneModalidad({ rol: "COLABORADORA" })).toBe(true);
    expect(pasoDeRegistro({ rol: "COLABORADORA" })).toBe(PASO_DE_REGISTRO.COMPLETO);
    expect(tieneModalidad({ rol: null })).toBe(false);
  });
});

describe("contextoParaRetomar", () => {
  it("devuelve el único contexto cuando no hay uno elegido", () => {
    expect(contextoParaRetomar(SIN_CONTEXTO_ELEGIDO)).toBe(CONTEXTO);
  });

  it("no elige si ya hay contexto actual, si hay varios o si no hay ninguno", () => {
    expect(contextoParaRetomar(COMPLETA)).toBeNull();
    expect(
      contextoParaRetomar({
        ...SIN_CONTEXTO_ELEGIDO,
        contextos: [CONTEXTO, { ...CONTEXTO, id: "ctx-2" }],
      }),
    ).toBeNull();
    expect(contextoParaRetomar(CON_NOMBRE)).toBeNull();
    expect(contextoParaRetomar(null)).toBeNull();
  });

  it("no elige mientras falte el nombre", () => {
    expect(
      contextoParaRetomar({ ...SIN_CONTEXTO_ELEGIDO, nombrePendiente: true }),
    ).toBeNull();
  });
});
