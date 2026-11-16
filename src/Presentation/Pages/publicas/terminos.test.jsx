import { screen, within } from "@testing-library/react";
import axios from "axios";
import { Route } from "react-router-dom";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { MarcoDeLaApp } from "@/Presentation/Components/App/layout/MarcoDeLaApp.jsx";
import { montarRutas } from "@/test/montarRutas.jsx";
import { TerminosPage } from "./TerminosPage.jsx";

const adaptadorOriginal = axiosClient.defaults.adapter;
let transporte;
let respuestaDeTerminos;

const VIGENTES = {
  version: 2,
  texto: "# Uso de la plataforma\n\nTratá a las demás personas con **respeto**.",
  publicadoEn: "2026-11-16T15:00:00Z",
};

function respuesta(config, data, status = 200) {
  return { config, data, status, statusText: "", headers: {} };
}

function falla(config, status) {
  throw new axios.AxiosError(
    "Error",
    "ERR_BAD_RESPONSE",
    config,
    null,
    respuesta(config, { message: "crudo del back" }, status),
  );
}

beforeEach(() => {
  respuestaDeTerminos = { status: 200, data: VIGENTES };
  transporte = vi.fn(async (config) => {
    if (config.url === "/terminos") {
      const { status, data } = respuestaDeTerminos;
      return status === 200 ? respuesta(config, data) : falla(config, status);
    }
    return falla(config, 404);
  });
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptadorOriginal;
});

function montar() {
  return montarRutas(
    <Route element={<MarcoDeLaApp />}>
      <Route path="/terminos" element={<TerminosPage />} />
    </Route>,
    { ruta: "/terminos" },
  );
}

test("muestra el texto vigente con formato y su versión", async () => {
  montar();
  expect(
    screen.getByRole("heading", { level: 1, name: "Términos y condiciones" }),
  ).toBeInTheDocument();
  expect(
    await screen.findByText("Versión 2, publicada el 16 de noviembre de 2026"),
  ).toBeVisible();
  expect(
    await screen.findByRole("heading", { level: 2, name: "Uso de la plataforma" }),
  ).toBeVisible();
  expect((await screen.findByText("respeto")).tagName).toBe("STRONG");
  expect(document.title).toMatch(/^Términos y condiciones/);
});

test("mientras carga muestra un esqueleto y lo anuncia", async () => {
  transporte.mockImplementation(() => new Promise(() => {}));
  const { container } = montar();
  expect(container.querySelector("[aria-busy='true']")).not.toBeNull();
  expect(await screen.findByText("Cargando los términos…")).toBeInTheDocument();
});

test("sin términos publicados lo dice, sin mostrar un error", async () => {
  respuestaDeTerminos = { status: 404 };
  montar();
  expect(
    await screen.findByRole("heading", { name: "Todavía no hay términos publicados" }),
  ).toBeVisible();
  expect(screen.queryByRole("button", { name: "Reintentar" })).toBeNull();
});

test("si falla la carga ofrece reintentar y nunca muestra el error crudo", async () => {
  respuestaDeTerminos = { status: 500 };
  const { user } = montar();
  expect(
    await screen.findByRole("heading", { name: "No pudimos cargar los términos" }),
  ).toBeVisible();
  expect(screen.queryByText(/crudo del back/)).toBeNull();
  respuestaDeTerminos = { status: 200, data: VIGENTES };
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(await screen.findByText(/^Versión 2/)).toBeVisible();
});

test("el pie de página enlaza a los términos", async () => {
  montar();
  const pie = within(screen.getByRole("navigation", { name: "Información del sitio" }));
  expect(pie.getByRole("link", { name: "Términos y condiciones" })).toHaveAttribute(
    "href",
    "/terminos",
  );
});
