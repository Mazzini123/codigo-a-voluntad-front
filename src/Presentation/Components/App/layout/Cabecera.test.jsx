import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Proveedores } from "@/test/Proveedores.jsx";
import { Cabecera } from "./Cabecera.jsx";

const COLABORADORA = { id: "cuenta-2", rol: "COLABORADORA", perfilId: "co1" };
const COLECTIVO = { id: "cuenta-1", rol: "COLECTIVO", perfilId: "cl1" };
const SIN_PERFIL = { id: "cuenta-3", rol: null, perfilId: null };

function montar(cuenta) {
  render(
    <Proveedores cuenta={cuenta}>
      <Cabecera />
    </Proveedores>,
  );
  return userEvent.setup();
}

describe("navegación principal por rol", () => {
  test.each([
    ["un visitante", null, ["Proyectos"]],
    ["una colaboradora", COLABORADORA, ["Proyectos"]],
    ["un colectivo", COLECTIVO, ["Proyectos", "Panel del colectivo"]],
    ["una cuenta sin perfil", SIN_PERFIL, ["Proyectos"]],
  ])(
    "%s ve los enlaces que le corresponden y no ve Habilidades",
    async (_nombre, cuenta, esperados) => {
      montar(cuenta);
      if (cuenta) await screen.findByRole("button", { name: "Mi cuenta" });
      else await screen.findByRole("button", { name: "Ingresar" });
      const navegacion = screen.getByRole("navigation", { name: "Principal" });
      const textos = within(navegacion)
        .getAllByRole("link")
        .map((enlace) => enlace.textContent);
      expect(textos).toEqual(esperados);
      if (esperados.length === 1)
        expect(screen.queryByRole("button", { name: "Menú" })).not.toBeInTheDocument();
      expect(screen.queryByText("Habilidades")).not.toBeInTheDocument();
    },
  );
});

describe("menú de cuenta", () => {
  test.each([
    ["una colaboradora", COLABORADORA, "Mi perfil", "/colaboradora/perfil"],
    ["un colectivo", COLECTIVO, "Mi colectivo", "/colectivo"],
  ])("%s tiene su perfil y Cerrar sesión en el menú", async (_n, cuenta, texto, ruta) => {
    const user = montar(cuenta);
    await user.click(await screen.findByRole("button", { name: "Mi cuenta" }));
    const enlace = screen.getByRole("link", { name: texto });
    expect(enlace.getAttribute("href")).toContain(ruta);
    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument();
  });
});

describe("cerrar sesión", () => {
  async function abrirConfirmacion(user) {
    await user.click(await screen.findByRole("button", { name: "Mi cuenta" }));
    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    return screen.getByRole("dialog", { name: "¿Cerrar sesión?" });
  }

  test("Cancelar devuelve el foco a Mi cuenta", async () => {
    const user = montar(COLECTIVO);
    const dialogo = await abrirConfirmacion(user);
    await user.click(within(dialogo).getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mi cuenta" })).toHaveFocus();
  });

  test("Esc devuelve el foco a Mi cuenta", async () => {
    const user = montar(COLABORADORA);
    await abrirConfirmacion(user);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mi cuenta" })).toHaveFocus();
  });
});

describe("menú de navegación en celular", () => {
  test("se cierra al tocar afuera y al tocar la marca", async () => {
    const user = montar(COLECTIVO);
    await screen.findByRole("button", { name: "Mi cuenta" });
    const boton = screen.getByRole("button", { name: "Menú" });
    await user.click(boton);
    expect(boton).toHaveAttribute("aria-expanded", "true");
    await user.click(document.body);
    expect(boton).toHaveAttribute("aria-expanded", "false");
    await user.click(boton);
    await user.click(screen.getAllByRole("link", { name: /Código a Voluntad/ })[0]);
    expect(boton).toHaveAttribute("aria-expanded", "false");
  });
});
