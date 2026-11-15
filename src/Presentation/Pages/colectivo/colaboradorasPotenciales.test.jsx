import { screen, waitFor, within } from "@testing-library/react";
import axios from "axios";
import { Route } from "react-router-dom";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { montarRutas } from "@/test/montarRutas.jsx";
import { RutaDelDueno } from "@/Presentation/Routes/RutaDelDueno.jsx";
import { RutaProtegida } from "@/Presentation/Routes/RutaProtegida.jsx";
import ColaboradorasPotencialesPage from "./ColaboradorasPotencialesPage.jsx";

const cuenta = { id: "1", rol: "COLECTIVO", perfilId: "c1" };
const adaptador = axiosClient.defaults.adapter;
const URL_CANDIDATAS = "/proyectos/p1/perfiles/pe1/colaboradoras-potenciales";
const URL_INVITACIONES = "/proyectos/p1/perfiles/pe1/invitaciones";
let proyecto;
let candidatas;
let totalPaginas;
let dueño;
let falloDeLista;
let falloDeInvitacion;
let transporte;

function candidata(id, campos = {}, resto = {}) {
  return {
    colaborador: {
      id,
      nombre: id,
      habilidades: [{ codigo: "react", titulo: "React" }],
      recibeMensajeriaInterna: true,
      ...campos,
    },
    habilidadesOpcionalesQueTiene: 1,
    ...resto,
  };
}

beforeEach(() => {
  proyecto = {
    id: "p1",
    titulo: "Turnos del barrio",
    estado: "ABIERTO",
    perfiles: [
      {
        id: "pe1",
        descripcion: "Interfaz del comedor",
        busquedaAbierta: true,
        habilidadesRequeridas: [{ codigo: "react", titulo: "React" }],
        habilidadesOpcionales: [
          { codigo: "css", titulo: "CSS" },
          { codigo: "a11y", titulo: "Accesibilidad" },
        ],
      },
    ],
  };
  candidatas = [candidata("Ada"), candidata("Grace")];
  totalPaginas = 1;
  dueño = true;
  falloDeLista = null;
  falloDeInvitacion = null;
  transporte = vi.fn(async (config) => {
    const { url, method } = config;
    const responder = (data) => ({
      config,
      status: 200,
      statusText: "OK",
      headers: {},
      data: structuredClone(data),
    });
    const fallar = (status) => {
      throw new axios.AxiosError("error", "ERR_BAD_RESPONSE", config, null, {
        status,
        data: {},
      });
    };
    if (url === "/colectivos/c1")
      return responder({ proyectos: dueño ? [{ id: "p1" }] : [] });
    if (url === "/proyectos/p1")
      return responder({ ...proyecto, colectivo: { id: dueño ? "c1" : "otro" } });
    if (url === URL_CANDIDATAS) {
      if (falloDeLista) fallar(falloDeLista);
      const pagina = config.params?.page ?? 1;
      return responder({
        data: pagina > totalPaginas ? [] : candidatas,
        meta: {
          page: pagina,
          per_page: 12,
          total: candidatas.length,
          total_pages: totalPaginas,
        },
      });
    }
    if (method === "post" && url === URL_INVITACIONES) {
      if (falloDeInvitacion) fallar(falloDeInvitacion);
      return responder({ id: "n1", tipo: "INVITACION" });
    }
    throw new Error(`Pedido inesperado: ${method} ${url}`);
  });
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptador;
});

function montar(query = "", usuario = cuenta) {
  return montarRutas(
    <>
      <Route element={<RutaProtegida roles={["COLECTIVO"]} />}>
        <Route
          element={
            <RutaDelDueno sinPermiso="Solo el colectivo dueño puede buscar colaboradoras para este proyecto." />
          }
        >
          <Route
            path="/proyectos/:id/perfiles/:perfilId/colaboradoras"
            element={<ColaboradorasPotencialesPage />}
          />
        </Route>
      </Route>
      <Route path="/proyectos/:id" element={<h1>Detalle del proyecto</h1>} />
      <Route path="/colaboradoras/:id" element={<h1>Perfil de la colaboradora</h1>} />
      <Route path="/login" element={<h1>Ingresar</h1>} />
      <Route path="/sin-permiso" element={<h1>Sin permiso</h1>} />
    </>,
    { ruta: `/proyectos/p1/perfiles/pe1/colaboradoras${query}`, cuenta: usuario },
  );
}

const consultasDeLista = () =>
  transporte.mock.calls.filter(([config]) => config.url === URL_CANDIDATAS);
const invitaciones = () =>
  transporte.mock.calls.filter(([config]) => config.method === "post");

async function abrirDialogo(user, nombre) {
  const fila = (await screen.findByRole("heading", { name: nombre })).closest("li");
  await user.click(within(fila).getByRole("button", { name: "Contactar" }));
  return screen.getByRole("dialog");
}

test("muestra la cabecera y cada candidata con sus habilidades y opcionales, sin datos privados", async () => {
  candidatas = [
    candidata(
      "Ada",
      {
        habilidades: [
          { codigo: "react", titulo: "React" },
          { codigo: "css", titulo: "CSS" },
        ],
        mediosDeContacto: [{ valor: "secreto@ejemplo.org" }],
        correo: "ada@ejemplo.org",
        cuentaGit: "ada-privada",
      },
      { habilidadesOpcionalesQueTiene: ["css"] },
    ),
  ];
  montar();
  expect(
    await screen.findByRole("heading", {
      level: 1,
      name: "Colaboradoras para este perfil",
    }),
  ).toBeVisible();
  expect(await screen.findByText("Turnos del barrio")).toBeVisible();
  expect(await screen.findByText("Interfaz del comedor")).toBeVisible();
  expect(screen.getByRole("link", { name: "Volver al proyecto" })).toHaveAttribute(
    "href",
    "/proyectos/p1",
  );
  const fila = screen.getByRole("heading", { level: 2, name: "Ada" }).closest("li");
  expect(within(fila).getByRole("link", { name: "Ada" })).toHaveAttribute(
    "href",
    "/colaboradoras/Ada",
  );
  expect(within(fila).getByText("Habilidades: React, CSS")).toBeVisible();
  expect(within(fila).getByText("Tiene 1 de 2 habilidades opcionales")).toBeVisible();
  expect(screen.getByRole("list")).toBeVisible();
  expect(document.body).not.toHaveTextContent(/secreto@|ada@|ada-privada/);
  expect(consultasDeLista()[0][0].params).toEqual({ page: 1, limit: 12 });
});

test("el enlace a la colaboradora vuelve a esta lista", async () => {
  const { user, router } = montar("?pagina=1");
  await user.click(await screen.findByRole("link", { name: "Ada" }));
  expect(
    await screen.findByRole("heading", { name: "Perfil de la colaboradora" }),
  ).toBeVisible();
  expect(router.state.location.state.textoVolver).toBe(
    "Volver a las colaboradoras del perfil",
  );
  expect(router.state.location.state.volverA).toBe(
    "/proyectos/p1/perfiles/pe1/colaboradoras?pagina=1",
  );
});

test("la página vive en la URL y al recargar se ve la misma", async () => {
  totalPaginas = 3;
  const { user, router } = montar();
  await screen.findByRole("heading", { name: "Ada" });
  await user.click(screen.getByRole("button", { name: "Página 2" }));
  await waitFor(() => expect(router.state.location.search).toBe("?pagina=2"));
  await waitFor(() =>
    expect(consultasDeLista().at(-1)[0].params).toEqual({ page: 2, limit: 12 }),
  );
  await user.click(screen.getByRole("button", { name: "Anterior" }));
  await waitFor(() => expect(router.state.location.search).toBe(""));
});

test("una página que ya no existe lleva a la última", async () => {
  totalPaginas = 2;
  const { router } = montar("?pagina=9");
  await waitFor(() => expect(router.state.location.search).toBe("?pagina=2"));
  expect(await screen.findByRole("heading", { name: "Ada" })).toBeVisible();
});

test("sin candidatas explica y vuelve al proyecto", async () => {
  candidatas = [];
  montar();
  expect(
    await screen.findByRole("heading", {
      name: "Todavía no hay colaboradoras con estas habilidades",
    }),
  ).toBeVisible();
  expect(screen.getAllByRole("link", { name: "Volver al proyecto" })).toHaveLength(2);
});

test("un error al cargar permite reintentar", async () => {
  falloDeLista = 500;
  const { user } = montar();
  expect(await screen.findByText("No pudimos cargar las colaboradoras")).toBeVisible();
  falloDeLista = null;
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(await screen.findByRole("heading", { name: "Ada" })).toBeVisible();
});

test("un perfil que ya no existe en el proyecto lo dice y vuelve", async () => {
  proyecto.perfiles = [];
  montar();
  expect(
    await screen.findByRole("heading", { name: "Este perfil ya no existe" }),
  ).toBeVisible();
  expect(screen.getByRole("link", { name: "Volver al proyecto" })).toBeVisible();
});

test("un 404 del back se traduce a un texto de persona", async () => {
  falloDeLista = 404;
  montar();
  expect(
    await screen.findByRole("heading", { name: "No pudimos abrir esta búsqueda" }),
  ).toBeVisible();
});

test.each([
  [{ recibeMensajeriaInterna: false }],
  [{ recibeMensajeriaInterna: undefined }],
])("Contactar queda deshabilitado con el motivo si %j", async (campos) => {
  candidatas = [candidata("Ada", campos), candidata("Grace")];
  montar();
  const fila = (await screen.findByRole("heading", { name: "Ada" })).closest("li");
  const boton = within(fila).getByRole("button", { name: "Contactar" });
  expect(boton).toBeDisabled();
  expect(boton).toHaveAccessibleDescription("No recibe mensajes internos.");
  const otra = screen.getByRole("heading", { name: "Grace" }).closest("li");
  expect(within(otra).getByRole("button", { name: "Contactar" })).toBeEnabled();
});

test("invita con el mensaje, avisa, marca la fila y no recarga la lista", async () => {
  const { user } = montar();
  const dialogo = await abrirDialogo(user, "Ada");
  expect(within(dialogo).getByRole("heading", { name: "Invitar a «Ada»" })).toBeVisible();
  expect(dialogo).toHaveTextContent(
    "Va a recibir tu mensaje en su bandeja de la plataforma, para el perfil «Interfaz del comedor» de «Turnos del barrio».",
  );
  expect(dialogo).not.toHaveTextContent(/contacto/i);
  await user.type(within(dialogo).getByLabelText("Mensaje"), "Hola, ¿te sumás?");
  await user.click(within(dialogo).getByRole("button", { name: "Enviar invitación" }));
  expect(await screen.findByText("Invitación enviada a «Ada».")).toBeVisible();
  expect(invitaciones()).toHaveLength(1);
  expect(invitaciones()[0][0].url).toBe(URL_INVITACIONES);
  expect(JSON.parse(invitaciones()[0][0].data)).toEqual({
    colaboradorId: "Ada",
    mensaje: "Hola, ¿te sumás?",
  });
  const fila = screen.getByRole("heading", { name: "Ada" }).closest("li");
  expect(within(fila).getByText("Invitación enviada")).toBeVisible();
  expect(
    within(fila).queryByRole("button", { name: "Contactar" }),
  ).not.toBeInTheDocument();
  expect(consultasDeLista()).toHaveLength(1);
  expect(screen.getByRole("dialog", { hidden: true })).not.toBeVisible();
  await waitFor(() =>
    expect(within(fila).getByText("Invitación enviada").parentElement).toHaveFocus(),
  );
  const otra = screen.getByRole("heading", { name: "Grace" }).closest("li");
  expect(within(otra).getByRole("button", { name: "Contactar" })).toBeEnabled();
});

test("un mensaje vacío o de más de 500 caracteres no se envía y marca el error", async () => {
  const { user } = montar();
  const dialogo = await abrirDialogo(user, "Ada");
  const campo = within(dialogo).getByLabelText("Mensaje");
  expect(within(dialogo).getByText("Quedan 500 caracteres")).toBeInTheDocument();
  await user.click(within(dialogo).getByRole("button", { name: "Enviar invitación" }));
  expect(
    within(dialogo).getByText("Escribí un mensaje para la invitación."),
  ).toBeVisible();
  expect(campo).toBeInvalid();
  await user.click(campo);
  await user.paste("a".repeat(501));
  expect(within(dialogo).getAllByText("Te pasaste por 1 carácter")).toHaveLength(2);
  await user.click(within(dialogo).getByRole("button", { name: "Enviar invitación" }));
  expect(
    within(dialogo).getByText("El mensaje puede tener hasta 500 caracteres."),
  ).toBeVisible();
  expect(invitaciones()).toHaveLength(0);
});

test("el contador anuncia los caracteres que quedan al acercarse al límite", async () => {
  const { user } = montar();
  const dialogo = await abrirDialogo(user, "Ada");
  const anuncio = dialogo.querySelector('[aria-live="polite"]');
  expect(anuncio).toHaveTextContent("");
  await user.click(within(dialogo).getByLabelText("Mensaje"));
  await user.paste("a".repeat(460));
  expect(anuncio).toHaveTextContent("Quedan 40 caracteres");
});

test.each([
  [
    "el botón",
    async (user, dialogo) =>
      user.click(within(dialogo).getByRole("button", { name: "Cancelar" })),
  ],
  ["Esc", async (user) => user.keyboard("{Escape}")],
])(
  "cancelar con %s descarta el mensaje y devuelve el foco a Contactar",
  async (_nombre, cancelar) => {
    const { user } = montar();
    const dialogo = await abrirDialogo(user, "Ada");
    await user.type(within(dialogo).getByLabelText("Mensaje"), "borrador");
    await cancelar(user, dialogo);
    expect(invitaciones()).toHaveLength(0);
    const fila = screen.getByRole("heading", { name: "Ada" }).closest("li");
    await waitFor(() =>
      expect(within(fila).getByRole("button", { name: "Contactar" })).toHaveFocus(),
    );
    const nuevo = await abrirDialogo(user, "Ada");
    expect(within(nuevo).getByLabelText("Mensaje")).toHaveValue("");
  },
);

test.each([
  [409, "Ya invitaste a esta persona para este perfil."],
  [422, "El mensaje no es válido. Revisalo."],
])(
  "un %i deja el diálogo abierto con el mensaje escrito y el error propio",
  async (status, texto) => {
    falloDeInvitacion = status;
    const { user } = montar();
    const dialogo = await abrirDialogo(user, "Ada");
    await user.type(within(dialogo).getByLabelText("Mensaje"), "Hola");
    await user.click(within(dialogo).getByRole("button", { name: "Enviar invitación" }));
    expect(await within(dialogo).findByRole("alert")).toHaveTextContent(texto);
    expect(within(dialogo).getByLabelText("Mensaje")).toHaveValue("Hola");
    expect(dialogo).toBeVisible();
    expect(
      within(screen.getByRole("heading", { name: "Ada" }).closest("li")).getByRole(
        "button",
        {
          name: "Contactar",
        },
      ),
    ).toBeInTheDocument();
  },
);

test("un error del servidor no muestra su texto y se puede reintentar", async () => {
  falloDeInvitacion = 500;
  const { user } = montar();
  const dialogo = await abrirDialogo(user, "Ada");
  await user.type(within(dialogo).getByLabelText("Mensaje"), "Hola");
  await user.click(within(dialogo).getByRole("button", { name: "Enviar invitación" }));
  const alerta = await within(dialogo).findByRole("alert");
  expect(alerta.textContent.length).toBeGreaterThan(0);
  expect(alerta).not.toHaveTextContent(/ERR_BAD_RESPONSE|status code/i);
  falloDeInvitacion = null;
  await user.click(within(dialogo).getByRole("button", { name: "Enviar invitación" }));
  expect(await screen.findByText("Invitación enviada a «Ada».")).toBeVisible();
  expect(invitaciones()).toHaveLength(2);
});

test("mientras se envía no se puede cancelar ni enviar dos veces", async () => {
  let liberar;
  const original = transporte.getMockImplementation();
  transporte.mockImplementation(async (config) => {
    if (config.method === "post") await new Promise((resolver) => (liberar = resolver));
    return original(config);
  });
  const { user } = montar();
  const dialogo = await abrirDialogo(user, "Ada");
  await user.type(within(dialogo).getByLabelText("Mensaje"), "Hola");
  await user.click(within(dialogo).getByRole("button", { name: "Enviar invitación" }));
  expect(
    await within(dialogo).findByRole("button", { name: "Enviando…" }),
  ).toBeDisabled();
  expect(within(dialogo).getByRole("button", { name: "Cancelar" })).toBeDisabled();
  await user.keyboard("{Escape}");
  expect(dialogo).toBeVisible();
  const otra = screen.getByRole("heading", { name: "Grace", hidden: true }).closest("li");
  expect(
    within(otra).getByRole("button", { name: "Contactar", hidden: true }),
  ).toBeDisabled();
  liberar();
  expect(await screen.findByText("Invitación enviada a «Ada».")).toBeVisible();
  expect(invitaciones()).toHaveLength(1);
});

test.each([
  [cuenta, "No tenés permiso para ver esta página", false],
  [{ ...cuenta, rol: "COLABORADORA" }, "Sin permiso", true],
  [null, "Ingresar", true],
])(
  "una cuenta sin acceso no consulta las candidatas",
  async (usuario, titulo, dueñoDelProyecto) => {
    dueño = dueñoDelProyecto && usuario?.rol === "COLECTIVO";
    montar("", usuario);
    expect(await screen.findByRole("heading", { name: titulo })).toBeVisible();
    expect(consultasDeLista()).toHaveLength(0);
  },
);
