import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { crearSesionFalsa } from "@/Infrastructure/Auth/crearSesionFalsa.js";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { Raiz } from "@/Presentation/Components/App/layout/Raiz.jsx";
import { rutas } from "@/Presentation/Routes/RutasDeLaApp.jsx";

const adaptadorOriginal = axiosClient.defaults.adapter;
const LISTA_VACIA = {
  data: [],
  meta: { page: 1, per_page: 12, total: 0, total_pages: 0 },
};

const COLECTIVOS = [
  {
    id: "c-huerta",
    nombre: "Huerta Comunitaria",
    descripcion: "Huertas **barriales** en escuelas.\n\nTalleres y semillero.",
    tipoColectivo: "ONG",
  },
  {
    id: "c-educacion",
    nombre: "Educación Popular",
    descripcion: "Apoyo escolar.",
    tipoColectivo: "ASAMBLEA",
  },
  {
    id: "c-tecnologia",
    nombre: "Mujeres en Tecnología",
    descripcion: "Talleres de programación.",
    tipoColectivo: "FUNDACION",
  },
];

function sinTildes(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function crearBack({
  colectivos = COLECTIVOS,
  solicitudes = [],
  contextos = [],
  actual = null,
} = {}) {
  const estado = {
    nombre: "Ana",
    colectivos,
    solicitudes: solicitudes.map((solicitud) => ({ ...solicitud })),
    contextos: [...contextos],
    actual,
    pedidos: [],
  };
  let falloDelListado = false;
  let falloDeLaCuenta = false;

  const contextoActual = () =>
    estado.contextos.find((contexto) => contexto.id === estado.actual) ?? null;
  const cuenta = () => {
    const contexto = contextoActual();
    return {
      id: "sub-logto",
      rol: contexto ? "COLECTIVO" : null,
      perfilId: contexto ? contexto.colectivo.id : null,
      usuario: { id: "u1", nombre: estado.nombre, nombrePendiente: false },
      contextoActual: contexto,
      contextos: estado.contextos,
    };
  };
  const nuevaSolicitud = (colectivoId) => {
    const solicitud = {
      id: `s${estado.solicitudes.length + 1}`,
      colectivoId,
      estado: "PENDIENTE",
      fechaSolicitud: "2026-11-14",
    };
    estado.solicitudes.push(solicitud);
    return solicitud;
  };
  const colectivo = (id) => estado.colectivos.find((item) => item.id === id);

  const listar = ({ params = {} }) => {
    if (falloDelListado) return [500, { codigo: "ERROR_INTERNO" }];
    const buscado = sinTildes(params.q ?? "");
    const coinciden = estado.colectivos.filter((item) =>
      sinTildes(item.nombre).includes(buscado),
    );
    const limite = params.limit ?? 12;
    const pagina = params.page ?? 1;
    return [
      200,
      {
        data: coinciden.slice((pagina - 1) * limite, pagina * limite),
        meta: {
          page: pagina,
          per_page: limite,
          total: coinciden.length,
          total_pages: Math.ceil(coinciden.length / limite),
        },
      },
    ];
  };

  const dinamicas = [
    [/^get \/colectivos$/, (_ids, config) => listar(config)],
    [
      /^get \/colectivos\/([^/]+)$/,
      ([id]) => (colectivo(id) ? [200, colectivo(id)] : [404, {}]),
    ],
    [
      /^post \/colectivos\/([^/]+)\/solicitudes-ingreso$/,
      ([id]) => {
        const repetida = estado.solicitudes.some(
          (solicitud) => solicitud.colectivoId === id && solicitud.estado === "PENDIENTE",
        );
        if (repetida) return [409, { codigo: "SOLICITUD_PENDIENTE" }];
        return [201, nuevaSolicitud(id)];
      },
    ],
    [
      /^post \/colectivos\/([^/]+)\/solicitudes-ingreso\/([^/]+)\/cancelacion$/,
      ([, solicitudId]) => {
        const solicitud = estado.solicitudes.find(({ id }) => id === solicitudId);
        solicitud.estado = "CANCELADA";
        return [200, solicitud];
      },
    ],
  ];

  const fijas = {
    "post /auth/registro": () => [200, { usuarioId: "u1", creado: false }],
    "get /auth/me": () =>
      falloDeLaCuenta ? [500, { codigo: "ERROR_INTERNO" }] : [200, cuenta()],
    "get /auth/solicitudes-ingreso": () => [200, structuredClone(estado.solicitudes)],
    "put /auth/contexto-actual": ({ contextoId }) => {
      estado.actual = contextoId;
      return [200, contextoActual()];
    },
    "delete /auth/contexto-actual": () => {
      estado.actual = null;
      return [204, null];
    },
  };

  async function transporte(config) {
    const clave = `${config.method} ${config.url}`;
    estado.pedidos.push(clave);
    const cuerpo =
      typeof config.data === "string" ? JSON.parse(config.data) : config.data;
    let resultado = fijas[clave]?.(cuerpo ?? {});
    if (!resultado) {
      for (const [patron, resolver] of dinamicas) {
        const coincidencia = clave.match(patron);
        if (coincidencia) {
          resultado = resolver(coincidencia.slice(1), config);
          break;
        }
      }
    }
    const [status, data] = resultado ?? [200, LISTA_VACIA];
    const respuesta = {
      config,
      status,
      statusText: "",
      headers: {},
      data: structuredClone(data),
    };
    if (status >= 400) {
      throw new axios.AxiosError("Error", "ERR_BAD_RESPONSE", config, null, respuesta);
    }
    return respuesta;
  }

  return {
    estado,
    transporte,
    veces: (clave) => estado.pedidos.filter((pedido) => pedido === clave).length,
    pedirDesdeOtraVentana: (colectivoId) => nuevaSolicitud(colectivoId),
    aceptar: (solicitudId) => {
      const solicitud = estado.solicitudes.find(({ id }) => id === solicitudId);
      solicitud.estado = "ACEPTADA";
      estado.contextos.push({
        id: `ctx-${solicitud.colectivoId}`,
        tipo: "COLECTIVO",
        rol: "MIEMBRO",
        colectivo: {
          id: solicitud.colectivoId,
          nombre: colectivo(solicitud.colectivoId).nombre,
        },
        colaborador: null,
        permisos: [],
      });
    },
    rechazar: (solicitudId) => {
      estado.solicitudes.find(({ id }) => id === solicitudId).estado = "RECHAZADA";
    },
    fallarElListado: (valor = true) => {
      falloDelListado = valor;
    },
    fallarLaCuenta: (valor = true) => {
      falloDeLaCuenta = valor;
    },
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
const tarjeta = (nombre) =>
  screen.findByRole("article", { name: new RegExp(`^${nombre}`) });

const PENDIENTE_EN_HUERTA = [
  {
    id: "s1",
    colectivoId: "c-huerta",
    estado: "PENDIENTE",
    fechaSolicitud: "2026-11-13",
  },
];
const ACEPTADA_EN_HUERTA = [
  { id: "s1", colectivoId: "c-huerta", estado: "ACEPTADA", fechaSolicitud: "2026-11-13" },
];
const CONTEXTO_MIEMBRO = {
  id: "ctx-c-huerta",
  tipo: "COLECTIVO",
  rol: "MIEMBRO",
  colectivo: { id: "c-huerta", nombre: "Huerta Comunitaria" },
  colaborador: null,
  permisos: [],
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

describe("lista de colectivos para unirse", () => {
  test("muestra nombre, tipo, una línea de la descripción sin marcas y el perfil en otra pestaña", async () => {
    const back = crearBack();
    montar(back, "/bienvenida/colectivo/unirme");

    const huerta = await tarjeta("Huerta Comunitaria");
    expect(within(huerta).getByText("ONG")).toBeVisible();
    expect(within(huerta).getByText(/Huertas barriales en escuelas\./)).toBeVisible();
    expect(huerta).not.toHaveTextContent("**");
    const perfil = within(huerta).getByRole("link", { name: /Ver perfil/ });
    expect(perfil).toHaveAttribute("href", "/colectivos/c-huerta");
    expect(perfil).toHaveAttribute("target", "_blank");
    expect(perfil.getAttribute("rel")).toContain("noopener");
    expect(await screen.findByText("3 colectivos encontrados")).toBeVisible();
    expect(
      back.estado.pedidos.filter((pedido) => pedido === "get /colectivos"),
    ).toHaveLength(1);
  });

  test("busca por nombre sin importar mayúsculas ni tildes y deja la búsqueda en la URL", async () => {
    const back = crearBack();
    const { user, router } = montar(back, "/bienvenida/colectivo/unirme");
    await tarjeta("Huerta Comunitaria");

    await user.type(screen.getByLabelText("Buscar por nombre"), "EDUCACION");
    await user.click(screen.getByRole("button", { name: "Buscar" }));

    expect(await tarjeta("Educación Popular")).toBeVisible();
    expect(screen.queryByRole("article", { name: /^Huerta/ })).not.toBeInTheDocument();
    expect(router.state.location.search).toBe("?q=EDUCACION");
  });

  test("al recargar con la búsqueda en la URL muestra el mismo resultado", async () => {
    const back = crearBack();
    montar(back, "/bienvenida/colectivo/unirme?q=tecnolog%C3%ADa");

    expect(await tarjeta("Mujeres en Tecnología")).toBeVisible();
    expect(screen.getByLabelText("Buscar por nombre")).toHaveValue("tecnología");
    expect(screen.getAllByRole("article")).toHaveLength(1);
  });

  test("sin coincidencias avisa y permite limpiar la búsqueda", async () => {
    const back = crearBack();
    const { user, router } = montar(back, "/bienvenida/colectivo/unirme?q=zzz");

    expect(
      await screen.findByRole("heading", {
        name: "No encontramos colectivos con ese nombre",
      }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));

    expect(await tarjeta("Huerta Comunitaria")).toBeVisible();
    expect(router.state.location.search).toBe("");
    expect(screen.getByLabelText("Buscar por nombre")).toHaveValue("");
  });

  test("sin colectivos invita a crear el propio", async () => {
    const back = crearBack({ colectivos: [] });
    montar(back, "/bienvenida/colectivo/unirme");

    expect(
      await screen.findByRole("heading", {
        name: "Todavía no hay colectivos en Código a Voluntad",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Crear mi propio colectivo" }),
    ).toHaveAttribute("href", "/bienvenida/colectivo/nuevo");
  });

  test("si falla la carga ofrece reintentar", async () => {
    const back = crearBack();
    back.fallarElListado();
    const { user } = montar(back, "/bienvenida/colectivo/unirme");

    expect(
      await screen.findByRole("heading", { name: "No pudimos cargar los colectivos" }),
    ).toBeVisible();
    back.fallarElListado(false);
    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await tarjeta("Huerta Comunitaria")).toBeVisible();
  });

  test("pagina de a 12 y recuerda la página en la URL", async () => {
    const muchos = Array.from({ length: 13 }, (_, indice) => ({
      id: `c-${indice + 1}`,
      nombre: `Colectivo ${String(indice + 1).padStart(2, "0")}`,
      descripcion: "Descripción.",
      tipoColectivo: "ONG",
    }));
    const back = crearBack({ colectivos: muchos });
    const { user, router } = montar(back, "/bienvenida/colectivo/unirme");

    expect(await screen.findByText("Mostrando 1–12 de 13 colectivos")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Siguiente" }));

    expect(await tarjeta("Colectivo 13")).toBeVisible();
    expect(router.state.location.search).toBe("?pagina=2");
    expect(screen.getAllByRole("article")).toHaveLength(1);
  });
});

describe("pedir el ingreso durante el registro", () => {
  test("envía el pedido, avisa y lleva a la espera con el pedido pendiente", async () => {
    const back = crearBack();
    const { user, router } = montar(back, "/bienvenida/colectivo/unirme");

    const huerta = await tarjeta("Huerta Comunitaria");
    await user.click(within(huerta).getByRole("button", { name: /Pedir sumarme/ }));

    expect(await titulo("Esperando que te acepten")).toBeVisible();
    expect(router.state.location.pathname).toBe("/cuenta/solicitudes");
    expect(
      await screen.findByText(
        "Le avisamos a Huerta Comunitaria. Vas a entrar cuando te acepten.",
      ),
    ).toBeVisible();
    const lista = await screen.findByRole("list", { name: "Tus solicitudes de ingreso" });
    expect(within(lista).getByText("Pendiente")).toBeVisible();
    expect(within(lista).getByRole("link", { name: "Huerta Comunitaria" })).toBeVisible();
    expect(back.veces("post /colectivos/c-huerta/solicitudes-ingreso")).toBe(1);
    expect(back.estado.contextos).toEqual([]);
  });

  test("un colectivo con pedido pendiente muestra «Pedido enviado» y no se puede pedir de nuevo", async () => {
    const back = crearBack({ solicitudes: PENDIENTE_EN_HUERTA });
    montar(back, "/bienvenida/colectivo/unirme");

    const huerta = await tarjeta("Huerta Comunitaria");
    expect(within(huerta).getByText("Pedido enviado")).toBeVisible();
    expect(within(huerta).queryByRole("button", { name: /Pedir sumarme/ })).toBeNull();
    const educacion = await tarjeta("Educación Popular");
    expect(
      within(educacion).getByRole("button", { name: /Pedir sumarme/ }),
    ).toBeEnabled();
    expect(screen.getByRole("link", { name: "Volver a mis solicitudes" })).toBeVisible();
  });

  test("si el pedido ya existía (409) avisa y pasa a «Pedido enviado»", async () => {
    const back = crearBack();
    const { user, router } = montar(back, "/bienvenida/colectivo/unirme");
    const huerta = await tarjeta("Huerta Comunitaria");
    back.pedirDesdeOtraVentana("c-huerta");

    await user.click(within(huerta).getByRole("button", { name: /Pedir sumarme/ }));

    expect(
      await screen.findByText("Ya tenés una solicitud pendiente para este colectivo."),
    ).toBeVisible();
    await waitFor(() => expect(within(huerta).getByText("Pedido enviado")).toBeVisible());
    expect(router.state.location.pathname).toBe("/bienvenida/colectivo/unirme");
  });
});

describe("la espera no deja entrar a ningún panel", () => {
  test.each([
    "/",
    "/proyectos",
    "/proyectos/p1",
    "/bienvenida",
    "/bienvenida/colaboradora",
    "/colectivo/resumen",
    "/colectivo/proyectos",
    "/colaboradora/perfil",
    "/mensajes",
    "/login",
    "/registro",
    "/sin-permiso",
    "/una-ruta-que-no-existe",
  ])("con un pedido pendiente, %s lleva a la espera", async (ruta) => {
    const back = crearBack({ solicitudes: PENDIENTE_EN_HUERTA });
    const { router } = montar(back, ruta);

    expect(await titulo("Esperando que te acepten")).toBeVisible();
    expect(router.state.location.pathname).toBe("/cuenta/solicitudes");
    expect(
      screen.queryByRole("navigation", { name: "Principal" }),
    ).not.toBeInTheDocument();
    expect(back.estado.contextos).toEqual([]);
  });

  test.each([
    ["/bienvenida/colectivo/unirme", "Unirme a un colectivo"],
    ["/bienvenida/colectivo/nuevo", "Creá el perfil de tu colectivo"],
    ["/cuenta/nombre", "Tu nombre"],
  ])("deja ver %s", async (ruta, nombre) => {
    const back = crearBack({ solicitudes: PENDIENTE_EN_HUERTA });
    const { router } = montar(back, ruta);

    expect(await titulo(nombre)).toBeVisible();
    expect(router.state.location.pathname).toBe(ruta);
  });

  test("deja ver el perfil público de un colectivo para decidir", async () => {
    const back = crearBack({ solicitudes: PENDIENTE_EN_HUERTA });
    const { router } = montar(back, "/colectivos/c-educacion");

    expect(await titulo("Educación Popular")).toBeVisible();
    expect(router.state.location.pathname).toBe("/colectivos/c-educacion");
  });

  test("el menú de cuenta solo tiene tu nombre, mis solicitudes y cerrar sesión", async () => {
    const back = crearBack({ solicitudes: PENDIENTE_EN_HUERTA });
    const { user } = montar(back, "/cuenta/solicitudes");

    await user.click(await screen.findByRole("button", { name: "Mi cuenta" }));
    expect(screen.getByRole("link", { name: "Tu nombre" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Mis solicitudes" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeVisible();
    expect(screen.queryByRole("link", { name: "Mi perfil" })).not.toBeInTheDocument();
  });

  test("ofrece actualizar, pedir en otro colectivo y crear el propio", async () => {
    const back = crearBack({ solicitudes: PENDIENTE_EN_HUERTA });
    montar(back, "/cuenta/solicitudes");

    expect(await titulo("Esperando que te acepten")).toBeVisible();
    expect(
      screen.getByText(
        "Quienes coordinan el colectivo revisan tu pedido. Cuando lo acepten, vas a entrar directo la próxima vez que ingreses. Podés cerrar esta página y volver cuando quieras.",
      ),
    ).toBeVisible();
    const actualizar = screen.getByRole("button", { name: "Actualizar" });
    expect(actualizar).toBeEnabled();
    const lista = await screen.findByRole("list", { name: "Tus solicitudes de ingreso" });
    expect(
      actualizar.compareDocumentPosition(lista) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    const fila = within(lista).getByRole("listitem");
    expect(within(fila).getByText("Pendiente")).toBeVisible();
    expect(
      within(fila).getByRole("button", {
        name: "Cancelar la solicitud a Huerta Comunitaria",
      }),
    ).toHaveTextContent("Cancelar la solicitud");
    expect(
      screen.getByRole("link", { name: "Pedir sumarme a otro colectivo" }),
    ).toHaveAttribute("href", "/bienvenida/colectivo/unirme");
    expect(
      screen.getByRole("link", { name: "Crear mi propio colectivo" }),
    ).toHaveAttribute("href", "/bienvenida/colectivo/nuevo");
  });
});

describe("recargar, volver a ingresar y ser aceptada", () => {
  test("al volver de Logto con un pedido pendiente llega a la espera", async () => {
    const back = crearBack({ solicitudes: PENDIENTE_EN_HUERTA });
    const { router } = ingresarPorLogto(back);

    expect(await titulo("Esperando que te acepten")).toBeVisible();
    expect(router.state.location.pathname).toBe("/cuenta/solicitudes");
  });

  test("sigue esperando mientras no la acepten", async () => {
    const back = crearBack({ solicitudes: PENDIENTE_EN_HUERTA });
    const { user, router } = montar(back, "/cuenta/solicitudes");
    await titulo("Esperando que te acepten");

    await user.click(screen.getByRole("button", { name: "Actualizar" }));

    await waitFor(() => expect(back.veces("get /auth/me")).toBeGreaterThan(1));
    expect(await titulo("Esperando que te acepten")).toBeVisible();
    expect(router.state.location.pathname).toBe("/cuenta/solicitudes");
    expect(
      await screen.findByText(
        /^Todavía no te aceptaron\. Revisamos a las \d{2}:\d{2}\.$/,
      ),
    ).toHaveAttribute("role", "status");
  });

  test("si la cuenta no se puede recargar al actualizar, muestra el error con «Reintentar»", async () => {
    const back = crearBack({ solicitudes: PENDIENTE_EN_HUERTA });
    const { user } = montar(back, "/cuenta/solicitudes");
    await titulo("Esperando que te acepten");
    back.fallarLaCuenta();

    await user.click(screen.getByRole("button", { name: "Actualizar" }));

    expect(await titulo("No pudimos verificar tu sesión")).toBeVisible();
    expect(screen.queryByText(/Todavía no te aceptaron/)).not.toBeInTheDocument();
    back.fallarLaCuenta(false);
    await user.click(screen.getByRole("button", { name: /Reintentar/ }));
    expect(await titulo("Esperando que te acepten")).toBeVisible();
  });

  test("al tocar «Actualizar» con el pedido aceptado selecciona el contexto y entra al panel", async () => {
    const back = crearBack({ solicitudes: PENDIENTE_EN_HUERTA });
    const { user, router } = montar(back, "/cuenta/solicitudes");
    await titulo("Esperando que te acepten");
    back.aceptar("s1");

    await user.click(screen.getByRole("button", { name: "Actualizar" }));

    await enRuta(router, "/colectivo/resumen");
    expect(back.estado.actual).toBe(CONTEXTO_MIEMBRO.id);
    expect(back.veces("put /auth/contexto-actual")).toBe(1);
    expect(await screen.findByRole("navigation", { name: "Principal" })).toBeVisible();
  });

  test("quien fue aceptada entra directo al panel al ingresar de nuevo", async () => {
    const back = crearBack({
      solicitudes: ACEPTADA_EN_HUERTA,
      contextos: [CONTEXTO_MIEMBRO],
    });
    const { router } = ingresarPorLogto(back);

    await enRuta(router, "/colectivo/resumen");
    expect(back.estado.actual).toBe(CONTEXTO_MIEMBRO.id);
    expect(back.veces("get /auth/solicitudes-ingreso")).toBe(0);
    expect(
      screen.queryByRole("heading", { name: "¿Cómo vas a usar Código a Voluntad?" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Esperando que te acepten" }),
    ).toBeNull();
  });
});

describe("cancelar o ser rechazada", () => {
  test("al cancelar el único pedido pendiente vuelve a poder elegir crear o unirse", async () => {
    const back = crearBack({ solicitudes: PENDIENTE_EN_HUERTA });
    const { user, router } = montar(back, "/cuenta/solicitudes");

    await user.click(
      await screen.findByRole("button", {
        name: "Cancelar la solicitud a Huerta Comunitaria",
      }),
    );
    await user.click(
      within(await screen.findByRole("dialog")).getByRole("button", {
        name: "Cancelar la solicitud",
      }),
    );

    expect(await titulo("¿Cómo vas a usar Código a Voluntad?")).toBeVisible();
    expect(router.state.location.pathname).toBe("/bienvenida");
    expect(
      back.veces("post /colectivos/c-huerta/solicitudes-ingreso/s1/cancelacion"),
    ).toBe(1);
    expect(screen.getByRole("link", { name: /Unirme a un colectivo/ })).toHaveAttribute(
      "href",
      "/bienvenida/colectivo/unirme",
    );
  });

  test("si le queda otro pedido pendiente sigue en la espera", async () => {
    const back = crearBack({
      solicitudes: [
        ...PENDIENTE_EN_HUERTA,
        {
          id: "s2",
          colectivoId: "c-educacion",
          estado: "PENDIENTE",
          fechaSolicitud: "2026-11-14",
        },
      ],
    });
    const { user, router } = montar(back, "/cuenta/solicitudes");

    await user.click(
      await screen.findByRole("button", {
        name: "Cancelar la solicitud a Huerta Comunitaria",
      }),
    );
    await user.click(
      within(await screen.findByRole("dialog")).getByRole("button", {
        name: "Cancelar la solicitud",
      }),
    );

    await waitFor(() =>
      expect(
        screen.queryByRole("button", {
          name: "Cancelar la solicitud a Huerta Comunitaria",
        }),
      ).not.toBeInTheDocument(),
    );
    expect(await titulo("Esperando que te acepten")).toBeVisible();
    expect(router.state.location.pathname).toBe("/cuenta/solicitudes");
  });

  test("con el pedido rechazado y ninguno pendiente vuelve a elegir y ve el rechazo en sus solicitudes", async () => {
    const back = crearBack({ solicitudes: PENDIENTE_EN_HUERTA });
    back.rechazar("s1");
    const { router, user } = ingresarPorLogto(back);

    expect(await titulo("¿Cómo vas a usar Código a Voluntad?")).toBeVisible();
    expect(router.state.location.pathname).toBe("/bienvenida");

    await router.navigate("/cuenta/solicitudes");

    expect(await titulo("Mis solicitudes")).toBeVisible();
    expect(await screen.findByText("Rechazada")).toBeVisible();
    expect(
      screen.getByText("Podés pedir sumarte a otro colectivo o crear el tuyo."),
    ).toBeVisible();
    await user.click(screen.getByRole("link", { name: "Elegir cómo registrarme" }));
    expect(await titulo("¿Cómo vas a usar Código a Voluntad?")).toBeVisible();
  });
});
