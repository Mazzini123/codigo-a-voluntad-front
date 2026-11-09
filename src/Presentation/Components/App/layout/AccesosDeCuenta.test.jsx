import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Proveedores } from "@/test/Proveedores.jsx";
import { crearSesionFalsa } from "@/Presentation/Dependencies/identidadDependencies.js";
import { tomarVolverA } from "@/Presentation/Dependencies/identidadDependencies.js";
import { Cabecera } from "./Cabecera.jsx";

beforeEach(() => sessionStorage.clear());

function montar({
  cuenta,
  sesion = crearSesionFalsa(),
  ruta = "/proyectos?etiqueta=web#resultados",
} = {}) {
  render(
    <Proveedores cuenta={cuenta} sesion={sesion} ruta={ruta}>
      <Cabecera />
    </Proveedores>,
  );
  return { sesion, user: userEvent.setup() };
}

test.each([
  ["Ingresar", false],
  ["Crear una cuenta", true],
])(
  "%s abre directamente la pantalla correspondiente y conserva el origen",
  async (nombre, registro) => {
    const { user, sesion } = montar();
    await user.click(await screen.findByRole("button", { name: nombre }));
    expect(sesion.inicios).toEqual([{ registro }]);
    expect(tomarVolverA()).toBe("/proyectos?etiqueta=web#resultados");
    expect(screen.getByRole("button", { name: "Abriendo…" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getAllByRole("button").every((boton) => boton.disabled)).toBe(true);
  },
);

test("evita solicitudes duplicadas mientras abre el ingreso", async () => {
  const sesion = crearSesionFalsa();
  let terminar;
  const iniciar = vi.spyOn(sesion, "iniciar").mockImplementation(
    () =>
      new Promise((resolve) => {
        terminar = resolve;
      }),
  );
  const { user } = montar({ sesion });
  await user.dblClick(await screen.findByRole("button", { name: "Ingresar" }));
  await user.click(screen.getByRole("button", { name: "Crear una cuenta" }));
  expect(iniciar).toHaveBeenCalledTimes(1);
  await act(async () => terminar());
});

test("un error avisa sin exponer detalles y permite reintentar", async () => {
  const sesion = crearSesionFalsa();
  const iniciar = vi
    .spyOn(sesion, "iniciar")
    .mockRejectedValueOnce(new Error("detalle interno"));
  const { user } = montar({ sesion });
  await user.click(await screen.findByRole("button", { name: "Crear una cuenta" }));
  expect(
    await screen.findByText("No pudimos abrir la pantalla de ingreso. Probá de nuevo."),
  ).toBeVisible();
  expect(screen.queryByText("detalle interno")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Ingresar" })).toBeEnabled();
  await user.click(screen.getByRole("button", { name: "Crear una cuenta" }));
  expect(iniciar).toHaveBeenCalledTimes(2);
});

test.each(["/login", "/registro"])(
  "en %s la cabecera conserva ambos accesos",
  async (ruta) => {
    montar({ ruta });
    const cabecera = within(screen.getByRole("banner"));
    expect(await cabecera.findByRole("link", { name: "Ingresar" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(cabecera.getByRole("link", { name: "Crear una cuenta" })).toHaveAttribute(
      "href",
      "/registro",
    );
  },
);

test("con sesión se conserva Mi cuenta y se ocultan los accesos", async () => {
  montar({
    cuenta: { id: "1", rol: null, perfilId: null },
    sesion: crearSesionFalsa({ autenticado: true }),
  });
  expect(await screen.findByRole("button", { name: "Mi cuenta" })).toBeVisible();
  expect(screen.queryByRole("button", { name: "Ingresar" })).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Crear una cuenta" }),
  ).not.toBeInTheDocument();
});
