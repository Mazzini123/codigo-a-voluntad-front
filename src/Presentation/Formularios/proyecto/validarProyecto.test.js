import { perfilVacio } from "./formularioProyecto.js";
import {
  pasoMaximoPermitido,
  validarDatosDelProyecto,
  validarPerfil,
} from "./validarProyecto.js";

const AHORA = new Date("2026-11-06T15:00:00Z");
const REACT = { codigo: "react", titulo: "React" };

function proyectoValido(cambios = {}) {
  return {
    titulo: "Turnos",
    descripcion: "Una app",
    etiquetas: [],
    fechaCierre: "",
    ...cambios,
  };
}

function perfilValido(cambios = {}) {
  return {
    ...perfilVacio(),
    descripcion: "Frontend",
    requeridas: [REACT],
    horas: "5",
    ...cambios,
  };
}

describe("datos del proyecto", () => {
  test("título y descripción son obligatorios", () => {
    expect(
      validarDatosDelProyecto(proyectoValido({ titulo: " ", descripcion: "" }), AHORA),
    ).toEqual({
      titulo: "Escribí el título del proyecto.",
      descripcion: "Escribí la descripción del proyecto.",
    });
  });

  test("la fecha de cierre tiene que ser posterior a hoy", () => {
    expect(
      validarDatosDelProyecto(proyectoValido({ fechaCierre: "2026-11-06" }), AHORA),
    ).toEqual({ fechaCierre: "Elegí una fecha posterior a hoy." });
    expect(
      validarDatosDelProyecto(proyectoValido({ fechaCierre: "2026-11-07" }), AHORA),
    ).toEqual({});
  });
});

describe("perfil", () => {
  test("un perfil completo es válido", () => {
    expect(validarPerfil(perfilValido(), AHORA)).toEqual({});
  });

  test("pide lo que falta con mensajes en lenguaje de la persona", () => {
    expect(validarPerfil(perfilVacio(), AHORA)).toEqual({
      "perfil.descripcion": "Contá qué tendría que hacer esta persona.",
      "perfil.requeridas": "Elegí al menos una habilidad requerida.",
      "perfil.horas": "Escribí cuántas horas: un número entero mayor que 0.",
    });
  });

  test.each(["0", "-2", "1.5", "abc", "2e3"])("las horas %s no valen", (horas) => {
    expect(validarPerfil(perfilValido({ horas }), AHORA)).toHaveProperty("perfil.horas");
  });

  test("hasta completar lugares exige un límite entero mayor que 0", () => {
    const base = { modoAceptacion: "HASTA_LLENAR_VACANTES" };
    expect(validarPerfil(perfilValido({ ...base, limite: "" }), AHORA)).toHaveProperty(
      "perfil.limite",
    );
    expect(validarPerfil(perfilValido({ ...base, limite: "0" }), AHORA)).toHaveProperty(
      "perfil.limite",
    );
    expect(validarPerfil(perfilValido({ ...base, limite: "3" }), AHORA)).toEqual({});
  });

  test("con revisión manual el límite puede quedar vacío pero no ser inválido", () => {
    expect(validarPerfil(perfilValido({ limite: "" }), AHORA)).toEqual({});
    expect(validarPerfil(perfilValido({ limite: "-1" }), AHORA)).toHaveProperty(
      "perfil.limite",
    );
  });

  test("aceptar a todas no mira el límite", () => {
    expect(
      validarPerfil(perfilValido({ modoAceptacion: "TODO_SUMA", limite: "xx" }), AHORA),
    ).toEqual({});
  });

  test("una habilidad no puede ser requerida y opcional a la vez", () => {
    expect(validarPerfil(perfilValido({ opcionales: [REACT] }), AHORA)).toEqual({
      "perfil.opcionales": "Una habilidad no puede ser requerida y opcional a la vez.",
    });
  });

  test("la fecha de cierre de la búsqueda tiene que ser posterior a hoy", () => {
    expect(
      validarPerfil(perfilValido({ fechaCierreBusqueda: "2026-11-06" }), AHORA),
    ).toHaveProperty("perfil.fechaCierreBusqueda");
  });
});

describe("hasta qué paso se puede llegar", () => {
  test("sin datos del proyecto, solo el paso 1", () => {
    expect(pasoMaximoPermitido({ ...proyectoValido(), titulo: "" }, [], AHORA)).toBe(1);
  });

  test("con el proyecto completo pero sin perfiles, hasta el paso 2", () => {
    expect(pasoMaximoPermitido(proyectoValido(), [], AHORA)).toBe(2);
  });

  test("con al menos un perfil guardado, hasta el paso 3", () => {
    expect(pasoMaximoPermitido(proyectoValido(), [perfilValido()], AHORA)).toBe(3);
  });
});
