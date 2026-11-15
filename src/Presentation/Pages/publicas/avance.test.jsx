import { screen, waitFor, within } from "@testing-library/react";
import axios from "axios";
import { Route } from "react-router-dom";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { montarRutas } from "@/test/montarRutas.jsx";
import { MarcoDeLaApp } from "@/Presentation/Components/App/layout/MarcoDeLaApp.jsx";
import AvancePage from "./AvancePage.jsx";

const DUENO = { id: "1", rol: "COLECTIVO", perfilId: "c1" };
const COLABORADORA = { id: "2", rol: "COLABORADORA", perfilId: "k1" };
const adaptador = axiosClient.defaults.adapter;
const ACCIONES = /Cargar|Editar|Eliminar|Registrar/;
const LENTO = { timeout: 8000 };
let proyecto;
let logros;
let avances;
let esDueno;
let fallos;
let transporte;

beforeEach(() => {
  proyecto = {
    id: "p1",
    titulo: "Turnos del barrio",
    estado: "ABIERTO",
    porcentajeConcrecion: 40,
    urlSistema: "https://turnos.example.org",
    urlRepositorio: "https://git.example.org/turnos",
  };
  logros = [
    {
      id: "l1",
      titulo: "Primer relevamiento",
      descripcion: "Hablamos con el comedor.\nSegunda línea",
      fecha: "2026-11-01",
    },
    {
      id: "l2",
      titulo: "Prototipo navegable",
      descripcion: "Probado con tres personas.",
      fecha: "2026-11-05",
    },
  ];
  avances = [
    {
      id: "a1",
      porcentajeConcrecion: 25,
      urlSistema: "https://viejo.example.org",
      urlRepositorio: "https://git.example.org/viejo",
      fecha: "2026-10-20",
    },
    {
      id: "a2",
      porcentajeConcrecion: 40,
      urlSistema: "https://turnos.example.org",
      urlRepositorio: "https://git.example.org/turnos",
      fecha: "2026-11-03",
    },
  ];
  esDueno = true;
  fallos = {};
  transporte = vi.fn(async (config) => {
    const { url, method } = config;
    const clave = `${method} ${url}`;
    const responder = (data, status = 200) => ({
      config,
      status,
      statusText: "OK",
      headers: {},
      data: structuredClone(data),
    });
    const falla = fallos[clave];
    if (falla) {
      throw new axios.AxiosError("error", "ERR_BAD_RESPONSE", config, null, {
        status: falla.status,
        data: falla.data ?? {},
      });
    }
    const cuerpo = config.data ? JSON.parse(config.data) : null;
    if (url === "/colectivos/c1")
      return responder({ proyectos: esDueno ? [{ id: "p1" }] : [] });
    if (clave === "get /proyectos/p1")
      return responder({ ...proyecto, colectivo: { id: esDueno ? "c1" : "otro" } });
    if (clave === "get /proyectos/p1/logros") return responder(logros);
    if (clave === "get /proyectos/p1/avances") return responder(avances);
    if (clave === "post /proyectos/p1/logros") {
      const logro = { id: "l3", ...cuerpo, fecha: "2026-11-09" };
      logros.push(logro);
      return responder(logro, 201);
    }
    if (method === "put" && url.startsWith("/proyectos/p1/logros/")) {
      const logro = logros.find(({ id }) => url.endsWith(`/${id}`));
      Object.assign(logro, cuerpo);
      return responder(logro);
    }
    if (method === "delete" && url.startsWith("/proyectos/p1/logros/")) {
      logros = logros.filter(({ id }) => !url.endsWith(`/${id}`));
      return responder("", 204);
    }
    if (clave === "post /proyectos/p1/avances") {
      const avance = { id: "a3", ...cuerpo, fecha: "2026-11-09" };
      avances.push(avance);
      proyecto.porcentajeConcrecion = cuerpo.porcentajeConcrecion;
      proyecto.urlSistema = cuerpo.urlSistema;
      proyecto.urlRepositorio = cuerpo.urlRepositorio;
      return responder(avance, 201);
    }
    throw new Error(`Pedido inesperado: ${clave}`);
  });
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptador;
});

function montar(cuenta = null) {
  return montarRutas(
    <Route element={<MarcoDeLaApp />}>
      <Route path="/proyectos/:id/avance" element={<AvancePage />} />
      <Route path="/proyectos/:id" element={<h1>Detalle del proyecto</h1>} />
      <Route path="/proyectos" element={<h1>Proyectos</h1>} />
    </Route>,
    { ruta: "/proyectos/p1/avance", cuenta },
  );
}

const pedidos = (metodo) =>
  transporte.mock.calls.filter(([config]) => config.method === metodo);

async function esperarLaPagina() {
  return screen.findByRole("heading", { level: 1, name: "Avance de Turnos del barrio" });
}

async function abrir(user, nombreDelBoton) {
  await user.click(await screen.findByRole("button", { name: nombreDelBoton }));
  return screen.getByRole("dialog");
}

async function llenarLogro(user, dialogo, titulo, descripcion) {
  const campoTitulo = within(dialogo).getByLabelText(/Título/);
  const campoDescripcion = within(dialogo).getByLabelText(/Descripción/);
  await user.clear(campoTitulo);
  await user.clear(campoDescripcion);
  if (titulo) await user.type(campoTitulo, titulo);
  if (descripcion) await user.type(campoDescripcion, descripcion);
}

describe("lo que ve cualquier persona", () => {
  test("una visitante ve la barra, los enlaces, los logros y el historial, sin acciones", async () => {
    montar();
    expect(await esperarLaPagina()).toBeVisible();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByLabelText("Avance: 40 %")).toHaveAttribute("value", "40");
    expect(screen.getByRole("link", { name: /Ver el sistema/ })).toHaveAttribute(
      "href",
      "https://turnos.example.org",
    );
    expect(screen.getByRole("link", { name: /Ver el repositorio/ })).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(screen.getByRole("link", { name: "Volver al proyecto" })).toHaveAttribute(
      "href",
      "/proyectos/p1",
    );

    const seccionDeLogros = screen.getByRole("region", { name: "Logros" });
    expect(
      within(seccionDeLogros)
        .getAllByRole("heading", { level: 3 })
        .map((titulo) => titulo.textContent),
    ).toEqual(["Prototipo navegable", "Primer relevamiento"]);
    expect(within(seccionDeLogros).getByText(/Segunda línea/)).toBeVisible();

    const historial = screen.getByRole("region", { name: "Historial de avances" });
    const filas = within(historial).getAllByRole("listitem", { name: "" });
    expect(within(historial).getAllByText(/Avance registrado:/)).toHaveLength(2);
    expect(historial).toHaveTextContent(/40 %[\s\S]*25 %/);
    expect(filas.length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: ACCIONES })).not.toBeInTheDocument();
  });

  test("muestra el esqueleto mientras carga", async () => {
    montar();
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    await esperarLaPagina();
    expect(document.querySelector('[aria-busy="true"]')).not.toBeInTheDocument();
  });

  test("sin avances no hay barra y se avisa", async () => {
    delete proyecto.porcentajeConcrecion;
    avances = [];
    montar();
    await esperarLaPagina();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.getByText("Todavía no se registraron avances")).toBeVisible();
  });

  test("sin logros se avisa y la visitante no puede cargar", async () => {
    logros = [];
    montar();
    await esperarLaPagina();
    expect(screen.getByText("Todavía no se cargaron logros")).toBeVisible();
    expect(screen.queryByRole("button", { name: ACCIONES })).not.toBeInTheDocument();
  });

  test("sin logros, el colectivo dueño ve «Cargar el primer logro»", async () => {
    logros = [];
    montar(DUENO);
    expect(
      await screen.findByRole("button", { name: "Cargar el primer logro" }),
    ).toBeVisible();
  });

  test("toma el porcentaje del avance más reciente si el proyecto no lo trae", async () => {
    delete proyecto.porcentajeConcrecion;
    montar();
    await esperarLaPagina();
    expect(screen.getByLabelText("Avance: 40 %")).toBeVisible();
  });

  test("no muestra un enlace cuya dirección no es válida", async () => {
    proyecto.urlRepositorio = "javascript:alert(1)";
    montar();
    await esperarLaPagina();
    expect(screen.queryByRole("link", { name: /Ver el repositorio/ })).toBeNull();
    expect(screen.getByRole("link", { name: /Ver el sistema/ })).toBeVisible();
  });

  test("el error de carga ofrece reintentar y no muestra el crudo", async () => {
    fallos["get /proyectos/p1"] = { status: 500, data: { message: "MongoError: boom" } };
    const { user } = montar();
    expect(
      await screen.findByText("No pudimos cargar el avance del proyecto", {}, LENTO),
    ).toBeVisible();
    expect(document.body).not.toHaveTextContent(/MongoError|500/);
    delete fallos["get /proyectos/p1"];
    await user.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await esperarLaPagina()).toBeVisible();
  }, 20000);

  test("un proyecto inexistente lleva a la búsqueda", async () => {
    fallos["get /proyectos/p1"] = { status: 404 };
    montar();
    expect(
      await screen.findByRole("heading", { name: "No encontramos este proyecto" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: /Volver a la búsqueda/ })).toHaveAttribute(
      "href",
      "/proyectos",
    );
  });
});

describe("quién puede cambiar algo", () => {
  test("una colaboradora no ve acciones", async () => {
    montar(COLABORADORA);
    await esperarLaPagina();
    expect(screen.queryByRole("button", { name: ACCIONES })).not.toBeInTheDocument();
    expect(transporte.mock.calls.some(([{ url }]) => url === "/colectivos/c1")).toBe(
      false,
    );
  });

  test("otro colectivo no ve acciones", async () => {
    esDueno = false;
    montar(DUENO);
    await esperarLaPagina();
    await waitFor(() =>
      expect(transporte.mock.calls.some(([{ url }]) => url === "/proyectos/p1")).toBe(
        true,
      ),
    );
    expect(screen.queryByRole("button", { name: ACCIONES })).not.toBeInTheDocument();
    expect(screen.queryByText(/ya no se pueden cargar cambios/)).not.toBeInTheDocument();
  });

  test("el dueño de un proyecto abierto ve las acciones", async () => {
    montar(DUENO);
    await esperarLaPagina();
    expect(await screen.findByRole("button", { name: "Registrar avance" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Cargar un logro" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Editar el logro «Primer relevamiento»" }),
    ).toBeVisible();
  });

  test("con el proyecto finalizado el dueño ve la nota y ninguna acción", async () => {
    proyecto.estado = "FINALIZADO";
    montar(DUENO);
    await esperarLaPagina();
    expect(
      await screen.findByText(
        "El proyecto está finalizado: ya no se pueden cargar cambios",
      ),
    ).toBeVisible();
    expect(screen.getByLabelText("Avance: 40 %")).toBeVisible();
    expect(screen.queryByRole("button", { name: ACCIONES })).not.toBeInTheDocument();
  });
});

describe("logros", () => {
  test("cargar un logro lo agrega, avisa y devuelve el foco al botón", async () => {
    const { user } = montar(DUENO);
    await esperarLaPagina();
    const dialogo = await abrir(user, "Cargar un logro");
    await llenarLogro(user, dialogo, " Manual de uso ", "Guía para el equipo");
    await user.click(within(dialogo).getByRole("button", { name: "Cargar logro" }));

    expect(await screen.findByText("Cargamos el logro.")).toBeVisible();
    expect(
      await screen.findByRole("heading", { level: 3, name: "Manual de uso" }),
    ).toBeVisible();
    expect(JSON.parse(pedidos("post")[0][0].data)).toEqual({
      titulo: "Manual de uso",
      descripcion: "Guía para el equipo",
    });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Cargar un logro" })).toHaveFocus(),
    );
  });

  test("el primer logro también devuelve el foco a «Cargar un logro»", async () => {
    logros = [];
    const { user } = montar(DUENO);
    await esperarLaPagina();
    const dialogo = await abrir(user, "Cargar el primer logro");
    await llenarLogro(user, dialogo, "Primer logro", "Empezamos");
    await user.click(within(dialogo).getByRole("button", { name: "Cargar logro" }));
    await screen.findByRole("heading", { level: 3, name: "Primer logro" });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Cargar un logro" })).toHaveFocus(),
    );
  });

  test("no envía nada si faltan el título o la descripción y enfoca el primer error", async () => {
    const { user } = montar(DUENO);
    await esperarLaPagina();
    const dialogo = await abrir(user, "Cargar un logro");
    await user.click(within(dialogo).getByRole("button", { name: "Cargar logro" }));
    expect(within(dialogo).getByText("Escribí el título del logro.")).toBeVisible();
    expect(within(dialogo).getByText("Contá en qué consistió el logro.")).toBeVisible();
    expect(within(dialogo).getByLabelText(/Título/)).toHaveFocus();
    expect(pedidos("post")).toHaveLength(0);
  });

  test("un título repetido muestra el error en el campo y conserva lo escrito", async () => {
    fallos["post /proyectos/p1/logros"] = { status: 409, data: { message: "Duplicado" } };
    const { user } = montar(DUENO);
    await esperarLaPagina();
    const dialogo = await abrir(user, "Cargar un logro");
    await llenarLogro(user, dialogo, "Primer relevamiento", "Otra vez");
    await user.click(within(dialogo).getByRole("button", { name: "Cargar logro" }));

    expect(
      await within(dialogo).findByText("Ya hay un logro con ese título"),
    ).toBeVisible();
    expect(within(dialogo).getByLabelText(/Título/)).toHaveValue("Primer relevamiento");
    expect(within(dialogo).getByLabelText(/Descripción/)).toHaveValue("Otra vez");
    await waitFor(() => expect(within(dialogo).getByLabelText(/Título/)).toHaveFocus());
    expect(document.body).not.toHaveTextContent("Duplicado");
  });

  test("un 403 muestra el mensaje de la operación, no el del back", async () => {
    fallos["post /proyectos/p1/logros"] = { status: 403, data: { message: "Forbidden" } };
    const { user } = montar(DUENO);
    await esperarLaPagina();
    const dialogo = await abrir(user, "Cargar un logro");
    await llenarLogro(user, dialogo, "Otro", "Algo");
    await user.click(within(dialogo).getByRole("button", { name: "Cargar logro" }));
    expect(
      await within(dialogo).findByText("Solo el colectivo dueño puede hacer este cambio"),
    ).toBeVisible();
    expect(document.body).not.toHaveTextContent("Forbidden");
  });

  test("editar envía solo título y descripción y avisa", async () => {
    const { user } = montar(DUENO);
    await esperarLaPagina();
    const dialogo = await abrir(user, "Editar el logro «Primer relevamiento»");
    expect(within(dialogo).getByLabelText(/Título/)).toHaveValue("Primer relevamiento");
    await llenarLogro(user, dialogo, "Relevamiento inicial", "Con las vecinas");
    await user.click(within(dialogo).getByRole("button", { name: "Guardar cambios" }));

    expect(await screen.findByText("Guardamos los cambios del logro.")).toBeVisible();
    expect(
      await screen.findByRole("heading", { level: 3, name: "Relevamiento inicial" }),
    ).toBeVisible();
    const [config] = pedidos("put")[0];
    expect(config.url).toBe("/proyectos/p1/logros/l1");
    expect(JSON.parse(config.data)).toEqual({
      titulo: "Relevamiento inicial",
      descripcion: "Con las vecinas",
    });
  });

  test("cancelar la eliminación no envía nada y deja el foco en «Eliminar»", async () => {
    const { user } = montar(DUENO);
    await esperarLaPagina();
    const dialogo = await abrir(user, "Eliminar el logro «Primer relevamiento»");
    expect(within(dialogo).getByText(/Esta acción no se puede deshacer/)).toBeVisible();
    await user.click(within(dialogo).getByRole("button", { name: "Cancelar" }));
    expect(pedidos("delete")).toHaveLength(0);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Eliminar el logro «Primer relevamiento»" }),
      ).toHaveFocus(),
    );
  });

  test("confirmar la eliminación quita el logro, avisa y lleva el foco al título", async () => {
    const { user } = montar(DUENO);
    await esperarLaPagina();
    const dialogo = await abrir(user, "Eliminar el logro «Primer relevamiento»");
    await user.click(within(dialogo).getByRole("button", { name: "Eliminar" }));

    expect(await screen.findByText("Eliminamos el logro.")).toBeVisible();
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { level: 3, name: "Primer relevamiento" }),
      ).not.toBeInTheDocument(),
    );
    expect(pedidos("delete")[0][0].url).toBe("/proyectos/p1/logros/l1");
    await waitFor(() => expect(screen.getByRole("heading", { level: 1 })).toHaveFocus());
  });

  test("si la recarga falla después de guardar, el aviso queda y aparece el error con «Reintentar»", async () => {
    const { user } = montar(DUENO);
    await esperarLaPagina();
    const dialogo = await abrir(user, "Cargar un logro");
    await llenarLogro(user, dialogo, "Manual de uso", "Guía");
    fallos["get /proyectos/p1/logros"] = { status: 500 };
    await user.click(within(dialogo).getByRole("button", { name: "Cargar logro" }));

    expect(await screen.findByText("Cargamos el logro.")).toBeVisible();
    expect(
      await screen.findByText("No pudimos actualizar el avance", {}, LENTO),
    ).toBeVisible();
    expect(screen.getByText("Cargamos el logro.")).toBeVisible();
    expect(screen.getByRole("heading", { level: 1 })).toBeVisible();

    delete fallos["get /proyectos/p1/logros"];
    await user.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(
      await screen.findByRole("heading", { level: 3, name: "Manual de uso" }),
    ).toBeVisible();
    expect(screen.queryByText("No pudimos actualizar el avance")).not.toBeInTheDocument();
  }, 20000);
});

describe("registrar un avance", () => {
  async function completarPorcentaje(user, valor) {
    const campo = await screen.findByLabelText(/Porcentaje de avance/);
    await user.clear(campo);
    if (valor) await user.type(campo, valor);
    return campo;
  }

  test("el formulario viene con las direcciones actuales", async () => {
    montar(DUENO);
    await esperarLaPagina();
    expect(await screen.findByLabelText(/Dirección del sistema/)).toHaveValue(
      "https://turnos.example.org",
    );
    expect(screen.getByLabelText(/Dirección del repositorio/)).toHaveValue(
      "https://git.example.org/turnos",
    );
    expect(screen.getByLabelText(/Porcentaje de avance/)).toHaveValue("");
  });

  test("un porcentaje que no supera el actual no se envía ni pide confirmar", async () => {
    const { user } = montar(DUENO);
    await esperarLaPagina();
    const campo = await completarPorcentaje(user, "40");
    await user.click(screen.getByRole("button", { name: "Registrar avance" }));

    expect(screen.getByText("Tiene que superar el avance actual: 40 %")).toBeVisible();
    expect(campo).toHaveFocus();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(pedidos("post")).toHaveLength(0);
  });

  test("pide confirmar, registra el avance y actualiza la barra, los enlaces y el historial", async () => {
    const { user } = montar(DUENO);
    await esperarLaPagina();
    await completarPorcentaje(user, "60");
    const sistema = screen.getByLabelText(/Dirección del sistema/);
    await user.clear(sistema);
    await user.type(sistema, "https://nuevo.example.org");
    await user.click(screen.getByRole("button", { name: "Registrar avance" }));

    const dialogo = screen.getByRole("dialog");
    expect(
      within(dialogo).getByRole("heading", { name: "¿Registrar el avance: 60 %?" }),
    ).toBeVisible();
    expect(within(dialogo).getByText(/Esta acción no se puede deshacer/)).toBeVisible();
    expect(pedidos("post")).toHaveLength(0);

    await user.click(within(dialogo).getByRole("button", { name: "Registrar avance" }));
    expect(await screen.findByText("Registramos el avance: 60 %.")).toBeVisible();
    expect(JSON.parse(pedidos("post")[0][0].data)).toEqual({
      porcentajeConcrecion: 60,
      urlSistema: "https://nuevo.example.org",
      urlRepositorio: "https://git.example.org/turnos",
    });
    expect(await screen.findByLabelText("Avance: 60 %")).toHaveAttribute("value", "60");
    expect(screen.getByRole("link", { name: /Ver el sistema/ })).toHaveAttribute(
      "href",
      "https://nuevo.example.org",
    );
    const historial = screen.getByRole("region", { name: "Historial de avances" });
    expect(historial).toHaveTextContent(/60 %[\s\S]*40 %[\s\S]*25 %/);
    expect(screen.getByLabelText(/Porcentaje de avance/)).toHaveValue("");
    expect(screen.getByLabelText(/Dirección del sistema/)).toHaveValue(
      "https://nuevo.example.org",
    );
  });

  test("cancelar la confirmación no envía nada", async () => {
    const { user } = montar(DUENO);
    await esperarLaPagina();
    await completarPorcentaje(user, "60");
    await user.click(screen.getByRole("button", { name: "Registrar avance" }));
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Cancelar" }),
    );
    expect(pedidos("post")).toHaveLength(0);
    expect(screen.getByLabelText(/Porcentaje de avance/)).toHaveValue("60");
  });

  test("si el back lo rechaza, muestra mensajes propios por campo y nunca el crudo", async () => {
    fallos["post /proyectos/p1/avances"] = {
      status: 422,
      data: {
        message: "ZodError: porcentajeConcrecion",
        issues: [{ path: ["porcentajeConcrecion"], code: "too_small" }],
      },
    };
    const { user } = montar(DUENO);
    await esperarLaPagina();
    const campo = await completarPorcentaje(user, "60");
    await user.click(screen.getByRole("button", { name: "Registrar avance" }));
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Registrar avance",
      }),
    );

    expect(
      await screen.findByText(
        "No pudimos registrar el avance. Revisá el porcentaje y los enlaces.",
      ),
    ).toBeVisible();
    expect(
      screen.getByText(/Revisá el porcentaje: tiene que ser un número/),
    ).toBeVisible();
    expect(document.body).not.toHaveTextContent(/ZodError|422/);
    expect(campo).toHaveValue("60");
    await waitFor(() => expect(campo).toHaveFocus());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("con las direcciones vacías o mal escritas no envía y marca cada campo", async () => {
    const { user } = montar(DUENO);
    await esperarLaPagina();
    await completarPorcentaje(user, "60");
    const repositorio = screen.getByLabelText(/Dirección del repositorio/);
    await user.clear(repositorio);
    await user.type(repositorio, "ftp://repo.example.org");
    const sistema = screen.getByLabelText(/Dirección del sistema/);
    await user.clear(sistema);
    await user.click(screen.getByRole("button", { name: "Registrar avance" }));
    expect(screen.getByText("Escribí la dirección del sistema.")).toBeVisible();
    expect(
      screen.getByText("Escribí la dirección completa, empezando con https://."),
    ).toBeVisible();
    expect(sistema).toHaveFocus();
    expect(pedidos("post")).toHaveLength(0);
  });
});
