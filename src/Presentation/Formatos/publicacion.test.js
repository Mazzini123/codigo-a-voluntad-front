import { ESTADO_BUSQUEDA, selloDeProyecto } from "./proyecto.js";
import {
  avisoDePublicacion,
  selloDelDueno,
  textoDeFechaSinPublicar,
  textoDeRechazo,
} from "./publicacion.js";

const rechazo = { nota: "Falta la fecha.", fecha: "2026-11-12T15:00:00.000Z" };

test("los estados sin publicar tienen sello con texto", () => {
  expect(selloDeProyecto("BORRADOR")).toEqual({
    tipo: ESTADO_BUSQUEDA.CERRADA,
    texto: "Borrador",
  });
  expect(selloDeProyecto("EN_REVISION")).toEqual({
    tipo: ESTADO_BUSQUEDA.LIMITE,
    texto: "En revisión",
  });
});

test("un borrador con cambios pedidos lo dice en tono de aviso, no de rechazo", () => {
  expect(selloDelDueno({ estado: "BORRADOR", publicacion: { rechazo } })).toEqual({
    tipo: ESTADO_BUSQUEDA.LIMITE,
    texto: "Con cambios pedidos",
  });
  expect(selloDelDueno({ estado: "BORRADOR" }).texto).toBe("Borrador");
  expect(selloDelDueno({ estado: "ABIERTO" }).texto).toBe("Abierto");
});

test("el texto del rechazo incluye la fecha y la nota", () => {
  expect(textoDeRechazo(rechazo)).toBe(
    "Administración pidió cambios el 12 de noviembre de 2026: Falta la fecha.",
  );
});

test("un rechazo sin nota lo dice igual", () => {
  expect(textoDeRechazo({ nota: null, fecha: rechazo.fecha })).toBe(
    "Administración pidió cambios el 12 de noviembre de 2026, sin dejar una nota.",
  );
});

describe("aviso de un proyecto sin publicar", () => {
  test("al dueño le explica qué puede hacer en cada estado", () => {
    expect(
      avisoDePublicacion({ estado: "BORRADOR" }, { esAdministracion: false }),
    ).toEqual({
      titulo: "Borrador",
      descripcion:
        "Lo ven solo tu colectivo y administración. Cuando esté listo, pedí su publicación.",
    });
    expect(
      avisoDePublicacion(
        { estado: "BORRADOR", publicacion: { rechazo } },
        { esAdministracion: false },
      ),
    ).toEqual({
      titulo: "Con cambios pedidos",
      rechazo: {
        etiqueta: "Qué pidió administración el 12 de noviembre de 2026",
        nota: "Falta la fecha.",
      },
      descripcion: "Cuando hagas los cambios, volvé a pedir la publicación.",
    });
    expect(
      avisoDePublicacion(
        { estado: "BORRADOR", publicacion: { rechazo: { ...rechazo, nota: "  " } } },
        { esAdministracion: false },
      ).rechazo,
    ).toEqual({
      etiqueta: "Administración pidió cambios el 12 de noviembre de 2026",
      nota: "No dejó una nota. Revisá los datos y los perfiles antes de volver a pedir la publicación.",
    });
    expect(
      avisoDePublicacion(
        {
          estado: "EN_REVISION",
          publicacion: { solicitadaEn: "2026-11-14T15:00:00.000Z", rechazo: null },
        },
        { esAdministracion: false },
      ),
    ).toEqual({
      titulo: "En revisión",
      descripcion:
        "Pediste la publicación el 14 de noviembre de 2026. Hasta que administración la apruebe o pida cambios, no se puede editar.",
      ayuda: "No te llega un aviso: el resultado lo ves acá y en Mis proyectos.",
    });
    expect(
      avisoDePublicacion({ estado: "EN_REVISION" }, { esAdministracion: false })
        .descripcion,
    ).toBe(
      "Pediste la publicación. Hasta que administración la apruebe o pida cambios, no se puede editar.",
    );
  });

  test("la fila de un proyecto en revisión dice cuándo se pidió la publicación", () => {
    expect(
      textoDeFechaSinPublicar({
        estado: "EN_REVISION",
        publicacion: { solicitadaEn: "2026-11-14T15:00:00.000Z" },
      }),
    ).toEqual({ texto: "Publicación pedida el ", fecha: "2026-11-14T15:00:00.000Z" });
    expect(textoDeFechaSinPublicar({ estado: "EN_REVISION" })).toBeNull();
    expect(
      textoDeFechaSinPublicar({
        estado: "BORRADOR",
        fechaCreacion: "2026-11-01T12:00:00Z",
      }),
    ).toBeNull();
  });

  test("a administración le aclara que es una vista previa", () => {
    expect(
      avisoDePublicacion({ estado: "EN_REVISION" }, { esAdministracion: true }),
    ).toEqual({
      titulo: "En revisión",
      descripcion:
        "Vista previa: todavía no está publicado. Lo ven solo el colectivo y administración.",
    });
  });

  test("un proyecto publicado no tiene aviso", () => {
    expect(
      avisoDePublicacion({ estado: "ABIERTO" }, { esAdministracion: true }),
    ).toBeNull();
  });
});

describe("proyecto dado de baja", () => {
  const baja = { motivo: "Publica datos personales.", fecha: "2026-11-16T15:00:00.000Z" };

  test("tiene su propio sello, con texto", () => {
    expect(selloDeProyecto("DADO_DE_BAJA")).toEqual({
      tipo: ESTADO_BUSQUEDA.RECHAZADA,
      texto: "Dado de baja",
    });
    expect(selloDelDueno({ estado: "DADO_DE_BAJA", baja }).texto).toBe("Dado de baja");
  });

  test("el aviso muestra el motivo y que ya no se puede editar ni publicar", () => {
    const aviso = avisoDePublicacion(
      { estado: "DADO_DE_BAJA", baja },
      { esAdministracion: false },
    );
    expect(aviso).toEqual({
      titulo: "Dado de baja",
      rechazo: {
        etiqueta: "Motivo de la baja, 16 de noviembre de 2026",
        nota: "Publica datos personales.",
      },
      descripcion:
        "Administración lo dio de baja por no cumplir los términos y condiciones. Ya no se puede editar ni publicar, y nadie más que tu colectivo y administración lo ve.",
    });
  });

  test("sin el detalle de la baja, el aviso igual explica qué pasó", () => {
    expect(
      avisoDePublicacion({ estado: "DADO_DE_BAJA" }, { esAdministracion: true }),
    ).toEqual({
      titulo: "Dado de baja",
      descripcion:
        "Administración lo dio de baja por no cumplir los términos y condiciones. Ya no se puede editar ni publicar, y nadie más que tu colectivo y administración lo ve.",
    });
  });

  test("no tiene fecha de publicación pedida", () => {
    expect(textoDeFechaSinPublicar({ estado: "DADO_DE_BAJA", baja })).toEqual({
      texto: "Dado de baja el ",
      fecha: baja.fecha,
    });
  });
});
