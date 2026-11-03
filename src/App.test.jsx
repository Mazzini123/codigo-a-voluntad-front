import axios from "axios";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";
import { axiosClient } from "./Infrastructure/Http/axiosClient.js";

const habilidad = {
  codigo: "react",
  titulo: "React",
  descripcion: "Interfaces web",
  fechaCreacion: "2026-11-03T12:00:00.000Z",
  usuario: "admin",
  activo: true,
};
const originalAdapter = axiosClient.defaults.adapter;
let transporte;
let items;

function respuesta(config, data, status = 200) {
  return { config, data, status, statusText: "OK", headers: {} };
}

beforeEach(() => {
  window.history.replaceState({}, "", "/habilidades");
  items = [habilidad];
  transporte = vi.fn(async (config) => {
    if (config.method === "post") {
      const request = JSON.parse(config.data);
      const creada = { ...habilidad, ...request, codigo: request.titulo.toLowerCase() };
      items.push(creada);
      return respuesta(config, creada, 201);
    }
    const { page, limit } = config.params;
    return respuesta(config, {
      data: items.slice((page - 1) * limit, page * limit),
      meta: {
        page,
        per_page: limit,
        total: items.length,
        total_pages: Math.ceil(items.length / limit),
      },
    });
  });
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  cleanup();
  axiosClient.defaults.adapter = originalAdapter;
});

test("lista las habilidades atravesando todas las capas", async () => {
  render(<App />);
  expect(await screen.findByRole("heading", { name: "React" })).toBeInTheDocument();
  expect(transporte.mock.calls[0][0]).toMatchObject({
    method: "get",
    url: "/habilidades",
    baseURL: "/api",
    params: { page: 1, limit: 10 },
  });
  expect(screen.getByText(/Página 1 de 1/)).toBeInTheDocument();
});

test("crea con el request de backend, limpia el formulario y actualiza el catálogo", async () => {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole("heading", { name: "React" });
  await user.type(screen.getByLabelText("Título"), "Vue");
  await user.type(screen.getByLabelText("Descripción"), "Otra interfaz");
  await user.click(screen.getByRole("button", { name: "Crear habilidad" }));
  expect(await screen.findByRole("heading", { name: "Vue" })).toBeInTheDocument();
  const post = transporte.mock.calls.find(([config]) => config.method === "post")[0];
  expect(JSON.parse(post.data)).toEqual({ titulo: "Vue", descripcion: "Otra interfaz" });
  expect(screen.getByLabelText("Título")).toHaveValue("");
  expect(screen.getByText("Habilidad creada correctamente.")).toBeInTheDocument();
});

test("conserva los datos y muestra el conflicto al crear una habilidad duplicada", async () => {
  const user = userEvent.setup();
  const listar = transporte.getMockImplementation();
  transporte.mockImplementation(async (config) => {
    if (config.method === "post") {
      throw new axios.AxiosError(
        "Conflict",
        "ERR_BAD_REQUEST",
        config,
        null,
        respuesta(config, { message: "Ya existe esa habilidad" }, 409),
      );
    }
    return listar(config);
  });
  render(<App />);
  await screen.findByRole("heading", { name: "React" });
  await user.type(screen.getByLabelText("Título"), "React");
  await user.click(screen.getByRole("button", { name: "Crear habilidad" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Ya existe esa habilidad");
  expect(screen.getByLabelText("Título")).toHaveValue("React");
  expect(screen.getByRole("button", { name: "Crear habilidad" })).toBeEnabled();
});

test("pagina con page y limit y muestra el estado vacío", async () => {
  const user = userEvent.setup();
  items = Array.from({ length: 11 }, (_, index) => ({
    ...habilidad,
    codigo: `h${index}`,
    titulo: `Habilidad ${index}`,
  }));
  render(<App />);
  await screen.findByRole("heading", { name: "Habilidad 0" });
  await user.click(screen.getByRole("button", { name: "Siguiente" }));
  expect(
    await screen.findByRole("heading", { name: "Habilidad 10" }),
  ).toBeInTheDocument();
  expect(transporte.mock.lastCall[0].params).toEqual({ page: 2, limit: 10 });
  expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
  items = [];
  await user.click(screen.getByRole("button", { name: "Anterior" }));
  expect(
    await screen.findByText("No hay habilidades en esta página."),
  ).toBeInTheDocument();
});

test("permite reintentar luego de un fallo de red", async () => {
  const user = userEvent.setup();
  transporte.mockRejectedValueOnce(new axios.AxiosError("Network Error", "ERR_NETWORK"));
  render(<App />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Revisá la conexión");
  await user.click(screen.getByRole("button", { name: "Actualizar catálogo" }));
  expect(await screen.findByRole("heading", { name: "React" })).toBeInTheDocument();
});

test("muestra carga y cancela la consulta al desmontar", async () => {
  let resolver;
  transporte.mockImplementationOnce(
    (config) =>
      new Promise((resolve) => {
        resolver = () =>
          resolve(
            respuesta(config, {
              data: [],
              meta: { page: 1, per_page: 10, total: 0, total_pages: 0 },
            }),
          );
      }),
  );
  const vista = render(<App />);
  expect(screen.getByText("Cargando habilidades…")).toBeInTheDocument();
  await waitFor(() => expect(transporte).toHaveBeenCalled());
  const signal = transporte.mock.calls[0][0].signal;
  vista.unmount();
  expect(signal.aborted).toBe(true);
  resolver();
});
