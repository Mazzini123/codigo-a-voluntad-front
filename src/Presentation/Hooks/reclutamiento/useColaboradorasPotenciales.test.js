import { renderHook, waitFor } from "@testing-library/react";
import { useColaboradorasPotenciales } from "./useColaboradorasPotenciales.js";

const proyecto = {
  id: "p1",
  titulo: "Turnos",
  perfiles: [{ id: "pe1", descripcion: "Interfaz" }],
};
const pagina = { items: [{ colaborador: { id: "ada" } }], pagina: 1, totalPaginas: 2 };

function armar({ buscar } = {}) {
  return {
    proyectos: { obtenerProyecto: vi.fn(async () => proyecto) },
    reclutamiento: {
      buscarColaboradorasPotenciales: buscar ?? vi.fn(async () => pagina),
    },
  };
}

test("pide el proyecto y la página en paralelo y encuentra el perfil", async () => {
  const dependencias = armar();
  const { result } = renderHook(() =>
    useColaboradorasPotenciales("p1", "pe1", 1, dependencias),
  );
  expect(result.current.cargando).toBe(true);
  await waitFor(() => expect(result.current.resultado).toEqual(pagina));
  expect(result.current.proyecto).toBe(proyecto);
  expect(result.current.perfil).toBe(proyecto.perfiles[0]);
  expect(result.current.cargando).toBe(false);
  expect(dependencias.proyectos.obtenerProyecto).toHaveBeenCalledWith("p1", {
    signal: expect.any(AbortSignal),
  });
  expect(dependencias.reclutamiento.buscarColaboradorasPotenciales).toHaveBeenCalledWith(
    "p1",
    "pe1",
    { page: 1, limit: 12 },
    { signal: expect.any(AbortSignal) },
  );
});

test("un perfil que no está en el proyecto queda en null", async () => {
  const dependencias = armar();
  const { result } = renderHook(() =>
    useColaboradorasPotenciales("p1", "otro", 1, dependencias),
  );
  await waitFor(() => expect(result.current.proyecto).toBe(proyecto));
  expect(result.current.perfil).toBeNull();
});

test("al cambiar de página conserva lo anterior y marca la carga de la página", async () => {
  const dependencias = armar();
  const { result, rerender } = renderHook(
    ({ numero }) => useColaboradorasPotenciales("p1", "pe1", numero, dependencias),
    { initialProps: { numero: 1 } },
  );
  await waitFor(() => expect(result.current.resultado).toEqual(pagina));
  const segunda = { ...pagina, pagina: 2 };
  dependencias.reclutamiento.buscarColaboradorasPotenciales.mockImplementation(
    () => new Promise((resolver) => setTimeout(() => resolver(segunda), 20)),
  );
  rerender({ numero: 2 });
  await waitFor(() => expect(result.current.cargandoPagina).toBe(true));
  expect(result.current.cargando).toBe(false);
  expect(result.current.resultado).toEqual(pagina);
  await waitFor(() => expect(result.current.resultado).toEqual(segunda));
  expect(result.current.cargandoPagina).toBe(false);
});

test("un error se informa y reintentar vuelve a pedir", async () => {
  const buscar = vi
    .fn()
    .mockRejectedValueOnce(new Error("falló"))
    .mockResolvedValue(pagina);
  const dependencias = armar({ buscar });
  const { result } = renderHook(() =>
    useColaboradorasPotenciales("p1", "pe1", 1, dependencias),
  );
  await waitFor(() => expect(result.current.error).not.toBeNull());
  expect(result.current.cargando).toBe(false);
  await result.current.reintentar();
  await waitFor(() => expect(result.current.resultado).toEqual(pagina));
  expect(result.current.error).toBeNull();
});
