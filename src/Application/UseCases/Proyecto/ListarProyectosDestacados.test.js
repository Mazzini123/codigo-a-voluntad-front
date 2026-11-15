import { crearListarProyectosDestacados } from "./ListarProyectosDestacados.js";

test("devuelve el arreglo de resúmenes tal como lo entrega el back", async () => {
  const resumenes = [{ id: "a", destacado: true }];
  const listarDestacados = vi.fn(async () => resumenes);
  const signal = new AbortController().signal;
  const resultado = await crearListarProyectosDestacados({ listarDestacados })({
    signal,
  });
  expect(resultado).toEqual(resumenes);
  expect(listarDestacados).toHaveBeenCalledWith({ signal });
});

test("una respuesta que no es un arreglo se trata como sin destacados", async () => {
  const listarDestacados = async () => ({ data: [], meta: {} });
  expect(await crearListarProyectosDestacados({ listarDestacados })()).toEqual([]);
});
