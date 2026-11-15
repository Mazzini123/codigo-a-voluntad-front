import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { crearSesionFalsa } from "@/Infrastructure/Auth/crearSesionFalsa.js";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { Raiz } from "@/Presentation/Components/App/layout/Raiz.jsx";
import { rutas } from "@/Presentation/Routes/RutasDeLaApp.jsx";

const adaptadorOriginal = axiosClient.defaults.adapter;
const VOLVER_A = "codigo-a-voluntad:volver-a";
const LISTA_VACIA = {
  data: [],
  meta: { page: 1, per_page: 12, total: 0, total_pages: 0 },
};
const HABILIDADES = {
  data: [{ codigo: "react", titulo: "React", activo: true }],
  meta: { page: 1, per_page: 100, total: 1, total_pages: 1 },
};

function crearBack({
  registrado = false,
  nombre = null,
  contextos = [],
  actual = null,
} = {}) {
  const estado = { registrado, nombre, contextos: [...contextos], actual, pedidos: [] };
  let perderRespuestaDelAlta = false;
  let rechazoDelAlta = null;

  const contextoActual = () =>
    estado.contextos.find((contexto) => contexto.id === estado.actual) ?? null;
  const cuenta = () => {
    const contexto = contextoActual();
    const esColectivo = contexto?.tipo === "COLECTIVO";
    return {
      id: "sub-logto",
      rol: contexto ? (esColectivo ? "COLECTIVO" : "COLABORADORA") : null,
      perfilId: contexto
        ? esColectivo
          ? contexto.colectivo.id
          : contexto.colaborador.id
        : null,
      usuario: { id: "u1", nombre: estado.nombre, nombrePendiente: !estado.nombre },
      contextoActual: contexto,
      contextos: estado.contextos,
    };
  };
  const agregarContexto = (contexto) => {
    estado.contextos.push(contexto);
    estado.actual = contexto.id;
  };
  const tiene = (tipo) => estado.contextos.some((contexto) => contexto.tipo === tipo);

  const operaciones = {
    "post /auth/registro": () => {
      const creado = !estado.registrado;
      estado.registrado = true;
      return [creado ? 201 : 200, { usuarioId: "u1", creado }];
    },
    "get /auth/me": () =>
      estado.registrado ? [200, cuenta()] : [403, { codigo: "USUARIO_NO_REGISTRADO" }],
    "put /auth/usuario": ({ nombre: nuevo }) => {
      estado.nombre = nuevo;
      return [200, { id: "u1", nombre: nuevo }];
    },
    "put /auth/contexto-actual": ({ contextoId }) => {
      estado.actual = contextoId;
      return [200, contextoActual()];
    },
    "delete /auth/contexto-actual": () => {
      estado.actual = null;
      return [204, null];
    },
    "post /colectivos": (datos) => {
      if (!estado.nombre) return [409, { codigo: "NOMBRE_REQUERIDO" }];
      const id = `colectivo-${estado.contextos.length + 1}`;
      agregarContexto({
        id: `ctx-${id}`,
        tipo: "COLECTIVO",
        rol: "LIDER",
        colectivo: { id, nombre: datos.nombre },
        colaborador: null,
        permisos: ["COLECTIVO_EDITAR", "PROYECTO_CREAR"],
      });
      return [201, { id, ...datos }];
    },
    "post /colaboradores": (datos) => {
      if (!estado.nombre) return [409, { codigo: "NOMBRE_REQUERIDO" }];
      if (tiene("COLABORADOR")) return [409, { codigo: "PERFIL_COLABORADOR_EXISTENTE" }];
      agregarContexto({
        id: "ctx-colaboradora",
        tipo: "COLABORADOR",
        rol: "COLABORADOR",
        colectivo: null,
        colaborador: { id: "colaboradora-1", nombre: datos.nombreDeFantasia ?? "ana" },
        permisos: ["POSTULACION_CREAR"],
      });
      return [201, { id: "colaboradora-1", ...datos }];
    },
    "get /habilidades": () => [200, HABILIDADES],
  };

  async function transporte(config) {
    const clave = `${config.method} ${config.url}`;
    estado.pedidos.push(clave);
    const esAlta = clave === "post /colectivos" || clave === "post /colaboradores";
    const cuerpo =
      typeof config.data === "string" ? JSON.parse(config.data) : config.data;
    const rechazo = esAlta ? rechazoDelAlta : null;
    rechazoDelAlta = esAlta ? null : rechazoDelAlta;
    const [status, data] = rechazo ??
      operaciones[clave]?.(cuerpo ?? {}) ?? [200, LISTA_VACIA];
    if (esAlta && perderRespuestaDelAlta) {
      perderRespuestaDelAlta = false;
      throw new axios.AxiosError("Network Error", "ERR_NETWORK", config);
    }
    const respuesta = { config, status, statusText: "", headers: {}, data };
    if (status >= 400) {
      throw new axios.AxiosError("Error", "ERR_BAD_REQUEST", config, null, respuesta);
    }
    return respuesta;
  }

  return {
    estado,
    transporte,
    perderLaProximaRespuestaDelAlta: () => {
      perderRespuestaDelAlta = true;
    },
    rechazarLaProximaAlta: (status, cuerpo) => {
      rechazoDelAlta = [status, cuerpo];
    },
    veces: (clave) => estado.pedidos.filter((pedido) => pedido === clave).length,
  };
}

function montar(back, ruta, { autenticado = true } = {}) {
  axiosClient.defaults.adapter = back.transporte;
  const sesion = crearSesionFalsa({ autenticado });
  const router = createMemoryRouter(
    [
      {
        ...rutas[0],
        element: (
          <Raiz
            usarSesion={sesion.usarSesion}
            CallbackComponent={sesion.CallbackComponent}
          />
        ),
      },
    ],
    { initialEntries: [ruta] },
  );
  const vista = render(<RouterProvider router={router} />);
  return { ...vista, router, sesion, user: userEvent.setup() };
}

const ingresarPorLogto = (back) => montar(back, "/auth/callback", { autenticado: false });
const enRuta = (router, pathname) =>
  waitFor(() => expect(router.state.location.pathname).toBe(pathname));
const titulo = (name) => screen.findByRole("heading", { level: 1, name });

async function guardarNombre(user, nombre) {
  await user.type(await screen.findByLabelText(/^Nombre/), nombre);
  await user.click(screen.getByRole("button", { name: "Continuar" }));
}

async function completarColectivo(user) {
  await user.type(await screen.findByLabelText(/^Nombre/), "Asamblea de Fiorito");
  await user.click(screen.getByRole("radio", { name: "Asamblea" }));
  await user.type(screen.getByLabelText(/^Descripción/), "Comedor.");
  await user.click(screen.getByRole("button", { name: "Crear perfil" }));
}

async function completarColaboradora(user) {
  await user.click(
    await screen.findByRole("radio", { name: "Con un nombre de fantasía" }),
  );
  await user.type(screen.getByLabelText(/^Nombre de fantasía/), "Pixel");
  await user.click(await screen.findByRole("checkbox", { name: "React" }));
  await user.click(screen.getByRole("button", { name: "Crear perfil" }));
}

const CONTEXTO_LIDER = {
  id: "ctx-colectivo-1",
  tipo: "COLECTIVO",
  rol: "LIDER",
  colectivo: { id: "colectivo-1", nombre: "Asamblea de Fiorito" },
  colaborador: null,
  permisos: ["COLECTIVO_EDITAR"],
};
const CONTEXTO_COLABORADORA = {
  id: "ctx-colaboradora-1",
  tipo: "COLABORADOR",
  rol: "COLABORADOR",
  colectivo: null,
  colaborador: { id: "colaboradora-1", nombre: "Pixel" },
  permisos: ["POSTULACION_CREAR"],
};
const CON_NOMBRE = { registrado: true, nombre: "Ana" };
const COMPLETA = {
  ...CON_NOMBRE,
  contextos: [CONTEXTO_LIDER],
  actual: CONTEXTO_LIDER.id,
};

beforeEach(() => {
  sessionStorage.clear();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptadorOriginal;
  vi.restoreAllMocks();
  sessionStorage.clear();
});

describe("registro nuevo con Logto", () => {
  test("pide el nombre, después la modalidad y recién entonces entra como colectivo", async () => {
    sessionStorage.setItem(VOLVER_A, "/proyectos?etiqueta=web");
    const back = crearBack();
    const { user, router } = ingresarPorLogto(back);

    expect(await titulo("¿Cómo te llamás?")).toBeVisible();
    expect(router.state.location.pathname).toBe("/cuenta/nombre");
    expect(back.estado.pedidos.slice(0, 2)).toEqual([
      "post /auth/registro",
      "get /auth/me",
    ]);
    expect(screen.getByLabelText(/^Nombre/)).toHaveValue("");
    expect(
      screen.queryByRole("navigation", { name: "Principal" }),
    ).not.toBeInTheDocument();

    await guardarNombre(user, "Ana Diaz");

    expect(await titulo("¿Cómo vas a usar Código a Voluntad?")).toBeVisible();
    expect(router.state.location.pathname).toBe("/bienvenida");
    expect(back.estado.nombre).toBe("Ana Diaz");
    const modalidades = within(
      screen.getByRole("list", { name: "Modalidades de registro" }),
    ).getAllByRole("link");
    expect(modalidades.map((enlace) => enlace.getAttribute("href"))).toEqual([
      "/bienvenida/colectivo/nuevo",
      "/bienvenida/colectivo/unirme",
      "/bienvenida/colaboradora",
    ]);
    expect(back.estado.contextos).toEqual([]);

    await user.click(screen.getByRole("link", { name: /Crear un colectivo/ }));
    expect(router.state.location.pathname).toBe("/bienvenida/colectivo/nuevo");
    await completarColectivo(user);

    await enRuta(router, "/colectivo/resumen");
    expect(back.estado.contextos).toHaveLength(1);
    expect(back.estado.contextos[0]).toMatchObject({ tipo: "COLECTIVO", rol: "LIDER" });
    expect(back.estado.actual).toBe(back.estado.contextos[0].id);
    expect(back.veces("post /colectivos")).toBe(1);
    expect(back.veces("post /auth/registro")).toBe(1);
    expect(back.estado.pedidos.lastIndexOf("get /auth/me")).toBeGreaterThan(
      back.estado.pedidos.indexOf("post /colectivos"),
    );
    expect(await screen.findByRole("navigation", { name: "Principal" })).toBeVisible();
  });

  test("con la modalidad de colaboradora termina en su inicio", async () => {
    const back = crearBack();
    const { user, router } = ingresarPorLogto(back);

    await guardarNombre(user, "Ada");
    await user.click(
      await screen.findByRole("link", { name: /Registrarme como colaboradora/ }),
    );
    expect(router.state.location.pathname).toBe("/bienvenida/colaboradora");
    await completarColaboradora(user);

    expect(await titulo("Proyectos de colectivos sociales")).toBeVisible();
    expect(router.state.location.pathname).toBe("/proyectos");
    expect(back.estado.contextos).toHaveLength(1);
    expect(back.estado.contextos[0]).toMatchObject({
      tipo: "COLABORADOR",
      rol: "COLABORADOR",
    });
    expect(back.veces("post /colaboradores")).toBe(1);
  });

  test.each([
    ["vacío", ""],
    ["solo con espacios", "    "],
  ])("no deja continuar con el nombre %s", async (_caso, texto) => {
    const back = crearBack();
    const { user, router } = ingresarPorLogto(back);
    const campo = await screen.findByLabelText(/^Nombre/);

    if (texto) await user.type(campo, texto);
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByText("Escribí tu nombre.")).toBeVisible();
    expect(router.state.location.pathname).toBe("/cuenta/nombre");
    expect(back.veces("put /auth/usuario")).toBe(0);
    expect(back.estado.nombre).toBeNull();
  });
});

describe("no hay camino a un panel sin terminar el registro", () => {
  test.each([
    "/",
    "/proyectos",
    "/proyectos/p1",
    "/colectivo/resumen",
    "/colectivo/proyectos",
    "/colaboradora/perfil",
    "/mensajes",
    "/login",
    "/registro",
    "/sin-permiso",
    "/una-ruta-que-no-existe",
  ])("con nombre y sin modalidad, %s lleva a elegir la modalidad", async (ruta) => {
    const back = crearBack(CON_NOMBRE);
    const { router } = montar(back, ruta);

    expect(await titulo("¿Cómo vas a usar Código a Voluntad?")).toBeVisible();
    expect(router.state.location.pathname).toBe("/bienvenida");
    expect(back.estado.contextos).toEqual([]);
  });

  test.each([
    "/",
    "/proyectos",
    "/bienvenida",
    "/bienvenida/colectivo/nuevo",
    "/bienvenida/colaboradora",
    "/colectivo/resumen",
    "/cuenta/solicitudes",
  ])("sin nombre, %s lleva a pedir el nombre", async (ruta) => {
    const back = crearBack({ registrado: true });
    const { router } = montar(back, ruta);

    expect(await titulo("¿Cómo te llamás?")).toBeVisible();
    expect(router.state.location.pathname).toBe("/cuenta/nombre");
  });

  test("durante la modalidad puede volver a corregir su nombre y cerrar sesión", async () => {
    const back = crearBack(CON_NOMBRE);
    const { user, router } = montar(back, "/bienvenida");

    await user.click(await screen.findByRole("button", { name: "Mi cuenta" }));
    expect(
      screen.queryByRole("link", { name: "Mis solicitudes" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeVisible();
    await user.click(screen.getByRole("link", { name: "Tu nombre" }));

    expect(await titulo("Tu nombre")).toBeVisible();
    expect(router.state.location.pathname).toBe("/cuenta/nombre");
    expect(screen.getByLabelText(/^Nombre/)).toHaveValue("Ana");
  });
});

describe("retomar el registro según el estado del back", () => {
  test("quien ya guardó su nombre vuelve directo a elegir la modalidad", async () => {
    sessionStorage.setItem(VOLVER_A, "/proyectos");
    const back = crearBack(CON_NOMBRE);
    const { router } = ingresarPorLogto(back);

    expect(await titulo("¿Cómo vas a usar Código a Voluntad?")).toBeVisible();
    expect(router.state.location.pathname).toBe("/bienvenida");
    expect(back.veces("put /auth/usuario")).toBe(0);
  });

  test("cerrar sesión en medio del registro y volver continúa en el paso pendiente", async () => {
    const back = crearBack();
    const primera = ingresarPorLogto(back);
    await guardarNombre(primera.user, "Ana");
    expect(await titulo("¿Cómo vas a usar Código a Voluntad?")).toBeVisible();
    await primera.user.click(screen.getByRole("button", { name: "Mi cuenta" }));
    await primera.user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    await primera.user.click(
      within(await screen.findByRole("dialog", { name: "¿Cerrar sesión?" })).getByRole(
        "button",
        { name: "Cerrar sesión" },
      ),
    );
    await waitFor(() => expect(primera.sesion.salidas).toBe(1));
    primera.unmount();

    const segunda = ingresarPorLogto(back);

    expect(await titulo("¿Cómo vas a usar Código a Voluntad?")).toBeVisible();
    expect(segunda.router.state.location.pathname).toBe("/bienvenida");
    expect(back.veces("put /auth/usuario")).toBe(1);
    expect(back.estado.contextos).toEqual([]);
  });

  test("al recargar el alta de colaboradora con el perfil ya creado va a su inicio sin repetirla", async () => {
    const back = crearBack({
      ...CON_NOMBRE,
      contextos: [CONTEXTO_COLABORADORA],
      actual: CONTEXTO_COLABORADORA.id,
    });
    const { router } = montar(back, "/bienvenida/colaboradora");

    await enRuta(router, "/proyectos");
    expect(back.veces("post /colaboradores")).toBe(0);
    expect(back.estado.contextos).toHaveLength(1);
  });

  test("quien ya lidera un colectivo puede crear otro", async () => {
    const back = crearBack(COMPLETA);
    const { router } = montar(back, "/bienvenida/colectivo/nuevo");

    expect(await screen.findByLabelText(/^Nombre/)).toBeVisible();
    expect(router.state.location.pathname).toBe("/bienvenida/colectivo/nuevo");
    expect(back.veces("post /colectivos")).toBe(0);
  });

  test("si se pierde la respuesta del alta, consulta la cuenta y no crea otro contexto", async () => {
    const back = crearBack(CON_NOMBRE);
    const { user, router } = montar(back, "/bienvenida/colectivo/nuevo");
    back.perderLaProximaRespuestaDelAlta();

    await completarColectivo(user);

    await enRuta(router, "/colectivo/resumen");
    expect(back.veces("post /colectivos")).toBe(1);
    expect(back.estado.contextos).toHaveLength(1);
  });

  test("un alta rechazada por el back deja a la persona en el formulario, sin modalidad", async () => {
    const back = crearBack(CON_NOMBRE);
    const { user, router } = montar(back, "/bienvenida/colaboradora");
    back.rechazarLaProximaAlta(422, {
      codigo: "REGLA_DE_NEGOCIO",
      mensaje: "No se pudo",
    });

    await completarColaboradora(user);

    await waitFor(() => expect(back.veces("post /colaboradores")).toBe(1));
    expect(await screen.findByRole("button", { name: "Crear perfil" })).toBeEnabled();
    expect(router.state.location.pathname).toBe("/bienvenida/colaboradora");
    expect(back.estado.contextos).toEqual([]);
  });
});

describe("cuentas que ya terminaron el registro", () => {
  test("ingresan sin que se les pida el nombre ni la modalidad", async () => {
    const back = crearBack(COMPLETA);
    const { router } = ingresarPorLogto(back);

    await enRuta(router, "/colectivo/resumen");
    expect(back.veces("put /auth/usuario")).toBe(0);
    expect(back.veces("post /colectivos")).toBe(0);
    expect(
      screen.queryByRole("heading", { name: "¿Cómo vas a usar Código a Voluntad?" }),
    ).not.toBeInTheDocument();
  });

  test("vuelven a la pantalla desde la que ingresaron", async () => {
    sessionStorage.setItem(VOLVER_A, "/proyectos?etiqueta=web");
    const back = crearBack(COMPLETA);
    const { router } = ingresarPorLogto(back);

    expect(await titulo("Proyectos de colectivos sociales")).toBeVisible();
    expect(router.state.location).toMatchObject({
      pathname: "/proyectos",
      search: "?etiqueta=web",
    });
  });

  test("con un solo contexto y sin contexto actual lo retoman al ingresar", async () => {
    const back = crearBack({ ...COMPLETA, actual: null });
    const { router } = ingresarPorLogto(back);

    await enRuta(router, "/colectivo/resumen");
    expect(back.estado.actual).toBe(CONTEXTO_LIDER.id);
    expect(back.veces("put /auth/contexto-actual")).toBe(1);
    expect(back.veces("post /colectivos")).toBe(0);
  });
});

describe("cuentas con los dos tipos de contexto", () => {
  test("una colaboradora crea un colectivo desde Mi cuenta y vuelve a su perfil", async () => {
    const back = crearBack({
      ...CON_NOMBRE,
      contextos: [CONTEXTO_COLABORADORA],
      actual: CONTEXTO_COLABORADORA.id,
    });
    const { user, router } = montar(back, "/proyectos");

    await user.click(await screen.findByRole("button", { name: "Mi cuenta" }));
    await user.click(screen.getByRole("link", { name: "Crear un colectivo" }));
    expect(router.state.location.pathname).toBe("/bienvenida/colectivo/nuevo");
    await completarColectivo(user);

    await enRuta(router, "/colectivo/resumen");
    expect(back.estado.contextos.map(({ tipo }) => tipo)).toEqual([
      "COLABORADOR",
      "COLECTIVO",
    ]);
    expect(back.veces("post /colectivos")).toBe(1);

    await user.click(await screen.findByRole("button", { name: "Mi cuenta" }));
    const cambiar = screen.getByRole("list", { name: "Cambiar a" });
    await user.click(within(cambiar).getByRole("button", { name: /Pixel/ }));

    await enRuta(router, "/proyectos");
    expect(back.estado.actual).toBe(CONTEXTO_COLABORADORA.id);
  });

  test("un colectivo suma su perfil de colaboradora y Mi cuenta deja de ofrecerlo", async () => {
    const back = crearBack(COMPLETA);
    const { user, router } = montar(back, "/colectivo/resumen");

    await user.click(await screen.findByRole("button", { name: "Mi cuenta" }));
    await user.click(
      screen.getByRole("link", { name: "Crear mi perfil de colaboradora" }),
    );
    await completarColaboradora(user);

    await enRuta(router, "/proyectos");
    expect(back.estado.contextos.map(({ tipo }) => tipo)).toEqual([
      "COLECTIVO",
      "COLABORADOR",
    ]);
    expect(back.veces("post /colaboradores")).toBe(1);

    await user.click(await screen.findByRole("button", { name: "Mi cuenta" }));
    expect(
      screen.queryByRole("link", { name: "Crear mi perfil de colaboradora" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Crear un colectivo" })).toBeVisible();

    const cambiar = screen.getByRole("list", { name: "Cambiar a" });
    await user.click(
      within(cambiar).getByRole("button", { name: /Asamblea de Fiorito/ }),
    );

    await enRuta(router, "/colectivo/resumen");
    expect(back.estado.actual).toBe(CONTEXTO_LIDER.id);
  });
});
