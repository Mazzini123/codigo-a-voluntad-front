import { estadoInicial } from "./formularioColaboradora.js";
import { validarColaboradora, validarPronombre } from "./validarColaboradora.js";

test("en el alta pide identificación y al menos una habilidad", () => {
  expect(Object.keys(validarColaboradora(estadoInicial(null), { esAlta: true }))).toEqual(
    ["identificacion", "habilidades"],
  );
});

test("según la identificación pide nombre de fantasía o nombre y apellido", () => {
  const base = {
    ...estadoInicial(null),
    habilidades: [{ codigo: "react", titulo: "React" }],
  };
  expect(
    Object.keys(
      validarColaboradora({ ...base, identificacion: "FANTASIA" }, { esAlta: true }),
    ),
  ).toEqual(["nombreFantasia"]);
  expect(
    Object.keys(
      validarColaboradora(
        { ...base, identificacion: "NOMBRE", nombre: "Ana" },
        { esAlta: true },
      ),
    ),
  ).toEqual(["apellido"]);
});

test("en la edición no exige identidad ni habilidades", () => {
  expect(validarColaboradora(estadoInicial(null), { esAlta: false })).toEqual({});
});

test("los pronombres no pueden estar vacíos, ser largos ni repetirse", () => {
  expect(validarPronombre(" ", [])).not.toBeNull();
  expect(validarPronombre("a".repeat(21), [])).not.toBeNull();
  expect(validarPronombre("Ella", ["ella"])).not.toBeNull();
  expect(validarPronombre("elle", ["ella"])).toBeNull();
});

describe("usuario de Git y largos máximos", () => {
  const base = {
    ...estadoInicial(null),
    identificacion: "FANTASIA",
    nombreFantasia: "Ana",
    habilidades: [{ codigo: "react", titulo: "React" }],
  };

  test.each(["ana-dev", "ana", "A1"])("acepta el usuario %s", (cuentaGit) => {
    expect(validarColaboradora({ ...base, cuentaGit }, { esAlta: true })).toEqual({});
  });

  test.each(["https://github.com/ana", "ana dev", "-ana", "ana-", "a".repeat(40)])(
    "rechaza %s como usuario",
    (cuentaGit) => {
      expect(
        validarColaboradora({ ...base, cuentaGit }, { esAlta: true }),
      ).toHaveProperty("cuentaGit");
    },
  );

  test("sin usuario no marca error", () => {
    expect(validarColaboradora({ ...base, cuentaGit: "" }, { esAlta: true })).toEqual({});
  });

  test("avisa cuando el nombre o la presentación pasan el máximo", () => {
    const errores = validarColaboradora(
      { ...base, nombreFantasia: "a".repeat(51), presentacion: "a".repeat(1001) },
      { esAlta: true },
    );
    expect(errores.nombreFantasia).toBe(
      "El nombre de fantasía puede tener hasta 50 caracteres.",
    );
    expect(errores.presentacion).toBe(
      "La presentación puede tener hasta 1000 caracteres.",
    );
  });
});
