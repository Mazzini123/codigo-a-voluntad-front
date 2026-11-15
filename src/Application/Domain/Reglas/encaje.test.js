import { describe, expect, it } from "vitest";
import {
  encajeDeHabilidades,
  habilidadesFueraDelPerfil,
  requeridasCubiertas,
} from "./encaje.js";

const perfil = {
  habilidadesRequeridas: [
    { codigo: "react", titulo: "React" },
    { codigo: "css", titulo: "CSS" },
  ],
};

describe("encajeDeHabilidades", () => {
  it("cuenta cuántas requeridas tiene la persona", () => {
    expect(encajeDeHabilidades(perfil, new Set(["css", "sql"]))).toEqual({
      tiene: 1,
      total: 2,
    });
  });

  it("no hay encaje si el perfil no pide habilidades", () => {
    expect(encajeDeHabilidades({ habilidadesRequeridas: [] }, new Set(["css"]))).toBe(
      null,
    );
    expect(encajeDeHabilidades(null, new Set())).toBe(null);
  });
});

describe("requeridasCubiertas", () => {
  it("marca cada requerida según la tenga o no", () => {
    expect(requeridasCubiertas(perfil, new Set(["react"]))).toEqual([
      { habilidad: perfil.habilidadesRequeridas[0], tiene: true },
      { habilidad: perfil.habilidadesRequeridas[1], tiene: false },
    ]);
  });
});

describe("habilidadesFueraDelPerfil", () => {
  it("deja las habilidades que el perfil no pide", () => {
    const sql = { codigo: "sql", titulo: "SQL" };
    expect(habilidadesFueraDelPerfil(perfil, [{ codigo: "css" }, sql])).toEqual([sql]);
    expect(habilidadesFueraDelPerfil(null, [sql])).toEqual([sql]);
  });
});
