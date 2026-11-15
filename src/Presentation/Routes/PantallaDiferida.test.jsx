import { act, screen, waitFor } from "@testing-library/react";
import { Link, Outlet, Route } from "react-router-dom";
import { montarRutas } from "@/test/montarRutas.jsx";
import { MarcoDeLaApp } from "@/Presentation/Components/App/layout/MarcoDeLaApp.jsx";
import { RutaProtegida } from "./RutaProtegida.jsx";
import { PantallaDiferida } from "./PantallaDiferida.jsx";

const COLECTIVO = { id: "c", rol: "COLECTIVO", perfilId: "cl1" };

function montar(cargar, { ruta = "/proyectos", cuenta = COLECTIVO } = {}) {
  return montarRutas(
    <Route element={<MarcoDeLaApp />}>
      <Route
        path="/proyectos"
        element={
          <>
            <h1 tabIndex={-1}>Listado</h1>
            <Link to="/colectivo/nuevo">Crear</Link>
          </>
        }
      />
      <Route path="/login" element={<h1>Ingresar</h1>} />
      <Route path="/sin-permiso" element={<h1>Sin permiso</h1>} />
      <Route element={<RutaProtegida roles={["COLECTIVO"]} />}>
        <Route path="/colectivo/nuevo" element={<PantallaDiferida cargar={cargar} />} />
      </Route>
    </Route>,
    { ruta, cuenta },
  );
}

function Pagina() {
  return <h1 tabIndex={-1}>Nuevo proyecto</h1>;
}

test("el listado no carga la pantalla privada y al navegar anuncia espera y enfoca el título", async () => {
  let resolver;
  const cargar = vi.fn(
    () =>
      new Promise((resolve) => {
        resolver = resolve;
      }),
  );
  const { user } = montar(cargar);
  await screen.findByText("Listado");
  expect(cargar).not.toHaveBeenCalled();
  await user.click(screen.getByRole("link", { name: "Crear" }));
  expect(await screen.findByText("Cargando pantalla…")).toBeInTheDocument();
  await act(async () => resolver({ default: Pagina }));
  await waitFor(() =>
    expect(screen.getByRole("heading", { name: "Nuevo proyecto" })).toHaveFocus(),
  );
});

test("una descarga fallida permite reintentar sin perder la ruta", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const cargar = vi
    .fn()
    .mockRejectedValueOnce(new Error("descarga"))
    .mockResolvedValueOnce({ default: Pagina });
  const { user, router } = montar(cargar, { ruta: "/colectivo/nuevo" });
  expect(
    await screen.findByRole("heading", { name: "No pudimos abrir la pantalla" }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(
    await screen.findByRole("heading", { name: "Nuevo proyecto" }),
  ).toBeInTheDocument();
  expect(router.state.location.pathname).toBe("/colectivo/nuevo");
  expect(cargar).toHaveBeenCalledTimes(2);
});

test("la entrada directa autorizada carga la pantalla", async () => {
  const cargar = vi.fn().mockResolvedValue({ default: Pagina });
  montar(cargar, { ruta: "/colectivo/nuevo" });
  expect(
    await screen.findByRole("heading", { name: "Nuevo proyecto" }),
  ).toBeInTheDocument();
  expect(cargar).toHaveBeenCalledTimes(1);
});

test.each([null, { id: "a", rol: "COLABORADORA", perfilId: "a1" }])(
  "una entrada sin permiso no descarga la pantalla: %s",
  async (cuenta) => {
    const cargar = vi.fn();
    const { router } = montar(cargar, { ruta: "/colectivo/nuevo?paso=2", cuenta });
    await screen.findByRole("heading", { name: cuenta ? "Sin permiso" : "Ingresar" });
    expect(cargar).not.toHaveBeenCalled();
    if (!cuenta)
      expect(router.state.location.state.desde).toMatchObject({
        pathname: "/colectivo/nuevo",
        search: "?paso=2",
      });
  },
);

test("al pasar a otra pantalla diferida en el mismo lugar de la ruta se muestra la nueva", async () => {
  const PaginaA = () => <h1 tabIndex={-1}>Pantalla A</h1>;
  const PaginaB = () => <h1 tabIndex={-1}>Pantalla B</h1>;
  const cargarA = vi.fn().mockResolvedValue({ default: PaginaA });
  const cargarB = vi.fn().mockResolvedValue({ default: PaginaB });
  const { user } = montarRutas(
    <Route element={<RutaProtegida roles={["COLECTIVO"]} />}>
      <Route
        element={
          <>
            <Outlet />
            <Link to="/b">Ir a B</Link>
          </>
        }
      >
        <Route path="/a" element={<PantallaDiferida cargar={cargarA} />} />
        <Route path="/b" element={<PantallaDiferida cargar={cargarB} />} />
      </Route>
    </Route>,
    { ruta: "/a", cuenta: COLECTIVO },
  );
  expect(await screen.findByRole("heading", { name: "Pantalla A" })).toBeInTheDocument();
  await user.click(screen.getByRole("link", { name: "Ir a B" }));
  expect(await screen.findByRole("heading", { name: "Pantalla B" })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Pantalla A" })).not.toBeInTheDocument();
});
