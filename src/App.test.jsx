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
    if (config.url !== "/habilidades") {
      return respuesta(config, {
        data: [],
        meta: { page: 1, per_page: 12, total: 0, total_pages: 0 },
      });
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
  expect(screen.getByText("Mostrando 1–1 de 1")).toBeInTheDocument();
  expect(
    screen.queryByRole("navigation", { name: "Paginación de habilidades" }),
  ).not.toBeInTheDocument();
});

test("crea con el request de backend, limpia el formulario y actualiza el catálogo", async () => {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole("heading", { name: "React" });
  await user.type(screen.getByLabelText(/^Nombre de la habilidad/), "Vue");
  await user.type(screen.getByLabelText("Descripción"), "Otra interfaz");
  await user.click(screen.getByRole("button", { name: "Crear habilidad" }));
  expect(await screen.findByRole("heading", { name: "Vue" })).toBeInTheDocument();
  const post = transporte.mock.calls.find(([config]) => config.method === "post")[0];
  expect(JSON.parse(post.data)).toEqual({ titulo: "Vue", descripcion: "Otra interfaz" });
  expect(screen.getByLabelText(/^Nombre de la habilidad/)).toHaveValue("");
  expect(screen.getByRole("status")).toHaveTextContent("Habilidad creada correctamente.");
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
  await user.type(screen.getByLabelText(/^Nombre de la habilidad/), "React");
  await user.click(screen.getByRole("button", { name: "Crear habilidad" }));
  const mensaje = await screen.findByText("Esa habilidad ya existe.");
  expect(mensaje.closest('[role="alert"]')).not.toBeNull();
  expect(screen.queryByText("Ya existe esa habilidad")).not.toBeInTheDocument();
  expect(screen.getByLabelText(/^Nombre de la habilidad/)).toHaveValue("React");
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
    await screen.findByRole("heading", {
      name: "Todavía no hay habilidades en el catálogo",
    }),
  ).toBeInTheDocument();
});

test("reintenta solo los GET y, si sigue sin conexión, ofrece Reintentar", async () => {
  const user = userEvent.setup();
  const sinConexion = async (config) => {
    throw new axios.AxiosError("Network Error", "ERR_NETWORK", config);
  };
  transporte
    .mockImplementationOnce(sinConexion)
    .mockImplementationOnce(sinConexion)
    .mockImplementationOnce(sinConexion);
  render(<App />);
  const titulo = await screen.findByText(
    "No pudimos cargar las habilidades",
    {},
    { timeout: 3000 },
  );
  expect(transporte).toHaveBeenCalledTimes(3);
  const error = titulo.closest('[role="alert"]');
  expect(error).toHaveTextContent("Revisá tu conexión");
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(await screen.findByRole("heading", { name: "React" })).toBeInTheDocument();
});

test("toma la página de la URL", async () => {
  window.history.replaceState({}, "", "/habilidades?pagina=2");
  items = Array.from({ length: 11 }, (_, index) => ({
    ...habilidad,
    codigo: `h${index}`,
    titulo: `Habilidad ${index}`,
  }));
  render(<App />);
  expect(
    await screen.findByRole("heading", { name: "Habilidad 10" }),
  ).toBeInTheDocument();
  expect(transporte.mock.calls[0][0].params).toEqual({ page: 2, limit: 10 });
  expect(document.querySelector('[aria-current="page"]')).toHaveTextContent(
    "Página 2 de 2",
  );
});

test("una página fuera de rango ofrece volver a la primera", async () => {
  const user = userEvent.setup();
  window.history.replaceState({}, "", "/habilidades?pagina=9");
  render(<App />);
  await screen.findByRole("heading", { name: "No hay habilidades en esta página" });
  await user.click(screen.getByRole("button", { name: "Volver a la primera página" }));
  expect(await screen.findByRole("heading", { name: "React" })).toBeInTheDocument();
  expect(window.location.search).toBe("");
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
  expect(await screen.findByText("Cargando habilidades…")).toBeInTheDocument();
  await waitFor(() => expect(transporte).toHaveBeenCalled());
  const signal = transporte.mock.calls[0][0].signal;
  vista.unmount();
  expect(signal.aborted).toBe(true);
  resolver();
});

test("el título de la pestaña nombra la pantalla", async () => {
  render(<App />);
  await screen.findByRole("heading", { name: "React" });
  expect(document.title).toBe("Habilidades · Código a Voluntad");
});

test("una ruta inexistente muestra la 404 y permite volver al inicio", async () => {
  const user = userEvent.setup();
  window.history.replaceState({}, "", "/no-existe");
  render(<App />);
  expect(
    screen.getByRole("heading", { level: 1, name: "No encontramos esta página" }),
  ).toBeInTheDocument();
  expect(document.title).toBe("Página no encontrada · Código a Voluntad");
  await user.click(screen.getByRole("link", { name: "Volver al inicio" }));
  const titulo = await screen.findByRole("heading", {
    level: 1,
    name: "Conectamos colectivos sociales con personas que desarrollan software",
  });
  expect(window.location.pathname).toBe("/");
  expect(titulo).toHaveFocus();
});

test("/sin-permiso explica qué pasó", () => {
  window.history.replaceState({}, "", "/sin-permiso");
  render(<App />);
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "No tenés permiso para ver esta página",
    }),
  ).toBeInTheDocument();
});
