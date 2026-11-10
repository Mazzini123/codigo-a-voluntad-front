import { screen, within } from "@testing-library/react";
import axios from "axios";
import { Route } from "react-router-dom";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { montarRutas } from "@/test/montarRutas.jsx";
import { RutaProtegida } from "@/Presentation/Routes/RutaProtegida.jsx";
import { PERMISO } from "@/Application/Domain/Enums/PERMISO.js";
import MiembrosPage from "./MiembrosPage.jsx";
import SolicitudesDeIngresoPage from "./SolicitudesDeIngresoPage.jsx";

const PERMISOS_DE_LIDER = [
  PERMISO.COLECTIVO_MIEMBROS_VER,
  PERMISO.MEMBRESIA_SOLICITUD_RESOLVER,
  PERMISO.MIEMBRO_ELIMINAR,
  PERMISO.LIDER_ASIGNAR,
];
const adaptador = axiosClient.defaults.adapter;
let miembros;
let solicitudes;
let transporte;
let falloPorRuta;

function cuentaCon(rol, permisos) {
  return {
    id: "1",
    rol: "COLECTIVO",
    perfilId: "c1",
    contextoActual: { id: "yo", tipo: "COLECTIVO", rol, permisos },
    contextos: [],
  };
}

beforeEach(() => {
  miembros = [
    { contextoId: "yo", nombre: "Lía", rol: "LIDER" },
    { contextoId: "m2", nombre: "Ada", rol: "MIEMBRO" },
  ];
  solicitudes = [
    { id: "s1", estado: "PENDIENTE", usuario: { id: "u9", nombre: "Grace" } },
  ];
  falloPorRuta = {};
  transporte = vi.fn(async (config) => {
    const { url, method } = config;
    const responder = (data, status = 200) => ({
      config,
      status,
      statusText: "OK",
      headers: {},
      data: structuredClone(data),
    });
    const falla = falloPorRuta[`${method} ${url}`];
    if (falla) {
      throw new axios.AxiosError("error", "ERR_BAD_RESPONSE", config, null, {
        status: falla.status,
        data: { codigo: falla.codigo },
      });
    }
    if (method === "get" && url === "/colectivos/c1/miembros") return responder(miembros);
    if (method === "delete" && url === "/colectivos/c1/miembros/m2") {
      miembros = miembros.filter((m) => m.contextoId !== "m2");
      return responder(null, 204);
    }
    if (method === "post" && url === "/colectivos/c1/lider") {
      miembros = miembros.map((m) => ({
        ...m,
        rol: m.contextoId === "m2" ? "LIDER" : "MIEMBRO",
      }));
      return responder({});
    }
    if (method === "get" && url === "/colectivos/c1/solicitudes-ingreso") {
      const estado = config.params?.estado;
      return responder(solicitudes.filter((s) => !estado || s.estado === estado));
    }
    if (method === "post" && url.startsWith("/colectivos/c1/solicitudes-ingreso/s1/")) {
      solicitudes[0].estado = url.endsWith("aceptacion") ? "ACEPTADA" : "RECHAZADA";
      return responder(solicitudes[0]);
    }
    throw new Error(`Pedido inesperado: ${method} ${url}`);
  });
  axiosClient.defaults.adapter = transporte;
});

afterEach(() => {
  axiosClient.defaults.adapter = adaptador;
});

function montar(ruta, cuenta) {
  return montarRutas(
    <>
      <Route element={<RutaProtegida roles={["COLECTIVO"]} />}>
        <Route path="/colectivo/miembros" element={<MiembrosPage />} />
        <Route path="/colectivo/solicitudes" element={<SolicitudesDeIngresoPage />} />
      </Route>
      <Route path="/bienvenida" element={<h1>Bienvenida</h1>} />
    </>,
    { ruta, cuenta },
  );
}

test("el liderazgo ve a los miembros y puede quitar a alguien con confirmación", async () => {
  const { user } = montar("/colectivo/miembros", cuentaCon("LIDER", PERMISOS_DE_LIDER));
  const lista = await screen.findByRole("list", { name: "Miembros del colectivo" });
  expect(within(lista).getByText("Lía (vos)")).toBeVisible();
  expect(within(lista).getByText("Liderazgo")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Quitar a Ada del colectivo" }));
  const dialogo = screen.getByRole("dialog", { name: "¿Quitar a Ada del colectivo?" });
  await user.click(within(dialogo).getByRole("button", { name: "Quitar del colectivo" }));
  expect(await screen.findByText("Quitaste a la persona del colectivo.")).toBeVisible();
  expect(screen.queryByText("Ada")).not.toBeInTheDocument();
});

test("un miembro sin liderazgo solo ve la lista", async () => {
  montar("/colectivo/miembros", cuentaCon("MIEMBRO", [PERMISO.COLECTIVO_MIEMBROS_VER]));
  expect(await screen.findByText("Ada")).toBeVisible();
  expect(screen.queryByRole("button", { name: /Quitar a/ })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /liderazgo/ })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Salir del colectivo" })).toBeVisible();
});

test("si el liderazgo intenta salir sin pasarlo, explica qué hacer", async () => {
  falloPorRuta["post /colectivos/c1/abandono"] = {
    status: 409,
    codigo: "LIDER_DEBE_TRANSFERIR",
  };
  const { user } = montar("/colectivo/miembros", cuentaCon("LIDER", PERMISOS_DE_LIDER));
  await screen.findByText("Ada");
  await user.click(screen.getByRole("button", { name: "Salir del colectivo" }));
  const dialogo = screen.getByRole("dialog", { name: "¿Salir del colectivo?" });
  await user.click(within(dialogo).getByRole("button", { name: "Salir del colectivo" }));
  expect(
    await within(dialogo).findByText(
      "Antes de irte, pasale el liderazgo a otra persona del colectivo.",
    ),
  ).toBeVisible();
});

test("pasar el liderazgo pide confirmación y recarga la cuenta", async () => {
  const { user } = montar("/colectivo/miembros", cuentaCon("LIDER", PERMISOS_DE_LIDER));
  await user.click(
    await screen.findByRole("button", { name: "Pasarle el liderazgo a Ada" }),
  );
  const dialogo = screen.getByRole("dialog", { name: "¿Pasarle el liderazgo a Ada?" });
  await user.click(within(dialogo).getByRole("button", { name: "Pasar el liderazgo" }));
  expect(await screen.findByText("Pasaste el liderazgo.")).toBeVisible();
  const pedido = transporte.mock.calls.find(([c]) => c.url === "/colectivos/c1/lider");
  expect(JSON.parse(pedido[0].data)).toEqual({ contextoId: "m2" });
});

test("las solicitudes arrancan en pendientes y se aceptan con confirmación", async () => {
  const { user } = montar(
    "/colectivo/solicitudes",
    cuentaCon("LIDER", PERMISOS_DE_LIDER),
  );
  expect(await screen.findByText("Grace")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Aceptar a Grace" }));
  const dialogo = screen.getByRole("dialog", { name: "¿Sumar a Grace al colectivo?" });
  await user.click(within(dialogo).getByRole("button", { name: "Aceptar" }));
  expect(await screen.findByText("Aceptaste la solicitud.")).toBeVisible();
  expect(await screen.findByText("No hay solicitudes pendientes")).toBeVisible();
});

test("una solicitud ya resuelta muestra un mensaje claro", async () => {
  falloPorRuta["post /colectivos/c1/solicitudes-ingreso/s1/rechazo"] = {
    status: 409,
    codigo: "SOLICITUD_YA_RESUELTA",
  };
  const { user } = montar(
    "/colectivo/solicitudes",
    cuentaCon("LIDER", PERMISOS_DE_LIDER),
  );
  await user.click(await screen.findByRole("button", { name: "Rechazar a Grace" }));
  const dialogo = screen.getByRole("dialog", {
    name: "¿Rechazar la solicitud de Grace?",
  });
  await user.click(within(dialogo).getByRole("button", { name: "Rechazar" }));
  expect(await screen.findByText("Esa solicitud ya había sido resuelta.")).toBeVisible();
});

test("un miembro puede consultar solicitudes con el contexto actual y el permiso de lectura", async () => {
  montar(
    "/colectivo/solicitudes",
    cuentaCon("MIEMBRO", [PERMISO.COLECTIVO_MIEMBROS_VER]),
  );
  expect(await screen.findByText("Grace")).toBeVisible();
  expect(
    screen.queryByRole("button", { name: "Aceptar a Grace" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Rechazar a Grace" }),
  ).not.toBeInTheDocument();
  expect(transporte).toHaveBeenCalledWith(
    expect.objectContaining({
      method: "get",
      url: "/colectivos/c1/solicitudes-ingreso",
      headers: expect.objectContaining({ "X-Context-Id": "yo" }),
    }),
  );
});

test("sin permiso de lectura, la pantalla de solicitudes no consulta al back", async () => {
  montar("/colectivo/solicitudes", cuentaCon("MIEMBRO", []));
  expect(
    await screen.findByText(
      "Necesitás permiso para consultar las solicitudes de este colectivo.",
    ),
  ).toBeVisible();
  expect(transporte).not.toHaveBeenCalled();
});

test("el error al listar ofrece reintentar", async () => {
  falloPorRuta["get /colectivos/c1/miembros"] = { status: 500 };
  const { user } = montar("/colectivo/miembros", cuentaCon("LIDER", PERMISOS_DE_LIDER));
  const reintentar = await screen.findByRole("button", { name: /Reintentar/ });
  delete falloPorRuta["get /colectivos/c1/miembros"];
  await user.click(reintentar);
  expect(await screen.findByText("Ada")).toBeVisible();
});
