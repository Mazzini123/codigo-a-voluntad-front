import {
  aRequestAlta,
  cambios,
  erroresDesdeIssues,
  estadoInicial,
} from "./formularioColaboradora.js";

const COLABORADORA = {
  id: "co1",
  nombreFantasia: "Pixel",
  nombre: null,
  apellido: null,
  cuentaGit: "pixel-dev",
  presentacion: "Me gusta el front.",
  pronombres: ["elle"],
  recibeMensajeriaInterna: false,
  redesSociales: [],
  habilidades: [{ codigo: "react", titulo: "React" }],
};

test("el alta manda solo la identificación elegida y los códigos de habilidades", () => {
  const estado = {
    ...estadoInicial(null),
    identificacion: "NOMBRE",
    nombreFantasia: "no se manda",
    nombre: " Ana ",
    apellido: "Pérez",
    cuentaGit: "  ",
    habilidades: [{ codigo: "react", titulo: "React" }],
    mediosDeContacto: [{ clave: "m1", tipo: "SMS", valor: "11 2222-3333" }],
  };
  expect(aRequestAlta(estado)).toEqual({
    nombreFantasia: null,
    nombre: "Ana",
    apellido: "Pérez",
    cuentaGit: null,
    presentacion: null,
    pronombres: [],
    codigosHabilidades: ["react"],
    recibeMensajeriaInterna: false,
    mediosDeContacto: [{ tipo: "SMS", valor: "1122223333" }],
    redesSociales: [],
  });
});

test("la edición manda solo los campos editables que cambiaron", () => {
  const original = estadoInicial(COLABORADORA);
  expect(original.identificacion).toBe("FANTASIA");
  expect(cambios(original, original)).toEqual({});
  const editado = {
    ...original,
    presentacion: "",
    recibeMensajeriaInterna: true,
    nombreFantasia: "Otro",
    habilidades: [],
  };
  expect(cambios(original, editado)).toEqual({
    presentacion: null,
    recibeMensajeriaInterna: true,
  });
});

test("los issues de habilidades van al selector", () => {
  const { errores } = erroresDesdeIssues(
    [{ path: ["codigosHabilidades"], message: "Habilidad inexistente" }],
    estadoInicial(null),
  );
  expect(errores).toEqual({ habilidades: "Revisá las habilidades." });
});
