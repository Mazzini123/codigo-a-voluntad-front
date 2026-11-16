import { describe, expect, test } from "vitest";
import { PROYECTO_ESTADO } from "@/Application/Domain/Enums/PROYECTO_ESTADO.js";
import {
  esEditable,
  estaPublicado,
  fueRechazado,
  puedePedirPublicacion,
  rechazoDe,
} from "./publicacion.js";

const { BORRADOR, EN_REVISION, ABIERTO, FINALIZADO, DADO_DE_BAJA } = PROYECTO_ESTADO;
const rechazo = { nota: "Falta la fecha", fecha: "2026-11-10T12:00:00.000Z" };

describe("reglas de publicación", () => {
  test.each([
    [BORRADOR, false],
    [EN_REVISION, false],
    [ABIERTO, true],
    [FINALIZADO, true],
    [DADO_DE_BAJA, false],
  ])("un proyecto %s está publicado: %s", (estado, esperado) => {
    expect(estaPublicado({ estado })).toBe(esperado);
  });

  test("un proyecto sin estado se considera publicado", () => {
    expect(estaPublicado({})).toBe(true);
  });

  test.each([
    [BORRADOR, true],
    [EN_REVISION, false],
    [ABIERTO, true],
    [FINALIZADO, false],
    [DADO_DE_BAJA, false],
  ])("un proyecto %s se puede editar: %s", (estado, esperado) => {
    expect(esEditable({ estado })).toBe(esperado);
  });

  test("solo un borrador puede pedir la publicación", () => {
    expect(puedePedirPublicacion({ estado: BORRADOR })).toBe(true);
    expect(puedePedirPublicacion({ estado: EN_REVISION })).toBe(false);
    expect(puedePedirPublicacion({ estado: ABIERTO })).toBe(false);
    expect(puedePedirPublicacion(null)).toBe(false);
  });

  test("un borrador con rechazo fue rechazado y expone la nota", () => {
    const proyecto = { estado: BORRADOR, publicacion: { rechazo } };
    expect(fueRechazado(proyecto)).toBe(true);
    expect(rechazoDe(proyecto)).toEqual(rechazo);
  });

  test("un borrador sin publicación o sin rechazo no fue rechazado", () => {
    expect(fueRechazado({ estado: BORRADOR })).toBe(false);
    expect(fueRechazado({ estado: BORRADOR, publicacion: null })).toBe(false);
    expect(fueRechazado({ estado: BORRADOR, publicacion: { rechazo: null } })).toBe(
      false,
    );
    expect(rechazoDe({ estado: BORRADOR })).toBeNull();
  });

  test("un rechazo viejo no cuenta si el proyecto ya está en revisión", () => {
    expect(fueRechazado({ estado: EN_REVISION, publicacion: { rechazo } })).toBe(false);
  });
});
