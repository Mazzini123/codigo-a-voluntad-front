import {
  errorDeRangoDeFechas,
  desdeDelDia,
  OPCIONES_DE_ACCION,
  OPCIONES_DE_ENTIDAD,
  textoDeAccion,
  textoDeDetalle,
  textoDeEntidad,
  textoDeQuien,
} from "./auditoria.js";

test("cada acción y cada tipo de entidad tienen su texto y su opción de filtro", () => {
  expect(textoDeAccion("PROYECTO_DESTACADO")).toBe("Destacó un proyecto");
  expect(textoDeAccion("PROYECTO_DESTACADO_QUITADO")).toBe("Quitó un destacado");
  expect(textoDeAccion("REVISION_RESUELTA")).toBe("Resolvió una revisión");
  expect(textoDeAccion("ADMIN_OTORGADO")).toBe("Otorgó el rol de administración");
  expect(textoDeAccion("NUEVA")).toBe("Acción administrativa");
  expect(textoDeEntidad("PROYECTO")).toBe("Proyecto");
  expect(textoDeEntidad("REVISION")).toBe("Revisión");
  expect(textoDeEntidad("USUARIO")).toBe("Usuaria");
  expect(textoDeEntidad("OTRA")).toBe("Otro elemento");
  expect(textoDeAccion("PROYECTO_PUBLICADO")).toBe(
    "Aprobó la publicación de un proyecto",
  );
  expect(textoDeAccion("PUBLICACION_RECHAZADA")).toBe(
    "Pidió cambios en la publicación de un proyecto",
  );
  expect(textoDeAccion("TERMINOS_ACTUALIZADOS")).toBe(
    "Publicó una versión de los términos",
  );
  expect(textoDeAccion("PROYECTO_DADO_DE_BAJA")).toBe("Dio de baja un proyecto");
  expect(textoDeAccion("COLECTIVO_DADO_DE_BAJA")).toBe("Dio de baja un colectivo");
  expect(textoDeEntidad("COLECTIVO")).toBe("Colectivo");
  expect(textoDeEntidad("TERMINOS")).toBe("Términos y condiciones");
  expect(OPCIONES_DE_ACCION).toHaveLength(9);
  expect(OPCIONES_DE_ENTIDAD).toHaveLength(5);
});

test("sin usuario la acción es del comando del sistema; con usuario, de administración", () => {
  expect(textoDeQuien(null)).toBe("Comando del sistema");
  expect(textoDeQuien("u1")).toBe("Administración");
});

test("el detalle se arma en texto por acción y nunca se muestra crudo", () => {
  expect(
    textoDeDetalle("PROYECTO_DESTACADO", { hasta: "2026-12-16T02:59:59.999Z" }),
  ).toBe("Destacado hasta el 15 de diciembre de 2026");
  expect(
    textoDeDetalle("PROYECTO_DESTACADO", {
      hasta: "2026-12-16T02:59:59.999Z",
      cambio: true,
    }),
  ).toBe("Cambió la fecha: hasta el 15 de diciembre de 2026");
  expect(textoDeDetalle("REVISION_RESUELTA", { estado: "REVISADA" })).toBe(
    "Marcada como revisada",
  );
  expect(textoDeDetalle("REVISION_RESUELTA", { estado: "DESCARTADA" })).toBe(
    "Descartada",
  );
  expect(textoDeDetalle("PROYECTO_PUBLICADO", { revisionId: "r1" })).toBeNull();
  expect(textoDeDetalle("PUBLICACION_RECHAZADA", { revisionId: "r1" })).toBeNull();
  expect(textoDeDetalle("PROYECTO_DESTACADO_QUITADO", {})).toBeNull();
  expect(textoDeDetalle("ADMIN_OTORGADO", { raro: 1 })).toBeNull();
  expect(textoDeDetalle("PROYECTO_DESTACADO", { hasta: "basura" })).toBeNull();
  expect(textoDeDetalle("TERMINOS_ACTUALIZADOS", { version: 4 })).toBe("Versión 4");
  expect(textoDeDetalle("TERMINOS_ACTUALIZADOS", {})).toBeNull();
  expect(
    textoDeDetalle("PROYECTO_DADO_DE_BAJA", { motivo: "Publica datos personales." }),
  ).toBe("Motivo: Publica datos personales.");
  expect(textoDeDetalle("COLECTIVO_DADO_DE_BAJA", { motivo: "Spam." })).toBe(
    "Motivo: Spam.",
  );
  expect(textoDeDetalle("COLECTIVO_DADO_DE_BAJA", { motivo: "  " })).toBeNull();
});

test("el rango de fechas se valida y se manda con el huso de Argentina", () => {
  expect(errorDeRangoDeFechas("2026-11-10", "2026-11-01")).toBe(
    "La fecha «hasta» no puede ser anterior a «desde».",
  );
  expect(errorDeRangoDeFechas("2026-11-01", "2026-11-01")).toBeNull();
  expect(errorDeRangoDeFechas("", "2026-11-01")).toBeNull();
  expect(desdeDelDia("2026-11-01")).toBe("2026-11-01T00:00:00-03:00");
});
