import { renderHook, waitFor } from "@testing-library/react";
import { colaboracionDependencies } from "../Dependencies/colaboracionDependencies.js";
import { useProyectosPostulados } from "./useProyectosPostulados.js";

test("agrupa pendientes y aceptadas por proyecto y descarta las demás", async () => {
  const listar = vi
    .spyOn(colaboracionDependencies, "listarColaboracionesDeColaborador")
    .mockResolvedValue([
      ...["PENDIENTE", "ACEPTADA", "RECHAZADA", "FINALIZADA", "DESVINCULADA"].map(
        (estado, i) => ({
          proyectoId: "p1",
          colaboracion: { perfil: `pe${i}`, estado },
        }),
      ),
      { proyectoId: "p2", colaboracion: { perfil: "pe5", estado: "ACEPTADA" } },
    ]);
  try {
    const { result } = renderHook(() => useProyectosPostulados("ana"));
    await waitFor(() =>
      expect(result.current).toEqual(
        new Map([
          [
            "p1",
            [
              { perfilId: "pe0", estado: "PENDIENTE" },
              { perfilId: "pe1", estado: "ACEPTADA" },
            ],
          ],
          ["p2", [{ perfilId: "pe5", estado: "ACEPTADA" }]],
        ]),
      ),
    );
    expect(listar).toHaveBeenCalledTimes(1);
  } finally {
    listar.mockRestore();
  }
});
