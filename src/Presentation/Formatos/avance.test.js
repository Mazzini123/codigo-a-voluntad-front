import {
  avisoDeAvanceRegistrado,
  ordenarPorFechaDesc,
  porcentajeActual,
  textoDeAvanceRegistrado,
  tituloDelAvance,
} from "./avance.js";

test("ordena del más reciente al más viejo y deja al final lo que no trae fecha", () => {
  const registros = [
    { id: "a", fecha: "2026-11-01" },
    { id: "b" },
    { id: "c", fecha: "2026-11-05" },
    { id: "d", fecha: "no es una fecha" },
  ];
  expect(ordenarPorFechaDesc(registros).map(({ id }) => id)).toEqual([
    "c",
    "a",
    "b",
    "d",
  ]);
  expect(registros[0].id).toBe("a");
});

test("el porcentaje actual sale del proyecto, después del avance más reciente y si no, de nada", () => {
  const avances = [
    { id: "a2", porcentajeConcrecion: 60 },
    { id: "a1", porcentajeConcrecion: 30 },
  ];
  expect(porcentajeActual({ porcentajeConcrecion: 45 }, avances)).toBe(45);
  expect(porcentajeActual({}, avances)).toBe(60);
  expect(porcentajeActual({ porcentajeConcrecion: 0 }, [])).toBe(0);
  expect(porcentajeActual({}, [])).toBeNull();
});

test("ignora porcentajes fuera de rango o que no son números", () => {
  expect(porcentajeActual({ porcentajeConcrecion: 140 }, [])).toBeNull();
  expect(porcentajeActual({ porcentajeConcrecion: "40" }, [])).toBeNull();
  expect(
    porcentajeActual({}, [{ porcentajeConcrecion: -1 }, { porcentajeConcrecion: 20 }]),
  ).toBe(20);
});

test("arma los textos de la pantalla", () => {
  expect(tituloDelAvance("Turnos")).toBe("Avance de Turnos");
  expect(avisoDeAvanceRegistrado(60)).toBe("Registramos el avance: 60 %.");
  expect(textoDeAvanceRegistrado({ porcentajeConcrecion: 25 })).toBe(
    "Avance registrado: 25 %",
  );
  expect(textoDeAvanceRegistrado({})).toBe("Avance registrado");
});
