import { screen, waitFor, within } from "@testing-library/react";
import { Route } from "react-router-dom";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { montarRutas } from "@/test/montarRutas.jsx";
import { MarcoDeLaApp } from "@/Presentation/Components/App/layout/MarcoDeLaApp.jsx";
import { RutaProtegida } from "@/Presentation/Routes/RutaProtegida.jsx";
import { BienvenidaPage } from "@/Presentation/Pages/ingreso/BienvenidaPage.jsx";
import { NombrePage } from "@/Presentation/Pages/ingreso/NombrePage.jsx";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";

const adaptadorOriginal = axiosClient.defaults.adapter;

afterEach(() => {
  axiosClient.defaults.adapter = adaptadorOriginal;
  vi.restoreAllMocks();
});

const CONTEXTO_COLECTIVO = {
  id: "ctx-colectivo",
  tipo: "COLECTIVO",
  rol: "LIDER",
  colectivo: { id: "c1", nombre: "Fundación Huerta" },
  colaborador: null,
  permisos: [],
};

function cuenta(cambios = {}) {
  return {
    id: "sub-1",
    rol: "COLECTIVO",
    perfilId: "c1",
    usuarioId: "u1",
    nombre: "Ana",
    nombrePendiente: false,
    contextoActual: CONTEXTO_COLECTIVO,
    contextos: [CONTEXTO_COLECTIVO],
    ...cambios,
  };
}

function SalirDePrueba() {
  const { cerrarSesion, usuario } = useAuth();
  return (
    <button type="button" onClick={cerrarSesion}>
      Salir {usuario?.nombre}
    </button>
  );
}

const rutas = (
  <Route element={<MarcoDeLaApp />}>
    <Route path="/" element={<SalirDePrueba />} />
    <Route element={<RutaProtegida permitirSinPerfil permitirSinNombre />}>
      <Route path="/cuenta/nombre" element={<NombrePage />} />
    </Route>
    <Route element={<RutaProtegida permitirSinPerfil />}>
      <Route path="/bienvenida" element={<BienvenidaPage />} />
    </Route>
    <Route element={<RutaProtegida roles={["COLECTIVO"]} />}>
      <Route path="/colectivo/resumen" element={<h1>Resumen del colectivo</h1>} />
    </Route>
  </Route>
);

function dependenciasCon(estado, extra = {}) {
  return {
    obtenerCuentaActual: vi.fn(async () => estado.cuenta),
    registrarUsuario: vi.fn(async () => ({ creado: true })),
    cambiarNombreDeUsuario: vi.fn(async (nombre) => {
      estado.cuenta = { ...estado.cuenta, nombre, nombrePendiente: false };
      return { nombre };
    }),
    seleccionarContexto: vi.fn(async (contextoId) => {
      const elegido = estado.cuenta.contextos.find((c) => c.id === contextoId);
      estado.cuenta = { ...estado.cuenta, contextoActual: elegido, rol: "COLECTIVO" };
    }),
    limpiarContexto: vi.fn(async () => null),
    ...extra,
  };
}

test("registra al usuario cuando el back todavía no lo conoce", async () => {
  const estado = { cuenta: cuenta() };
  const dependencies = dependenciasCon(estado);
  dependencies.obtenerCuentaActual.mockRejectedValueOnce(
    Object.assign(new Error("no"), { codigo: "USUARIO_NO_REGISTRADO" }),
  );

  montarRutas(rutas, { ruta: "/colectivo/resumen", cuenta: estado.cuenta, dependencies });

  expect(
    await screen.findByRole("heading", { name: "Resumen del colectivo" }),
  ).toBeInTheDocument();
  expect(dependencies.registrarUsuario).toHaveBeenCalledTimes(1);
  expect(dependencies.obtenerCuentaActual).toHaveBeenCalledTimes(2);
});

test("pide el nombre antes de una ruta protegida y después vuelve a donde iba", async () => {
  const estado = { cuenta: cuenta({ nombre: null, nombrePendiente: true }) };
  const dependencies = dependenciasCon(estado);
  const { user } = montarRutas(rutas, {
    ruta: "/colectivo/resumen",
    cuenta: estado.cuenta,
    dependencies,
  });

  expect(
    await screen.findByRole("heading", { name: "¿Cómo te llamás?" }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Continuar" }));
  expect(await screen.findByText("Escribí tu nombre.")).toBeInTheDocument();
  expect(dependencies.cambiarNombreDeUsuario).not.toHaveBeenCalled();

  await user.type(screen.getByLabelText(/^Nombre/), "Ana Diaz");
  await user.click(screen.getByRole("button", { name: "Continuar" }));

  expect(
    await screen.findByRole("heading", { name: "Resumen del colectivo" }),
  ).toBeInTheDocument();
  expect(dependencies.cambiarNombreDeUsuario).toHaveBeenCalledWith("Ana Diaz");
});

test("en Bienvenida elige uno de sus contextos y va a su inicio", async () => {
  const estado = { cuenta: cuenta({ rol: null, perfilId: null, contextoActual: null }) };
  const dependencies = dependenciasCon(estado);
  const { user } = montarRutas(rutas, {
    ruta: "/bienvenida",
    cuenta: estado.cuenta,
    dependencies,
  });

  expect(
    await screen.findByRole("heading", { name: "Seguí donde estabas" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Soy un colectivo/ })).toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: /Soy colaboradora/ }),
  ).not.toBeInTheDocument();

  const seccion = screen.getByRole("region", { name: "Seguí donde estabas" });
  await user.click(within(seccion).getByRole("button", { name: /Fundación Huerta/ }));

  expect(
    await screen.findByRole("heading", { name: "Resumen del colectivo" }),
  ).toBeInTheDocument();
  expect(dependencies.seleccionarContexto).toHaveBeenCalledWith("ctx-colectivo");
});

test("cerrar sesión intenta limpiar el contexto y cierra aunque el back no responda", async () => {
  const estado = { cuenta: cuenta() };
  const dependencies = dependenciasCon(estado, {
    limpiarContexto: vi.fn(async () => {
      throw new Error("sin conexión");
    }),
  });
  const { user, sesion } = montarRutas(rutas, {
    ruta: "/",
    cuenta: estado.cuenta,
    dependencies,
  });

  await user.click(await screen.findByRole("button", { name: "Salir Ana" }));

  await waitFor(() => expect(sesion.salidas).toBe(1));
  expect(dependencies.limpiarContexto).toHaveBeenCalledTimes(1);
});

test("manda el contexto actual y recarga la cuenta si quedó desactualizado", async () => {
  const estado = { cuenta: cuenta() };
  const dependencies = dependenciasCon(estado);
  const pedidos = [];
  axiosClient.defaults.adapter = vi.fn(async (config) => {
    pedidos.push(config);
    const respuesta = {
      config,
      status: 409,
      statusText: "",
      headers: {},
      data: { codigo: "CONTEXTO_NO_ACTUAL" },
    };
    const { AxiosError } = await import("axios");
    throw new AxiosError("Conflicto", "ERR_BAD_REQUEST", config, null, respuesta);
  });
  montarRutas(rutas, { ruta: "/", cuenta: estado.cuenta, dependencies });
  await screen.findByRole("button", { name: "Salir Ana" });

  await expect(axiosClient.post("/colectivos/c1/proyectos", {})).rejects.toMatchObject({
    codigo: "CONTEXTO_NO_ACTUAL",
  });

  expect(pedidos[0].headers["X-Context-Id"]).toBe("ctx-colectivo");
  expect(await screen.findByText(/Tu sesión cambió en otra ventana/)).toBeInTheDocument();
  await waitFor(() => expect(dependencies.obtenerCuentaActual).toHaveBeenCalledTimes(2));
});
