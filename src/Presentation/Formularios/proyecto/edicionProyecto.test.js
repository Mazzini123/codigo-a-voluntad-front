import {
  administracionDelProyecto,
  crearEstadoDeAdministracion,
} from "./edicionProyecto.js";

function aplicar(...acciones) {
  return acciones.reduce(administracionDelProyecto, crearEstadoDeAdministracion());
}

const original = { descripcion: "Frontend", limiteColaboraciones: 2 };

test("abrir un perfil empieza con el borrador igual al original", () => {
  expect(
    aplicar({ tipo: "abrir", queSeEdita: "perfil", original, perfilId: "pe1" }).edicion,
  ).toEqual({ tipo: "perfil", original, borrador: original, perfilId: "pe1" });
});

test("cambiar actualiza el borrador sin tocar el original", () => {
  const { edicion } = aplicar(
    { tipo: "abrir", queSeEdita: "perfil", original, perfilId: "pe1" },
    { tipo: "cambiar", campos: { limiteColaboraciones: 3 } },
  );
  expect(edicion.borrador).toEqual({ descripcion: "Frontend", limiteColaboraciones: 3 });
  expect(edicion.original).toBe(original);
});

test("cambiar sin edición abierta no hace nada", () => {
  const inicial = crearEstadoDeAdministracion();
  expect(administracionDelProyecto(inicial, { tipo: "cambiar", campos: {} })).toBe(
    inicial,
  );
});

test("pedir y cancelar una confirmación", () => {
  const pedida = aplicar({ tipo: "pedirConfirmacion", cual: "finalizar" });
  expect(pedida.confirmacion).toBe("finalizar");
  expect(
    administracionDelProyecto(pedida, { tipo: "cancelarConfirmacion" }).confirmacion,
  ).toBeNull();
});

test("cerrar descarta la edición y la confirmación", () => {
  expect(
    aplicar(
      { tipo: "abrir", queSeEdita: "proyecto", original },
      { tipo: "pedirConfirmacion", cual: "descartar" },
      { tipo: "cerrar" },
    ),
  ).toEqual(crearEstadoDeAdministracion());
});

test("una acción desconocida es un error de programación", () => {
  expect(() => aplicar({ tipo: "otra" })).toThrow("Acción desconocida: otra");
});
