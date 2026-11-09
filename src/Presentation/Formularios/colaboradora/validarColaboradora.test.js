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
