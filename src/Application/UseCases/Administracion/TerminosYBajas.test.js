import { crearDarDeBajaColectivo } from "./DarDeBajaColectivo.js";
import { crearDarDeBajaProyecto } from "./DarDeBajaProyecto.js";
import { crearPublicarTerminos } from "./PublicarTerminos.js";

test("publicar términos manda el texto sin espacios sobrantes en los bordes", async () => {
  const publicarTerminos = vi.fn(async () => ({ version: 3 }));
  const signal = new AbortController().signal;
  const resultado = await crearPublicarTerminos({ publicarTerminos })(
    "  ## Reglas\n\nUsá bien la plataforma.  ",
    { signal },
  );
  expect(publicarTerminos).toHaveBeenCalledWith(
    { texto: "## Reglas\n\nUsá bien la plataforma." },
    { signal },
  );
  expect(resultado.version).toBe(3);
});

test.each([
  ["proyecto", crearDarDeBajaProyecto, "darDeBajaProyecto"],
  ["colectivo", crearDarDeBajaColectivo, "darDeBajaColectivo"],
])("dar de baja un %s manda el motivo recortado", async (_, crear, metodo) => {
  const operacion = vi.fn(async () => ({ id: "x1" }));
  const signal = new AbortController().signal;
  await crear({ [metodo]: operacion })("x1", "  Incumple los términos.  ", { signal });
  expect(operacion).toHaveBeenCalledWith(
    "x1",
    { motivo: "Incumple los términos." },
    { signal },
  );
});
