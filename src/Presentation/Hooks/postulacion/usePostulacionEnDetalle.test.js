import {
  crearEstadoDePostulacion,
  postulacionEnDetalle,
} from "./usePostulacionEnDetalle.js";

const perfil = { id: "pe1" };

function aplicar(...acciones) {
  return acciones.reduce(postulacionEnDetalle, crearEstadoDePostulacion());
}

test("abrir el diálogo empieza con la postulación pública", () => {
  expect(aplicar({ tipo: "abrir", perfil }).aPostular).toEqual({
    perfil,
    esPublica: true,
  });
});

test("cambiar la visibilidad sin diálogo abierto no hace nada", () => {
  const inicial = crearEstadoDePostulacion();
  expect(
    postulacionEnDetalle(inicial, { tipo: "cambiarVisibilidad", esPublica: false }),
  ).toBe(inicial);
});

test("al registrar cierra el diálogo y recuerda la postulación confirmada", () => {
  const colaboracion = { id: "c1", perfil: "pe1", estado: "PENDIENTE" };
  const estado = aplicar(
    { tipo: "abrir", perfil },
    { tipo: "cambiarVisibilidad", esPublica: false },
    { tipo: "registrada", perfilId: "pe1", colaboracion },
  );
  expect(estado.aPostular).toBeNull();
  expect(estado.confirmadas.get("pe1")).toBe(colaboracion);
});

test("las confirmadas que ya llegaron del servidor se olvidan", () => {
  const registrada = aplicar({
    tipo: "registrada",
    perfilId: "pe1",
    colaboracion: { id: "c1" },
  });
  const sincronizada = postulacionEnDetalle(registrada, {
    tipo: "sincronizadas",
    perfilIds: ["pe1"],
  });
  expect(sincronizada.confirmadas.size).toBe(0);
  expect(
    postulacionEnDetalle(sincronizada, { tipo: "sincronizadas", perfilIds: ["pe1"] }),
  ).toBe(sincronizada);
});

test("la actualización guarda qué consultas quedaron pendientes", () => {
  const estado = aplicar(
    { tipo: "actualizacionIniciada" },
    { tipo: "actualizacionTerminada", pendientes: ["postulaciones"] },
  );
  expect(estado).toMatchObject({
    actualizando: false,
    consultasPendientes: ["postulaciones"],
  });
});

test("una acción desconocida es un error de programación", () => {
  expect(() => aplicar({ tipo: "otra" })).toThrow("Acción desconocida: otra");
});
