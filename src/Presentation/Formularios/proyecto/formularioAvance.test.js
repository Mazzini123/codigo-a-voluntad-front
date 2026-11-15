import {
  armarAvance,
  erroresDeAvanceDesdeIssues,
  leerPorcentaje,
  validarAvance,
} from "./formularioAvance.js";

const valido = {
  porcentaje: "60",
  urlSistema: "https://turnos.example.org",
  urlRepositorio: "https://git.example.org/turnos",
};

test("acepta un porcentaje que supera el actual y dos enlaces válidos", () => {
  expect(validarAvance(valido, 40)).toEqual({});
});

test("el primer avance puede tener cualquier porcentaje entre 0 y 100", () => {
  expect(validarAvance({ ...valido, porcentaje: "0" }, null)).toEqual({});
  expect(validarAvance({ ...valido, porcentaje: "100" }, null)).toEqual({});
});

test("el porcentaje tiene que superar el actual", () => {
  const mensaje = "Tiene que superar el avance actual: 40 %";
  expect(validarAvance({ ...valido, porcentaje: "40" }, 40).porcentaje).toBe(mensaje);
  expect(validarAvance({ ...valido, porcentaje: "39" }, 40).porcentaje).toBe(mensaje);
});

test("el porcentaje es un número entre 0 y 100", () => {
  expect(validarAvance({ ...valido, porcentaje: "" }, null).porcentaje).toBe(
    "Escribí el porcentaje de avance.",
  );
  for (const texto of ["abc", "101", "-1"]) {
    expect(validarAvance({ ...valido, porcentaje: texto }, null).porcentaje).toBe(
      "Escribí un número entre 0 y 100.",
    );
  }
});

test("las dos direcciones son obligatorias y con http o https", () => {
  const errores = validarAvance(
    { porcentaje: "60", urlSistema: "", urlRepositorio: "ftp://repo.example.org" },
    null,
  );
  expect(errores.urlSistema).toBe("Escribí la dirección del sistema.");
  expect(errores.urlRepositorio).toBe(
    "Escribí la dirección completa, empezando con https://.",
  );
});

test("lee decimales con coma o con punto", () => {
  expect(leerPorcentaje("12,5")).toBe(12.5);
  expect(leerPorcentaje(" 12.5 ")).toBe(12.5);
  expect(leerPorcentaje("")).toBeNaN();
});

test("el request usa los nombres del contrato", () => {
  expect(
    armarAvance({
      porcentaje: "60",
      urlSistema: " https://turnos.example.org ",
      urlRepositorio: "https://git.example.org/turnos",
    }),
  ).toEqual({
    porcentajeConcrecion: 60,
    urlSistema: "https://turnos.example.org",
    urlRepositorio: "https://git.example.org/turnos",
  });
});

test("traduce los issues del back a un mensaje por campo y nunca muestra el crudo", () => {
  const errores = erroresDeAvanceDesdeIssues([
    { path: ["porcentajeConcrecion"], code: "too_small", message: "Zod crudo" },
    { path: ["urlRepositorio"], code: "invalid_string" },
    { path: ["otraCosa"], code: "x" },
  ]);
  expect(Object.keys(errores)).toEqual(["porcentaje", "urlRepositorio"]);
  expect(JSON.stringify(errores)).not.toMatch(/Zod|too_small/);
  expect(erroresDeAvanceDesdeIssues(undefined)).toEqual({});
});
