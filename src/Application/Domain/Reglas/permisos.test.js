import { describe, expect, it } from "vitest";
import { PERMISO } from "@/Application/Domain/Enums/PERMISO.js";
import { tienePermiso } from "./permisos.js";

describe("tienePermiso", () => {
  it("lee los permisos del contexto actual", () => {
    const cuenta = {
      rol: "COLECTIVO",
      contextoActual: { permisos: [PERMISO.MIEMBRO_ELIMINAR] },
    };
    expect(tienePermiso(cuenta, PERMISO.MIEMBRO_ELIMINAR)).toBe(true);
    expect(tienePermiso(cuenta, PERMISO.LIDER_ASIGNAR)).toBe(false);
  });

  it("sin contexto informado conserva el comportamiento anterior del rol", () => {
    expect(
      tienePermiso({ rol: "COLECTIVO", contextoActual: null }, PERMISO.COLECTIVO_EDITAR),
    ).toBe(true);
    expect(
      tienePermiso({ rol: null, contextoActual: null }, PERMISO.COLECTIVO_EDITAR),
    ).toBe(false);
    expect(tienePermiso(null, PERMISO.COLECTIVO_EDITAR)).toBe(false);
  });
});
