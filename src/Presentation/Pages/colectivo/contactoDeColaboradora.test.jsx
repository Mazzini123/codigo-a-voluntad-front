import { screen, waitFor, within } from "@testing-library/react";
import axios from "axios";
import { Route } from "react-router-dom";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { montarRutas } from "@/test/montarRutas.jsx";
import { RutaDelDueno } from "@/Presentation/Routes/RutaDelDueno.jsx";
import { RutaProtegida } from "@/Presentation/Routes/RutaProtegida.jsx";
import ContactoDeColaboradoraPage from "./ContactoDeColaboradoraPage.jsx";

const cuenta = { id: "1", rol: "COLECTIVO", perfilId: "c1" };
const adaptador = axiosClient.defaults.adapter;
const URL_CONTACTO = "/proyectos/p1/colaboradores/Ada/contacto";
const URL_PERSONA = "/colaboradores/Ada";
let medios;
let persona;
let dueño;
let falloDeContacto;
let falloDeNombre;
let transporte;

beforeEach(() => {
  medios = [
    { tipo: "EMAIL", valor: "ada@ejemplo.org" },
    { tipo: "WHATSAPP", valor: "+54 11 5555-5555" },
    { tipo: "TELEGRAM", valor: "@ada" },
  ];
  persona = { id: "Ada", nombre: "Ada", apellido: "Lovelace" };
  dueño = true;
  falloDeContacto = null;
  falloDeNombre = null;
  transporte = vi.fn(async (config) => {
    const { url } = config;
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
        data: { message: "detalle técnico del back" },
      });
    };
    if (url === "/colectivos/c1")
      return responder({ proyectos: dueño ? [{ id: "p1" }] : [] });
    if (url === URL_CONTACTO) {
      if (falloDeContacto) fallar(falloDeContacto);
      return responder(medios);
    }
    if (url === URL_PERSONA) {
      if (falloDeNombre) fallar(falloDeNombre);
      return responder(persona);
    }
    throw new Error(`Pedido inesperado: ${config.method} ${url}`);
  });
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptador;
});

function montar(usuario = cuenta, estado) {
  return montarRutas(
    <>
      <Route element={<RutaProtegida roles={["COLECTIVO"]} />}>
        <Route
          element={
            <RutaDelDueno sinPermiso="Solo el colectivo dueño puede ver los datos de contacto." />
          }
        >
          <Route
            path="/proyectos/:id/colaboradoras/:colaboradorId/contacto"
            element={<ContactoDeColaboradoraPage />}
          />
        </Route>
      </Route>
      <Route
        path="/proyectos/:id/postulaciones"
        element={<h1>Postulaciones recibidas</h1>}
      />
      <Route path="/login" element={<h1>Ingresar</h1>} />
      <Route path="/sin-permiso" element={<h1>Sin permiso</h1>} />
    </>,
    {
      ruta: { pathname: "/proyectos/p1/colaboradoras/Ada/contacto", state: estado },
      cuenta: usuario,
    },
  );
}

const pedidosDeContacto = () =>
  transporte.mock.calls.filter(([config]) => config.url === URL_CONTACTO);

test("muestra el nombre, el aviso de privacidad y cada medio con su botón «Copiar»", async () => {
  montar();
  const titulo = await screen.findByRole("heading", {
    level: 1,
    name: "Datos de contacto de Ada Lovelace",
  });
  expect(titulo).toHaveAttribute("tabindex", "-1");
  expect(
    screen.getByText(
      "Estos datos son privados. Compartilos solo para coordinar el trabajo en este proyecto.",
    ),
  ).toBeVisible();
  const lista = await screen.findByRole("list");
  const items = within(lista).getAllByRole("listitem");
  expect(items).toHaveLength(3);
  expect(within(items[0]).getByText("Email")).toBeVisible();
  expect(within(items[0]).getByText("ada@ejemplo.org")).toBeVisible();
  expect(within(items[1]).getByText("WhatsApp")).toBeVisible();
  expect(within(items[2]).getByText("TELEGRAM")).toBeVisible();
  expect(
    within(items[0]).getByRole("button", { name: "Copiar email" }),
  ).toHaveTextContent("Copiar");
  expect(within(items[1]).getByRole("button", { name: "Copiar WhatsApp" })).toBeVisible();
  expect(
    screen.getByRole("link", { name: "Volver a las postulaciones" }),
  ).toHaveAttribute("href", "/proyectos/p1/postulaciones");
  expect(document.title).toBe("Datos de contacto · Código a Voluntad");
});

test("el enlace de vuelta respeta el estado con el que se llegó", async () => {
  montar(cuenta, {
    volverA: "/proyectos/p1/postulaciones?estado=ACEPTADA",
    estadoDeVuelta: null,
    textoVolver: "Volver a las postulaciones",
  });
  expect(
    await screen.findByRole("link", { name: "Volver a las postulaciones" }),
  ).toHaveAttribute("href", "/proyectos/p1/postulaciones?estado=ACEPTADA");
});

test("«Copiar» deja el valor en el portapapeles y lo anuncia", async () => {
  const { user } = montar();
  await user.click(await screen.findByRole("button", { name: "Copiar email" }));
  expect(await screen.findByText("Copiaste el email")).toBeVisible();
  expect(await navigator.clipboard.readText()).toBe("ada@ejemplo.org");
  expect(screen.getByText("ada@ejemplo.org")).toBeVisible();
});

test("«Copiar» se opera con el teclado", async () => {
  const { user } = montar();
  await screen.findByRole("button", { name: "Copiar email" });
  await user.tab();
  expect(screen.getByRole("link", { name: "Volver a las postulaciones" })).toHaveFocus();
  await user.tab();
  expect(screen.getByRole("button", { name: "Copiar email" })).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(await screen.findByText("Copiaste el email")).toBeVisible();
});

test("si el navegador no deja copiar, avisa y el dato sigue visible", async () => {
  const { user } = montar();
  vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denegado"));
  await user.click(await screen.findByRole("button", { name: "Copiar email" }));
  expect(
    await screen.findByText("No pudimos copiar. Seleccioná el texto y copialo a mano."),
  ).toBeVisible();
  expect(screen.queryByText("Copiaste el email")).not.toBeInTheDocument();
  expect(screen.getByText("ada@ejemplo.org")).toBeVisible();
});

test("si el nombre falla, los medios se ven igual con el título genérico", async () => {
  falloDeNombre = 500;
  montar();
  expect(await screen.findByText("ada@ejemplo.org")).toBeVisible();
  expect(
    screen.getByRole("heading", { level: 1, name: "Datos de contacto" }),
  ).toBeVisible();
  expect(
    screen.queryByText("No pudimos mostrar los datos de contacto"),
  ).not.toBeInTheDocument();
});

test("una persona sin medios muestra el mensaje de mensajería interna", async () => {
  medios = [];
  montar();
  expect(
    await screen.findByText(
      "Esta persona no cargó medios de contacto; podés escribirle por mensajería interna",
    ),
  ).toBeVisible();
  expect(screen.queryByRole("button", { name: /Copiar/ })).not.toBeInTheDocument();
});

test.each([
  [403, "Estos datos se comparten solo cuando aceptás su postulación"],
  [404, "No encontramos a esta persona en el proyecto"],
])(
  "el %s muestra su mensaje, sin datos y con enlace de vuelta",
  async (status, mensaje) => {
    falloDeContacto = status;
    montar();
    expect(await screen.findByText(mensaje)).toBeVisible();
    expect(screen.queryByRole("button", { name: /Copiar/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reintentar" })).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/ada@ejemplo|detalle técnico|403|404/);
    expect(
      screen.getByRole("link", { name: "Volver a las postulaciones" }),
    ).toBeVisible();
  },
);

test("un error de red permite reintentar sin mostrar el error crudo", async () => {
  falloDeContacto = 500;
  const { user } = montar();
  expect(
    await screen.findByText(
      "Tuvimos un problema en el servidor. Probá de nuevo en unos minutos.",
    ),
  ).toBeVisible();
  expect(document.body).not.toHaveTextContent(/detalle técnico|500/);
  expect(screen.getByRole("link", { name: "Volver a las postulaciones" })).toBeVisible();
  falloDeContacto = null;
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(await screen.findByText("ada@ejemplo.org")).toBeVisible();
  await waitFor(() => expect(pedidosDeContacto()).toHaveLength(2));
});

test.each([
  [{ ...cuenta, rol: "COLECTIVO" }, "No tenés permiso para ver esta página", false],
  [{ ...cuenta, rol: "COLABORADORA" }, "Sin permiso", true],
  [null, "Ingresar", true],
])("una cuenta sin acceso no pide el contacto", async (usuario, titulo, esDueño) => {
  dueño = esDueño && usuario?.rol === "COLECTIVO";
  montar(usuario);
  expect(await screen.findByRole("heading", { name: titulo })).toBeVisible();
  expect(pedidosDeContacto()).toHaveLength(0);
  expect(
    transporte.mock.calls.filter(([config]) => config.url === URL_PERSONA),
  ).toHaveLength(0);
});
