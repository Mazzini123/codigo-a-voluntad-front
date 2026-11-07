import { screen, waitFor, within } from "@testing-library/react";
import axios from "axios";
import { Route } from "react-router-dom";
import { AppLayout } from "../Components/App/AppLayout.jsx";
import { axiosClient } from "../../Infrastructure/Http/axiosClient.js";
import { ProtectedRoute } from "../Routes/ProtectedRoute.jsx";
import { AltaColectivoPage } from "./AltaColectivoPage.jsx";
import { ColectivoPage } from "./ColectivoPage.jsx";
import { MisProyectosPage } from "./MisProyectosPage.jsx";
import { PerfilColectivoPage } from "./PerfilColectivoPage.jsx";
import { montarRutas } from "../../test/montarRutas.jsx";

const COLECTIVO = {
  id: "c1",
  nombre: "Asamblea de Fiorito",
  descripcion: "Comedor y apoyo escolar.",
  tipoColectivo: "ASAMBLEA",
  ubicacion: { tipoUbicacion: "LOCALIDAD", nombre: "Villa Fiorito" },
  proyectos: [{ id: "p1", titulo: "Sistema de turnos del comedor", estado: "ABIERTO" }],
  redesSociales: [{ nombre: "Instagram", url: "https://instagram.com/fiorito" }],
  etiquetas: ["educación"],
  mediosDeContacto: [{ tipo: "WHATSAPP", valor: "+5491122223333" }],
  fechaAlta: "2026-11-01T12:00:00.000Z",
  fechaBaja: null,
};

const adaptadorOriginal = axiosClient.defaults.adapter;
let cuenta;
let transporte;
let guardado;

function respuesta(config, data, status = 200) {
  return { config, data, status, statusText: "", headers: {} };
}

function falla(config, status, data = {}) {
  throw new axios.AxiosError(
    "Error",
    "ERR_BAD_RESPONSE",
    config,
    null,
    respuesta(config, data, status),
  );
}

beforeEach(() => {
  guardado = structuredClone(COLECTIVO);
  cuenta = { id: "cuenta-1", rol: "COLECTIVO", perfilId: "c1" };
  transporte = vi.fn(async (config) => {
    if (config.method === "get" && config.url === "/colectivos/c1")
      return respuesta(config, guardado);
    if (config.method === "get" && config.url === "/colectivos/c1/proyectos")
      return respuesta(config, []);
    if (config.method === "get") return falla(config, 404, { message: "No existe" });
    if (config.method === "post" && config.url === "/colectivos") {
      const creado = { ...COLECTIVO, ...JSON.parse(config.data), id: "c1" };
      guardado = creado;
      cuenta = { id: "cuenta-1", rol: "COLECTIVO", perfilId: "c1" };
      return respuesta(config, creado, 201);
    }
    if (config.method === "put") {
      guardado = { ...guardado, ...JSON.parse(config.data) };
      return respuesta(config, guardado);
    }
    return falla(config, 500);
  });
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptadorOriginal;
});

function montar(ruta) {
  return montarRutas(
    <Route element={<AppLayout />}>
      <Route element={<ProtectedRoute permitirSinPerfil />}>
        <Route path="/bienvenida/colectivo" element={<AltaColectivoPage />} />
      </Route>
      <Route element={<ProtectedRoute roles={["COLECTIVO"]} />}>
        <Route path="/colectivo/perfil" element={<PerfilColectivoPage />} />
        <Route path="/colectivo/proyectos" element={<MisProyectosPage />} />
      </Route>
      <Route path="/colectivos/:id" element={<ColectivoPage />} />
    </Route>,
    { ruta, cuenta, dependencies: { obtenerCuentaActual: async () => cuenta } },
  );
}

function pedidos(metodo) {
  return transporte.mock.calls
    .map(([config]) => config)
    .filter((c) => c.method === metodo);
}

describe("alta", () => {
  beforeEach(() => {
    cuenta = { id: "cuenta-1", rol: null, perfilId: null };
  });

  test("con datos vacíos marca los campos, enfoca el primero y no envía", async () => {
    const { user } = montar("/bienvenida/colectivo");
    await user.click(await screen.findByRole("button", { name: "Crear perfil" }));
    const nombre = screen.getByLabelText(/^Nombre/);
    expect(nombre).toHaveAttribute("aria-invalid", "true");
    expect(nombre).toHaveAccessibleDescription("Escribí el nombre del colectivo.");
    expect(nombre).toHaveFocus();
    expect(screen.getByRole("group", { name: /Tipo de colectivo/ })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(pedidos("post")).toHaveLength(0);
  });

  test("con datos vacíos resume los errores y cada enlace lleva a su campo", async () => {
    const { user } = montar("/bienvenida/colectivo");
    await user.click(await screen.findByRole("button", { name: "Crear perfil" }));
    const resumen = screen
      .getAllByRole("alert")
      .find((alerta) => /^Revisá/.test(alerta.textContent));
    expect(resumen).toHaveTextContent(/^Revisá \d+ campos?:/);
    const enlaces = within(resumen).getAllByRole("link");
    expect(resumen).toHaveTextContent(`Revisá ${enlaces.length} campo`);
    await user.click(within(resumen).getByRole("link", { name: /Nombre/ }));
    expect(screen.getByLabelText(/^Nombre/)).toHaveFocus();
  });

  test("ofrece volver a elegir tipo de cuenta y avisa si hay datos cargados", async () => {
    const { user, router } = montar("/bienvenida/colectivo");
    await screen.findByRole("button", { name: "Crear perfil" });
    expect(
      screen.getByRole("link", { name: "Elegir otro tipo de cuenta" }),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText(/^Nombre/), "Comedor");
    await user.click(screen.getByRole("link", { name: "Elegir otro tipo de cuenta" }));
    const dialogo = await screen.findByRole("dialog");
    expect(dialogo).toHaveTextContent("Los datos que cargaste se van a perder.");
    await user.click(within(dialogo).getByRole("button", { name: "Seguir editando" }));
    expect(router.state.location.pathname).toBe("/bienvenida/colectivo");
  });

  test("crea el perfil, avisa y lleva a Mis proyectos con el rol de colectivo", async () => {
    const { user } = montar("/bienvenida/colectivo");
    await user.type(await screen.findByLabelText(/^Nombre/), "Asamblea de Fiorito");
    await user.click(screen.getByRole("radio", { name: "Asamblea" }));
    await user.type(screen.getByLabelText(/^Descripción/), "Comedor y apoyo escolar.");
    await user.click(screen.getByRole("radio", { name: "Una provincia" }));
    await user.selectOptions(screen.getByLabelText(/^Provincia/), "Córdoba");
    await user.click(screen.getByRole("button", { name: "Agregar medio de contacto" }));
    await user.type(screen.getByLabelText("Email"), "hola@fiorito.org");
    await user.type(screen.getByLabelText("Nueva etiqueta"), "educación{Enter}");
    await user.click(screen.getByRole("button", { name: "Crear perfil" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "Mis proyectos" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Perfil del colectivo creado.");
    expect(JSON.parse(pedidos("post")[0].data)).toEqual({
      nombre: "Asamblea de Fiorito",
      descripcion: "Comedor y apoyo escolar.",
      tipoColectivo: "ASAMBLEA",
      ubicacion: { tipoUbicacion: "PROVINCIA", nombre: "Córdoba" },
      mediosDeContacto: [{ tipo: "EMAIL", valor: "hola@fiorito.org" }],
      redesSociales: [],
      etiquetas: ["educación"],
    });
    expect(screen.getByRole("link", { name: "Mi colectivo" })).toBeInTheDocument();
  });

  test("muestra en su campo el error que devuelve el back y conserva lo cargado", async () => {
    transporte.mockImplementationOnce(async (config) =>
      falla(config, 400, {
        message: "Datos inválidos",
        issues: [{ path: ["nombre"], message: "Ya existe un colectivo con ese nombre" }],
      }),
    );
    const { user } = montar("/bienvenida/colectivo");
    await user.type(await screen.findByLabelText(/^Nombre/), "Asamblea de Fiorito");
    await user.click(screen.getByRole("radio", { name: "Asamblea" }));
    await user.type(screen.getByLabelText(/^Descripción/), "Comedor.");
    transporte.mockImplementationOnce(async (config) =>
      falla(config, 400, {
        message: "Datos inválidos",
        issues: [{ path: ["nombre"], message: "Ya existe un colectivo con ese nombre" }],
      }),
    );
    await user.click(screen.getByRole("button", { name: "Crear perfil" }));
    const nombre = screen.getByLabelText(/^Nombre/);
    await waitFor(() => expect(nombre).toHaveAttribute("aria-invalid", "true"));
    expect(nombre).toHaveAccessibleDescription("Revisá el nombre.");
    expect(document.body).not.toHaveTextContent("Ya existe un colectivo con ese nombre");
    expect(nombre).toHaveValue("Asamblea de Fiorito");
    expect(nombre).toHaveFocus();
  });

  test("una cuenta que ya tiene perfil no vuelve a elegir tipo", async () => {
    cuenta = { id: "cuenta-1", rol: "COLECTIVO", perfilId: "c1" };
    montar("/bienvenida/colectivo");
    expect(
      await screen.findByRole("heading", { level: 1, name: "Mis proyectos" }),
    ).toBeInTheDocument();
  });
});

describe("edición", () => {
  test("sin cambios, Guardar está deshabilitado con el motivo", async () => {
    montar("/colectivo/perfil");
    const guardar = await screen.findByRole("button", { name: "Guardar cambios" });
    expect(guardar).toBeDisabled();
    expect(guardar).toHaveAccessibleDescription("No hay cambios para guardar.");
    expect(screen.getByText("Tipo: Asamblea")).toBeInTheDocument();
  });

  test("manda solo lo que cambió y avisa", async () => {
    const { user } = montar("/colectivo/perfil");
    const descripcion = await screen.findByLabelText(/^Descripción/);
    await user.clear(descripcion);
    await user.type(descripcion, "Comedor, apoyo escolar y huerta.");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(await screen.findByText("Cambios guardados.")).toBeInTheDocument();
    expect(JSON.parse(pedidos("put")[0].data)).toEqual({
      descripcion: "Comedor, apoyo escolar y huerta.",
    });
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeDisabled();
  });

  test("con cambios sin guardar, pregunta antes de irse", async () => {
    const { user, router } = montar("/colectivo/perfil");
    await user.type(await screen.findByLabelText("Nombre (obligatorio)"), " (sede sur)");
    await user.click(screen.getByRole("link", { name: "Ver perfil público" }));
    const dialogo = screen.getByRole("dialog", { name: "¿Salir sin guardar?" });
    await user.click(within(dialogo).getByRole("button", { name: "Seguir editando" }));
    expect(router.state.location.pathname).toBe("/colectivo/perfil");

    await user.click(screen.getByRole("link", { name: "Ver perfil público" }));
    await user.click(screen.getByRole("button", { name: "Salir sin guardar" }));
    expect(
      await screen.findByRole("heading", { level: 1, name: "Asamblea de Fiorito" }),
    ).toBeInTheDocument();
  });

  test("si falla la carga ofrece Reintentar", async () => {
    transporte.mockImplementationOnce(async (config) => falla(config, 500));
    const { user } = montar("/colectivo/perfil");
    expect(await screen.findByText("No pudimos cargar el perfil")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(
      await screen.findByRole("button", { name: "Guardar cambios" }),
    ).toBeInTheDocument();
  });
});

describe("vista pública", () => {
  test("muestra el perfil y sus proyectos, nunca los medios de contacto", async () => {
    cuenta = null;
    montar("/colectivos/c1");
    expect(
      await screen.findByRole("heading", { level: 1, name: "Asamblea de Fiorito" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Asamblea · Villa Fiorito")).toBeInTheDocument();
    expect(screen.getByText("Sistema de turnos del comedor")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Instagram/ })).toHaveAttribute(
      "href",
      "https://instagram.com/fiorito",
    );
    expect(document.body).not.toHaveTextContent("+5491122223333");
    expect(document.body).not.toHaveTextContent("WhatsApp");
  });

  test("cada proyecto es un enlace a su detalle y muestra su estado", async () => {
    cuenta = null;
    guardado = {
      ...COLECTIVO,
      proyectos: [
        { id: "p1", titulo: "Sistema de turnos del comedor", estado: "ABIERTO" },
        { id: "p2", titulo: "Tienda en línea", estado: "FINALIZADO" },
      ],
    };
    montar("/colectivos/c1");
    const turnos = await screen.findByRole("link", {
      name: "Sistema de turnos del comedor",
    });
    expect(turnos).toHaveAttribute("href", "/proyectos/p1");
    expect(turnos.closest("li")).toHaveTextContent("Abierto");
    const tienda = screen.getByRole("link", { name: "Tienda en línea" });
    expect(tienda).toHaveAttribute("href", "/proyectos/p2");
    expect(tienda.closest("li")).toHaveTextContent("Finalizado");
  });

  test("un colectivo que no existe o dado de baja muestra que no se encontró", async () => {
    cuenta = null;
    montar("/colectivos/otro");
    expect(
      await screen.findByRole("heading", { name: "No encontramos este colectivo" }),
    ).toBeInTheDocument();
  });

  test("sin proyectos lo dice", async () => {
    cuenta = null;
    guardado = { ...COLECTIVO, proyectos: [] };
    montar("/colectivos/c1");
    expect(await screen.findByText("Todavía no publicó proyectos.")).toBeInTheDocument();
  });
});
