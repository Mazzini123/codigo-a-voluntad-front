import { PROYECTO_ESTADO } from "@/Application/Domain/Enums/PROYECTO_ESTADO.js";
import {
  bajaDe,
  ESTADOS_PARA_BAJA,
  estaDadoDeBaja,
  puedeDarDeBaja,
} from "./baja.js";

const BAJA = { motivo: "Incumple los términos.", fecha: "2026-11-16T12:00:00.000Z" };

test.each([
  [PROYECTO_ESTADO.DADO_DE_BAJA, true],
  [PROYECTO_ESTADO.ABIERTO, false],
  [PROYECTO_ESTADO.FINALIZADO, false],
  [PROYECTO_ESTADO.BORRADOR, false],
])("un proyecto %s está dado de baja: %s", (estado, esperado) => {
  expect(estaDadoDeBaja({ estado })).toBe(esperado);
});

test("la baja solo se lee de un proyecto dado de baja", () => {
  expect(bajaDe({ estado: PROYECTO_ESTADO.DADO_DE_BAJA, baja: BAJA })).toEqual(BAJA);
  expect(bajaDe({ estado: PROYECTO_ESTADO.DADO_DE_BAJA })).toBeNull();
  expect(bajaDe({ estado: PROYECTO_ESTADO.ABIERTO, baja: BAJA })).toBeNull();
  expect(bajaDe(null)).toBeNull();
});

test("se pueden buscar para dar de baja todos los estados salvo los ya dados de baja", () => {
  expect(ESTADOS_PARA_BAJA).toEqual([
    PROYECTO_ESTADO.BORRADOR,
    PROYECTO_ESTADO.EN_REVISION,
    PROYECTO_ESTADO.ABIERTO,
    PROYECTO_ESTADO.FINALIZADO,
  ]);
});

test("no se puede dar de baja un proyecto con conflicto de intereses", () => {
  expect(puedeDarDeBaja({ conflictoDeIntereses: true })).toBe(false);
  expect(puedeDarDeBaja({ conflictoDeIntereses: false })).toBe(true);
  expect(puedeDarDeBaja({})).toBe(true);
});
