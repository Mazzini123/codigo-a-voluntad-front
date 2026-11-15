import { ESTADO_SOLICITUD } from "@/Application/Domain/Enums/ESTADO_SOLICITUD.js";
import {
  selloDeSolicitud,
  textoDeRevisionSinNovedades,
} from "@/Presentation/Formatos/membresia.js";

describe("selloDeSolicitud", () => {
  test.each([
    [ESTADO_SOLICITUD.PENDIENTE, "pendiente", "Pendiente"],
    [ESTADO_SOLICITUD.ACEPTADA, "aceptada", "Aceptada"],
    [ESTADO_SOLICITUD.RECHAZADA, "rechazada", "Rechazada"],
    [ESTADO_SOLICITUD.CANCELADA, "cerrada", "Cancelada"],
    ["DESCONOCIDO", "cerrada", "Sin estado"],
  ])("%s se muestra con el sello %s y el texto «%s»", (estado, tipo, texto) => {
    expect(selloDeSolicitud(estado)).toEqual({ tipo, texto });
  });
});

test("la revisión sin novedades dice la hora en que se revisó", () => {
  expect(textoDeRevisionSinNovedades(new Date(2026, 10, 14, 9, 5))).toBe(
    "Todavía no te aceptaron. Revisamos a las 09:05.",
  );
});
