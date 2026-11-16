import { screen, within } from "@testing-library/react";
import axios from "axios";
import { Route } from "react-router-dom";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { montarRutas } from "@/test/montarRutas.jsx";
import { RutaDelDueno } from "@/Presentation/Routes/RutaDelDueno.jsx";
import { MarcoDeLaApp } from "@/Presentation/Components/App/layout/MarcoDeLaApp.jsx";
import { RutaProtegida } from "@/Presentation/Routes/RutaProtegida.jsx";
import AdministrarProyectoPage from "./AdministrarProyectoPage.jsx";

const react = { codigo: "react", titulo: "React", activo: true };
const css = { codigo: "css", titulo: "CSS", activo: true };
const dueno = { id: "cuenta", rol: "COLECTIVO", perfilId: "c1" };
const versionOriginal = "a".repeat(64);
const versionSiguiente = "b".repeat(64);
const original = axiosClient.defaults.adapter;
let proyecto;
let pertenece;
let fallaElGuardado;
let transporte;

beforeEach(() => {
  pertenece = true;
  fallaElGuardado = false;
  proyecto = {
    id: "p1",
    titulo: "Turnos del comedor",
    descripcion: "Una aplicación de turnos",
    estado: "ABIERTO",
    etiquetas: [],
    colaboraciones: [],
    perfiles: [
      {
        id: "pe1",
        versionEdicion: versionOriginal,
        descripcion: "Desarrollo de la interfaz",
        busquedaAbierta: true,
        compromiso: { cantidadHoras: 5, periodo: "HS_SEMANALES" },
        modalidadColaboracion: "GRATUITA",
        modoAceptacion: "REVISION_MANUAL",
        limiteColaboraciones: null,
        habilidadesRequeridas: [react],
        habilidadesOpcionales: [css],
      },
    ],
  };
  transporte = vi.fn(async (config) => {
    const { method, url } = config;
    const responder = (data) => ({
      config,
      status: 200,
      statusText: "OK",
      headers: {},
      data: structuredClone(data),
    });
    const perfil = proyecto.perfiles[0];
    if (url === "/colectivos/c1")
      return responder({ proyectos: pertenece ? [{ id: "p1" }] : [] });
    if (url === "/habilidades")
      return responder({ data: [react, css], meta: { total_pages: 1 } });
    if (url === "/proyectos/p1" && method === "get")
      return responder({ ...proyecto, colectivo: { id: pertenece ? "c1" : "otro" } });
    if (url === "/proyectos/p1" && method === "put") {
      if (proyecto.estado === "EN_REVISION")
        throw new axios.AxiosError("error", "ERR_BAD_REQUEST", config, null, {
          status: 409,
          data: { message: "crudo" },
        });
      Object.assign(proyecto, JSON.parse(config.data));
      return responder({ ...proyecto, colectivo: { id: pertenece ? "c1" : "otro" } });
    }
    if (url === "/proyectos/p1/publicacion" && method === "post") {
      proyecto.estado = "EN_REVISION";
      proyecto.publicacion = { ...proyecto.publicacion, rechazo: null };
      return responder({ ...proyecto, colectivo: { id: "c1" } });
    }
    if (url === "/proyectos/p1/finalizacion" && method === "post") {
      proyecto.estado = "FINALIZADO";
      return responder({ ...proyecto, colectivo: { id: pertenece ? "c1" : "otro" } });
    }
    if (method === "put" && /^\/proyectos\/p1\/perfiles\/pe[12]$/.test(url)) {
      const solicitado = proyecto.perfiles.find(({ id }) => url.endsWith(`/${id}`));
      const {
        versionEdicion,
        codigosHabilidadesRequeridas,
        codigosHabilidadesOpcionales,
        ...datos
      } = JSON.parse(config.data);
      if (
        fallaElGuardado ||
        (versionEdicion && versionEdicion !== solicitado.versionEdicion)
      ) {
        const status = fallaElGuardado ? 500 : 409;
        fallaElGuardado = false;
        throw new axios.AxiosError("error", "ERR_BAD_RESPONSE", config, null, {
          status,
          data: {},
        });
      }
      if (codigosHabilidadesRequeridas) {
        const catalogo = new Map([
          [react.codigo, react],
          [css.codigo, css],
        ]);
        solicitado.habilidadesRequeridas = codigosHabilidadesRequeridas.map((codigo) =>
          catalogo.get(codigo),
        );
        solicitado.habilidadesOpcionales = codigosHabilidadesOpcionales.map((codigo) =>
          catalogo.get(codigo),
        );
      }
      Object.assign(solicitado, datos, { versionEdicion: versionSiguiente });
      return responder(solicitado);
    }
    if (url === "/proyectos/p1/perfiles" && method === "post") {
      const datos = JSON.parse(config.data);
      const nuevo = { ...perfil, ...datos, id: "pe2" };
      proyecto.perfiles.push(nuevo);
      return responder(nuevo);
    }
    throw new Error(`Pedido inesperado: ${method} ${url}`);
  });
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = original;
});

function montar(cuenta = dueno) {
  return montarRutas(
    <Route element={<MarcoDeLaApp />}>
      <Route element={<RutaProtegida roles={["COLECTIVO"]} />}>
        <Route
          element={
            <RutaDelDueno sinPermiso="Solo el colectivo dueño puede administrar este proyecto." />
          }
        >
          <Route
            path="/proyectos/:id/administrar"
            element={<AdministrarProyectoPage />}
          />
        </Route>
      </Route>
      <Route path="/proyectos/:id" element={<h1>Detalle del proyecto</h1>} />
      <Route path="/sin-permiso" element={<h1>Sin permiso</h1>} />
      <Route path="/login" element={<h1>Ingresar</h1>} />
    </Route>,
    { ruta: "/proyectos/p1/administrar", cuenta },
  );
}

test("el dueño edita datos y solo se envían los campos modificados", async () => {
  const { user } = montar();
  await user.click(await screen.findByRole("button", { name: "Editar proyecto" }));
  const titulo = screen.getByLabelText(/Título/);
  await user.clear(titulo);
  await user.type(titulo, "Turnos del barrio");
  await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
  expect(await screen.findByText("Turnos del barrio")).toBeVisible();
  const [pedido] = transporte.mock.calls.find(([config]) => config.method === "put");
  expect(JSON.parse(pedido.data)).toEqual({ titulo: "Turnos del barrio" });
});

test("un perfil nuevo aparece en la administración y su búsqueda se puede cerrar y reabrir", async () => {
  const { user } = montar();
  await user.click(await screen.findByRole("button", { name: "Agregar perfil" }));
  await user.type(screen.getByLabelText(/Qué necesitan/), "Diseño de turnos");
  await user.type(screen.getByLabelText(/Cuántas horas/), "4");
  const requeridas = screen.getByRole("group", { name: /Habilidades requeridas/ });
  await user.click(await within(requeridas).findByRole("checkbox", { name: "React" }));
  await user.click(screen.getByRole("button", { name: "Guardar perfil" }));
  expect(await screen.findByText("Diseño de turnos")).toBeVisible();
  const perfil = screen.getByRole("heading", { name: "Perfil 2" }).closest("li");
  await user.click(within(perfil).getByRole("button", { name: "Cerrar búsqueda" }));
  await user.click(
    await within(perfil).findByRole("button", { name: "Reabrir búsqueda" }),
  );
  expect(
    await within(perfil).findByRole("button", { name: "Cerrar búsqueda" }),
  ).toBeVisible();
  expect(
    screen.queryByRole("button", { name: "Eliminar perfil" }),
  ).not.toBeInTheDocument();
});

test("intercambia las habilidades con un solo PUT y puede reintentar el mismo borrador", async () => {
  fallaElGuardado = true;
  const { user } = montar();
  await user.click(await screen.findByRole("button", { name: "Editar perfil" }));
  const requeridas = screen.getByRole("group", { name: /Habilidades requeridas/ });
  const opcionales = screen.getByRole("group", { name: /Habilidades opcionales/ });
  await user.click(
    within(opcionales).getByRole("button", { name: "Quitar habilidad CSS" }),
  );
  await user.click(await within(requeridas).findByRole("checkbox", { name: "CSS" }));
  await user.click(
    within(requeridas).getByRole("button", { name: "Quitar habilidad React" }),
  );
  await user.click(within(opcionales).getByRole("checkbox", { name: "React" }));
  const descripcion = screen.getByLabelText(/Qué necesitan/);
  await user.clear(descripcion);
  await user.type(descripcion, "Desarrollo y diseño");
  await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
  expect(await screen.findByText("No pudimos completar la acción")).toBeVisible();
  expect(descripcion).toHaveValue("Desarrollo y diseño");
  expect(proyecto.perfiles[0].habilidadesRequeridas).toEqual([react]);
  expect(proyecto.perfiles[0].habilidadesOpcionales).toEqual([css]);
  await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
  expect(await screen.findByRole("button", { name: "Editar perfil" })).toBeVisible();
  const mutaciones = transporte.mock.calls
    .map(([config]) => config)
    .filter(({ method }) => method !== "get");
  expect(mutaciones.map(({ method }) => method)).toEqual(["put", "put"]);
  expect(mutaciones[0].data).toBe(mutaciones[1].data);
  expect(JSON.parse(mutaciones[1].data)).toEqual({
    versionEdicion: versionOriginal,
    descripcion: "Desarrollo y diseño",
    codigosHabilidadesRequeridas: ["css"],
    codigosHabilidadesOpcionales: ["react"],
  });
  expect(proyecto.perfiles[0].habilidadesRequeridas).toEqual([css]);
  expect(proyecto.perfiles[0].habilidadesOpcionales).toEqual([react]);
});

test("si otra edición cambió el perfil, muestra el conflicto y conserva el borrador", async () => {
  proyecto.perfiles[0].habilidadesOpcionales = [];
  const { user } = montar();
  await user.click(await screen.findByRole("button", { name: "Editar perfil" }));
  const requeridas = screen.getByRole("group", { name: /Habilidades requeridas/ });
  const campoCss = await within(requeridas).findByRole("checkbox", { name: "CSS" });
  await user.click(campoCss);
  proyecto.perfiles[0].habilidadesOpcionales.push(css);
  proyecto.perfiles[0].versionEdicion = versionSiguiente;

  await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
  expect(await screen.findByText("El perfil cambió durante la edición")).toBeVisible();
  expect(campoCss).toBeChecked();
  expect(
    transporte.mock.calls.filter(([config]) => config.method === "put"),
  ).toHaveLength(1);
  expect(proyecto.perfiles[0].habilidadesRequeridas).toEqual([react]);
  expect(proyecto.perfiles[0].habilidadesOpcionales).toEqual([css]);
});

test("finalizar requiere confirmar y vuelve al detalle", async () => {
  const { user, router } = montar();
  await user.click(await screen.findByRole("button", { name: "Finalizar proyecto" }));
  const dialogo = screen.getByRole("dialog", { name: "¿Finalizar el proyecto?" });
  expect(within(dialogo).getByRole("button", { name: "Cancelar" })).toHaveFocus();
  expect(proyecto.estado).toBe("ABIERTO");
  await user.click(within(dialogo).getByRole("button", { name: "Finalizar proyecto" }));
  expect(
    await screen.findByRole("heading", { name: "Detalle del proyecto" }),
  ).toBeVisible();
  expect(router.state.location.pathname).toBe("/proyectos/p1");
  expect(proyecto.estado).toBe("FINALIZADO");
});

test.each([
  ["otro colectivo", dueno, "No tenés permiso para ver esta página"],
  ["una colaboradora", { ...dueno, rol: "COLABORADORA" }, "Sin permiso"],
  ["un visitante", null, "Ingresar"],
])("%s queda fuera de la administración", async (_rol, cuenta, encabezado) => {
  pertenece = false;
  montar(cuenta);
  expect(await screen.findByRole("heading", { name: encabezado })).toBeVisible();
  expect(
    screen.queryByRole("button", { name: "Editar proyecto" }),
  ).not.toBeInTheDocument();
  expect(transporte.mock.calls.some(([config]) => config.method !== "get")).toBe(false);
});

test("un proyecto finalizado conserva sus datos en modo de consulta", async () => {
  proyecto.estado = "FINALIZADO";
  montar();
  expect(await screen.findByText("Desarrollo de la interfaz")).toBeVisible();
  expect(
    screen.queryByRole("button", { name: "Editar proyecto" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Agregar perfil" }),
  ).not.toBeInTheDocument();
});

test("cada perfil abierto ofrece Buscar colaboradoras", async () => {
  montar();
  expect(
    await screen.findByRole("link", { name: "Buscar colaboradoras" }),
  ).toHaveAttribute("href", "/proyectos/p1/perfiles/pe1/colaboradoras");
});

test("al cerrar la búsqueda, Buscar colaboradoras queda deshabilitado con el motivo", async () => {
  const { user } = montar();
  await user.click(await screen.findByRole("button", { name: "Cerrar búsqueda" }));
  const boton = await screen.findByRole("button", { name: "Buscar colaboradoras" });
  expect(boton).toBeDisabled();
  expect(boton).toHaveAccessibleDescription("La búsqueda de este perfil está cerrada.");
});

test("en un proyecto finalizado no se ofrece Buscar colaboradoras", async () => {
  proyecto.estado = "FINALIZADO";
  montar();
  expect(await screen.findByText(/Este proyecto está finalizado/)).toBeVisible();
  expect(screen.queryByText("Buscar colaboradoras")).not.toBeInTheDocument();
});

describe("borradores", () => {
  const rechazo = {
    nota: "Sumen la fecha de inicio.",
    fecha: "2026-11-12T15:00:00.000Z",
  };

  test("un borrador se edita, sin postulaciones, búsqueda de personas ni finalizar", async () => {
    proyecto.estado = "BORRADOR";
    proyecto.publicacion = null;
    montar();
    const aviso = await screen.findByRole("region", { name: "Borrador" });
    expect(aviso).toHaveTextContent(
      "Lo ven solo tu colectivo y administración. Cuando esté listo, pedí su publicación.",
    );
    expect(screen.getByRole("button", { name: "Editar proyecto" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Editar perfil" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Agregar perfil" })).toBeEnabled();
    expect(screen.getByText("Se abre al publicar")).toBeInTheDocument();
    expect(screen.queryByText(/^Abierta/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Ver postulaciones" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Buscar colaboradoras/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Buscar colaboradoras/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Finalizar proyecto" }),
    ).not.toBeInTheDocument();
  });

  test("un borrador con cambios pedidos muestra primero la nota y pide la publicación de nuevo", async () => {
    proyecto.estado = "BORRADOR";
    proyecto.publicacion = { solicitadaEn: "2026-11-10T12:00:00.000Z", rechazo };
    const { user } = montar();
    const aviso = await screen.findByRole("region", { name: "Con cambios pedidos" });
    expect(aviso).toHaveTextContent(
      /Qué pidió administración el 12 de noviembre de 2026\s*Sumen la fecha de inicio\.\s*Cuando hagas los cambios, volvé a pedir la publicación\./,
    );
    expect(screen.getByRole("button", { name: "Editar proyecto" })).toHaveClass(
      /primario/,
    );
    expect(
      within(aviso).getByRole("button", {
        name: "Pedir publicación de Turnos del comedor",
      }),
    ).not.toHaveClass(/primario/);
    await user.click(
      within(aviso).getByRole("button", {
        name: "Pedir publicación de Turnos del comedor",
      }),
    );
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Pedir publicación",
      }),
    );
    const enRevision = await screen.findByRole("region", { name: "En revisión" });
    expect(
      within(enRevision).getByRole("heading", { name: "En revisión" }),
    ).toHaveFocus();
    expect(enRevision).not.toHaveTextContent(/pidió cambios/);
    expect(
      screen.queryByRole("button", { name: "Editar proyecto" }),
    ).not.toBeInTheDocument();
  });

  test("un proyecto en revisión se consulta pero no se edita", async () => {
    proyecto.estado = "EN_REVISION";
    proyecto.publicacion = { solicitadaEn: "2026-11-10T12:00:00.000Z", rechazo: null };
    montar();
    const aviso = await screen.findByRole("region", { name: "En revisión" });
    expect(aviso).toHaveTextContent(
      "Pediste la publicación el 10 de noviembre de 2026. Hasta que administración la apruebe o pida cambios, no se puede editar.",
    );
    expect(screen.getByText("Una aplicación de turnos")).toBeInTheDocument();
    expect(screen.getByText("Desarrollo de la interfaz")).toBeInTheDocument();
    for (const nombre of [
      "Editar proyecto",
      "Editar perfil",
      "Agregar perfil",
      "Cerrar búsqueda",
    ])
      expect(screen.queryByRole("button", { name: nombre })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Pedir publicación/ }),
    ).not.toBeInTheDocument();
  });

  test("si otra persona pidió la publicación mientras editaba, lo explica y deja de editar", async () => {
    proyecto.estado = "BORRADOR";
    proyecto.publicacion = null;
    const { user } = montar();
    await user.click(await screen.findByRole("button", { name: "Editar proyecto" }));
    proyecto.estado = "EN_REVISION";
    const titulo = screen.getByLabelText(/^Título/);
    await user.clear(titulo);
    await user.type(titulo, "Turnos nuevos");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(
      await screen.findByText(
        "Mientras editabas, se pidió su publicación. Hasta que administración la apruebe o pida cambios, no se puede editar.",
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("region", { name: "En revisión" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Título/)).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("crudo");
  });
});
