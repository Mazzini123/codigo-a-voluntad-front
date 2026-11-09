import { screen, waitFor, within } from "@testing-library/react";
import axios from "axios";
import { Route } from "react-router-dom";
import { MarcoDeLaApp } from "@/Presentation/Components/App/layout/MarcoDeLaApp.jsx";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { RutaProtegida } from "@/Presentation/Routes/RutaProtegida.jsx";
import { AltaColaboradoraPage } from "@/Presentation/Pages/ingreso/AltaColaboradoraPage.jsx";
import { ColaboradoraPage } from "@/Presentation/Pages/publicas/ColaboradoraPage.jsx";
import { PerfilColaboradoraPage } from "@/Presentation/Pages/colaboradora/PerfilColaboradoraPage.jsx";
import { montarRutas } from "@/test/montarRutas.jsx";

const HABILIDADES = [
  { codigo: "react", titulo: "React", activo: true },
  { codigo: "python", titulo: "Python", activo: true },
  { codigo: "cobol", titulo: "COBOL", activo: false },
  { codigo: "diseno", titulo: "Diseño UX", activo: true },
];

const COLABORADORA = {
  id: "co1",
  nombreFantasia: "Pixel",
  nombre: null,
  apellido: null,
  cuentaGit: "pixel-dev",
  presentacion: "Me gusta el front.",
  pronombres: ["elle"],
  recibeMensajeriaInterna: false,
  redesSociales: [],
  habilidades: [{ codigo: "react", titulo: "React" }],
};

const adaptadorOriginal = axiosClient.defaults.adapter;
let cuenta;
let transporte;
let medios;
let guardada;

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

function porTitulo(codigo) {
  return HABILIDADES.find((h) => h.codigo === codigo);
}

beforeEach(() => {
  guardada = structuredClone(COLABORADORA);
  medios = [{ tipo: "EMAIL", valor: "pixel@mail.com" }];
  cuenta = { id: "cuenta-2", rol: "COLABORADORA", perfilId: "co1" };
  transporte = vi.fn(async (config) => {
    const { method, url } = config;
    if (method === "get" && url === "/habilidades") {
      const { page, limit } = config.params;
      return respuesta(config, {
        data: HABILIDADES.slice((page - 1) * limit, page * limit),
        meta: { page, per_page: limit, total: HABILIDADES.length, total_pages: 1 },
      });
    }
    if (method === "get" && url === "/colaboradores/co1")
      return respuesta(config, guardada);
    if (url === "/colaboradores/co1/medios-de-contacto") {
      if (method === "get") return respuesta(config, medios);
      if (method === "post") {
        const nuevo = JSON.parse(config.data);
        if (medios.some((m) => m.valor === nuevo.valor)) return falla(config, 409);
        medios = [...medios, nuevo];
        return respuesta(config, nuevo, 201);
      }
    }
    if (method === "delete" && url.includes("/medios-de-contacto/")) {
      const valor = decodeURIComponent(url.split("/").at(-1));
      medios = medios.filter((m) => m.valor !== valor);
      return respuesta(config, null, 204);
    }
    if (method === "get" && url === "/colaboradores/co1/colaboraciones")
      return respuesta(config, []);
    if (method === "get") return falla(config, 404);
    if (method === "post" && url === "/colaboradores") {
      cuenta = { id: "cuenta-2", rol: "COLABORADORA", perfilId: "co1" };
      return respuesta(config, { ...COLABORADORA, id: "co1" }, 201);
    }
    if (method === "post" && url === "/colaboradores/co1/habilidades") {
      const { codigoHabilidad } = JSON.parse(config.data);
      const { codigo, titulo } = porTitulo(codigoHabilidad);
      guardada = {
        ...guardada,
        habilidades: [...guardada.habilidades, { codigo, titulo }],
      };
      return respuesta(config, guardada);
    }
    if (method === "delete") {
      const codigo = url.split("/").at(-1);
      guardada = {
        ...guardada,
        habilidades: guardada.habilidades.filter((h) => h.codigo !== codigo),
      };
      return respuesta(config, guardada);
    }
    if (method === "put") {
      guardada = { ...guardada, ...JSON.parse(config.data) };
      return respuesta(config, guardada);
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
    <Route element={<MarcoDeLaApp />}>
      <Route element={<RutaProtegida permitirSinPerfil />}>
        <Route path="/bienvenida/colaboradora" element={<AltaColaboradoraPage />} />
      </Route>
      <Route element={<RutaProtegida roles={["COLABORADORA"]} />}>
        <Route path="/colaboradora/perfil" element={<PerfilColaboradoraPage />} />
      </Route>
      <Route path="/colaboradoras/:id" element={<ColaboradoraPage />} />
      <Route path="/proyectos" element={<h1 tabIndex={-1}>Proyectos</h1>} />
    </Route>,
    { ruta, cuenta, dependencies: { obtenerCuentaActual: async () => cuenta } },
  );
}

function pedidos(metodo, url) {
  return transporte.mock.calls
    .map(([config]) => config)
    .filter((c) => c.method === metodo && (!url || c.url === url));
}

describe("alta", () => {
  beforeEach(() => {
    cuenta = { id: "cuenta-2", rol: null, perfilId: null };
  });

  test("sin identificación ni habilidades marca los errores y no envía", async () => {
    const { user } = montar("/bienvenida/colaboradora");
    await screen.findByRole("checkbox", { name: "React" });
    await user.click(screen.getByRole("button", { name: "Crear perfil" }));
    const identificacion = screen.getByRole("group", {
      name: /¿Cómo querés que te vean\?/,
    });
    expect(identificacion).toHaveAttribute("aria-invalid", "true");
    expect(identificacion).toHaveFocus();
    expect(
      screen.getByRole("group", { name: /^Habilidades/ }),
    ).toHaveAccessibleDescription("Elegí al menos una habilidad.");
    expect(pedidos("post")).toHaveLength(0);
  });

  test("ofrece solo habilidades activas y crea el perfil", async () => {
    const { user } = montar("/bienvenida/colaboradora");
    await user.click(
      await screen.findByRole("radio", { name: "Con un nombre de fantasía" }),
    );
    await user.type(screen.getByLabelText(/^Nombre de fantasía/), "Pixel");
    await user.type(screen.getByLabelText("Pronombres"), "elle{Enter}");
    expect(screen.queryByRole("checkbox", { name: "COBOL" })).not.toBeInTheDocument();
    await user.type(screen.getByRole("searchbox", { name: "Buscar habilidad" }), "rea");
    await user.click(screen.getByRole("checkbox", { name: "React" }));
    await user.click(
      screen.getByRole("checkbox", {
        name: /Acepto que me contacten por mensajería interna/,
      }),
    );
    await user.click(screen.getByRole("button", { name: "Crear perfil" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "Proyectos" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Perfil creado.");
    expect(JSON.parse(pedidos("post", "/colaboradores")[0].data)).toEqual({
      nombreFantasia: "Pixel",
      nombre: null,
      apellido: null,
      cuentaGit: null,
      presentacion: null,
      pronombres: ["elle"],
      codigosHabilidades: ["react"],
      recibeMensajeriaInterna: true,
      mediosDeContacto: [],
      redesSociales: [],
    });
    expect(screen.getByRole("link", { name: "Mi perfil" })).toBeInTheDocument();
  });
});

describe("edición", () => {
  test("la bajada describe la edición", async () => {
    montar("/colaboradora/perfil");
    await screen.findByLabelText("Presentación");
    expect(screen.getByText("Editá cómo te ven los colectivos.")).toBeInTheDocument();
  });

  test("muestra tus medios de contacto privados y deja agregar y quitar", async () => {
    const { user } = montar("/colaboradora/perfil");
    const lista = await screen.findByRole("list", {
      name: "Medios de contacto cargados",
    });
    expect(within(lista).getByText("pixel@mail.com")).toBeVisible();

    await user.type(screen.getByLabelText("Email"), "otro@mail.com");
    await user.click(screen.getByRole("button", { name: "Agregar medio de contacto" }));
    expect(await screen.findByText("Medio de contacto agregado.")).toBeVisible();
    expect(within(lista).getByText("otro@mail.com")).toBeVisible();
    expect(pedidos("post", "/colaboradores/co1/medios-de-contacto")).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Quitar Email pixel@mail.com" }));
    expect(await screen.findByText("Quitaste el medio de contacto.")).toBeVisible();
    expect(within(lista).queryByText("pixel@mail.com")).not.toBeInTheDocument();
  });

  test("un medio repetido o inválido muestra un mensaje propio", async () => {
    const { user } = montar("/colaboradora/perfil");
    await screen.findByRole("list", { name: "Medios de contacto cargados" });
    await user.type(screen.getByLabelText("Email"), "no-es-un-email");
    await user.click(screen.getByRole("button", { name: "Agregar medio de contacto" }));
    expect(await screen.findByText(/Escribí un email válido/)).toBeVisible();
    await user.clear(screen.getByLabelText("Email"));
    await user.type(screen.getByLabelText("Email"), "pixel@mail.com");
    await user.click(screen.getByRole("button", { name: "Agregar medio de contacto" }));
    expect(await screen.findByText("Ya cargaste ese medio de contacto.")).toBeVisible();
  });

  test("muestra la identidad sin dejarla editar y manda solo lo que cambió", async () => {
    const { user } = montar("/colaboradora/perfil");
    expect(await screen.findByText("Te ven como: Pixel · pixel-dev")).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Nombre de fantasía/)).not.toBeInTheDocument();
    const presentacion = screen.getByLabelText("Presentación");
    await user.clear(presentacion);
    await user.type(presentacion, "Front y accesibilidad.");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(await screen.findByText("Cambios guardados.")).toBeInTheDocument();
    expect(JSON.parse(pedidos("put")[0].data)).toEqual({
      presentacion: "Front y accesibilidad.",
    });
  });

  test("agrega y quita habilidades en el momento", async () => {
    const { user } = montar("/colaboradora/perfil");
    await user.click(await screen.findByRole("checkbox", { name: "Python" }));
    expect(await screen.findByText("Guardamos tus habilidades")).toBeInTheDocument();
    expect(JSON.parse(pedidos("post", "/colaboradores/co1/habilidades")[0].data)).toEqual(
      {
        codigoHabilidad: "python",
      },
    );
    await user.click(screen.getByRole("button", { name: "Quitar habilidad React" }));
    await waitFor(() =>
      expect(
        screen.getByRole("list", { name: "Habilidades elegidas" }),
      ).not.toHaveTextContent("React"),
    );
    expect(
      screen.getByText("Guardamos tus habilidades").closest('[role="status"]'),
    ).not.toBeNull();
    expect(pedidos("delete")[0].url).toBe("/colaboradores/co1/habilidades/react");
    const elegidas = screen.getByRole("list", { name: "Habilidades elegidas" });
    expect(within(elegidas).getByText("Python")).toBeInTheDocument();
    expect(within(elegidas).queryByText("React")).not.toBeInTheDocument();
  });

  test("no deja quitar la única habilidad", async () => {
    montar("/colaboradora/perfil");
    const quitar = await screen.findByRole("button", { name: "Quitar habilidad React" });
    expect(quitar).toBeDisabled();
    expect(quitar).toHaveAccessibleDescription("Necesitás al menos una habilidad.");
  });

  test("si falla agregar una habilidad, avisa cuál y la deja como estaba", async () => {
    const { user } = montar("/colaboradora/perfil");
    const python = await screen.findByRole("checkbox", { name: "Python" });
    transporte.mockImplementationOnce(async (config) => falla(config, 500));
    await user.click(python);
    expect(await screen.findByText(/No pudimos agregar Python/)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("checkbox", { name: "Python" })).not.toBeChecked(),
    );
  });
});

describe("vista pública", () => {
  test("vuelve a la edición desde el perfil público y conserva la URL de origen", async () => {
    const { user, router } = montar("/colaboradora/perfil?origen=cuenta");
    await user.click(await screen.findByRole("link", { name: "Ver perfil público" }));
    const volver = await screen.findByRole("link", { name: "Volver a mi perfil" });
    await user.click(volver);
    expect(router.state.location.pathname).toBe("/colaboradora/perfil");
    expect(router.state.location.search).toBe("?origen=cuenta");
  });

  test("muestra el perfil sin medios de contacto", async () => {
    cuenta = null;
    guardada = {
      ...COLABORADORA,
      mediosDeContacto: [{ tipo: "EMAIL", valor: "pixel@correo.com" }],
    };
    montar("/colaboradoras/co1");
    expect(
      await screen.findByRole("heading", { level: 1, name: "Pixel" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Pronombres: elle")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("pixel@correo.com");
  });

  test("sus habilidades usan el chip de habilidad, no la etiqueta", async () => {
    cuenta = null;
    montar("/colaboradoras/co1");
    const habilidad = await screen.findByText("React");
    expect(habilidad.tagName).toBe("SPAN");
    expect(habilidad.parentElement.tagName).toBe("LI");
    expect(habilidad.parentElement).not.toHaveTextContent(/^$/);
  });

  test("un id que no existe muestra que no se encontró", async () => {
    cuenta = null;
    montar("/colaboradoras/otra");
    expect(
      await screen.findByRole("heading", { name: "No encontramos esta colaboradora" }),
    ).toBeInTheDocument();
  });

  test("el historial consulta solo proyectos de participaciones públicas", async () => {
    cuenta = null;
    const original = transporte.getMockImplementation();
    transporte.mockImplementation(async (config) => {
      if (config.url === "/colaboradores/co1/colaboraciones") {
        return respuesta(config, [
          {
            proyectoId: "p1",
            colaboracion: {
              id: "c1",
              perfil: "pe1",
              esPublica: true,
              estado: "ACEPTADA",
            },
          },
          {
            proyectoId: "privado",
            colaboracion: { id: "c2", esPublica: false, estado: "FINALIZADA" },
          },
          {
            proyectoId: "pendiente",
            colaboracion: { id: "c3", esPublica: true, estado: "PENDIENTE" },
          },
        ]);
      }
      if (config.url === "/proyectos/p1") {
        return respuesta(config, {
          id: "p1",
          titulo: "Mapa comunitario",
          estado: "FINALIZADO",
          perfiles: [{ id: "pe1", descripcion: "Desarrollo frontend" }],
        });
      }
      return original(config);
    });
    montar("/colaboradoras/co1");
    const historial = screen.findByRole("region", { name: "Colaboraciones" });
    const region = within(await historial);
    expect(await region.findByText("En curso")).toBeVisible();
    expect(region.getByText("Desarrollo frontend")).toBeVisible();
    expect(
      region.getByRole("link", { name: /Ver proyecto.*Mapa comunitario/ }),
    ).toHaveAttribute("href", "/proyectos/p1");
    expect(
      pedidos("get")
        .filter(({ url }) => url.startsWith("/proyectos/"))
        .map(({ url }) => url),
    ).toEqual(["/proyectos/p1"]);
  });
});
