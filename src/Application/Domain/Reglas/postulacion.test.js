import { describe, expect, it } from "vitest";
import {
  esColaboracionPropia,
  participaEnElColectivo,
  postulanteVisible,
} from "./postulacion.js";

const contextoDeColectivo = (id, rol) => ({
  tipo: "COLECTIVO",
  rol,
  colectivo: { id },
  colaborador: null,
});

describe("participaEnElColectivo", () => {
  it("es verdadero para quien lidera o es miembro del colectivo", () => {
    expect(
      participaEnElColectivo({ contextos: [contextoDeColectivo("c1", "LIDER")] }, "c1"),
    ).toBe(true);
    expect(
      participaEnElColectivo({ contextos: [contextoDeColectivo("c1", "MIEMBRO")] }, "c1"),
    ).toBe(true);
  });

  it("es falso para otro colectivo, sin contextos o sin colectivo del proyecto", () => {
    const usuario = { contextos: [contextoDeColectivo("c1", "LIDER")] };
    expect(participaEnElColectivo(usuario, "c2")).toBe(false);
    expect(participaEnElColectivo({ contextos: [] }, "c1")).toBe(false);
    expect(participaEnElColectivo({}, "c1")).toBe(false);
    expect(participaEnElColectivo(null, "c1")).toBe(false);
    expect(participaEnElColectivo(usuario, undefined)).toBe(false);
  });

  it("ignora el contexto de colaboradora", () => {
    const usuario = {
      contextos: [
        { tipo: "COLABORADOR", rol: "COLABORADOR", colectivo: null, colaborador: {} },
      ],
    };
    expect(participaEnElColectivo(usuario, "c1")).toBe(false);
  });
});

describe("esColaboracionPropia", () => {
  const usuario = {
    contextos: [
      { tipo: "COLABORADOR", colaborador: { id: "k1" } },
      { tipo: "COLECTIVO", colectivo: { id: "c1" } },
    ],
  };

  it("es propia si la colaboración pública es del perfil de la cuenta", () => {
    expect(
      esColaboracionPropia(usuario, { esPublica: true, colaborador: { id: "k1" } }),
    ).toBe(true);
  });

  it("no es propia si es de otra persona", () => {
    expect(
      esColaboracionPropia(usuario, { esPublica: true, colaborador: { id: "k2" } }),
    ).toBe(false);
  });

  it("no es propia si es anónima, no trae persona o la cuenta no tiene perfil", () => {
    expect(
      esColaboracionPropia(usuario, { esPublica: false, colaborador: { id: "k1" } }),
    ).toBe(false);
    expect(esColaboracionPropia(usuario, { esPublica: true, colaborador: null })).toBe(
      false,
    );
    expect(
      esColaboracionPropia(
        { contextos: [] },
        { esPublica: true, colaborador: { id: "k1" } },
      ),
    ).toBe(false);
    expect(
      esColaboracionPropia(null, { esPublica: true, colaborador: { id: "k1" } }),
    ).toBe(false);
  });
});

describe("postulanteVisible", () => {
  it("oculta a la persona de una postulación anónima", () => {
    expect(postulanteVisible({ esPublica: false, colaborador: { id: "k1" } })).toBeNull();
  });

  it("muestra a la persona si la postulación es pública o no lo aclara", () => {
    const colaborador = { id: "k1" };
    expect(postulanteVisible({ esPublica: true, colaborador })).toBe(colaborador);
    expect(postulanteVisible({ colaborador })).toBe(colaborador);
  });

  it("sin colaborador devuelve vacío", () => {
    expect(postulanteVisible({ esPublica: true })).toBeNull();
  });
});
