import { useEffect, useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { Proveedores } from "@/test/Proveedores.jsx";
import { MarcoDeLaApp } from "./MarcoDeLaApp.jsx";

function PantallaLenta() {
  const [lista, setLista] = useState(false);
  useEffect(() => {
    const temporizador = setTimeout(() => setLista(true), 60);
    return () => clearTimeout(temporizador);
  }, []);
  return lista ? (
    <h1 tabIndex={-1}>Pantalla lenta</h1>
  ) : (
    <button type="button">Mientras carga</button>
  );
}

function montar(ruta = "/proyectos", cuenta = null) {
  render(
    <Proveedores ruta={ruta} cuenta={cuenta}>
      <Routes>
        <Route element={<MarcoDeLaApp />}>
          <Route path="/proyectos" element={<h1 tabIndex={-1}>Proyectos</h1>} />
          <Route path="/lenta" element={<PantallaLenta />} />
          <Route path="/auth/callback" element={<Navigate to="/otra" replace />} />
          <Route
            path="/otra"
            element={
              <>
                <h1 tabIndex={-1}>Otra pantalla</h1>
                <Link to="/proyectos">Ir a proyectos</Link>
                <Link to="/lenta">Ir a la pantalla lenta</Link>
                <Link to="/otra?pagina=2">Página 2</Link>
              </>
            }
          />
        </Route>
      </Routes>
    </Proveedores>,
  );
  return userEvent.setup();
}

function botonMenu() {
  return screen.getByRole("button", { name: "Menú" });
}

test("Saltar al contenido es el primer Tab y lleva el foco al contenido", async () => {
  const user = montar();
  await user.tab();
  const saltar = screen.getByRole("link", { name: "Saltar al contenido" });
  expect(saltar).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(screen.getByRole("main")).toHaveFocus();
});

test("el enlace de la sección actual tiene aria-current", () => {
  montar();
  const navegacion = screen.getByRole("navigation", { name: "Principal" });
  expect(within(navegacion).getByRole("link", { name: "Proyectos" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("Menú se abre y Esc lo cierra devolviendo el foco al botón", async () => {
  const user = montar("/proyectos", { rol: "COLECTIVO", perfilId: "cl1" });
  await screen.findByRole("button", { name: "Menú" });
  expect(botonMenu()).toHaveAttribute("aria-expanded", "false");
  expect(botonMenu()).toHaveAttribute("aria-controls", "enlaces-principales");
  await user.click(botonMenu());
  expect(botonMenu()).toHaveAttribute("aria-expanded", "true");
  await user.tab();
  await user.keyboard("{Escape}");
  expect(botonMenu()).toHaveAttribute("aria-expanded", "false");
  expect(botonMenu()).toHaveFocus();
});

test("elegir un enlace cierra el menú", async () => {
  const user = montar("/otra", { rol: "COLECTIVO", perfilId: "cl1" });
  await user.click(await screen.findByRole("button", { name: "Menú" }));
  const navegacion = screen.getByRole("navigation", { name: "Principal" });
  await user.click(within(navegacion).getByRole("link", { name: "Proyectos" }));
  expect(botonMenu()).toHaveAttribute("aria-expanded", "false");
});

test("al navegar, el foco va al título de la pantalla nueva", async () => {
  const user = montar("/otra");
  expect(screen.getByRole("heading", { name: "Otra pantalla" })).not.toHaveFocus();
  await user.click(screen.getByRole("link", { name: "Ir a proyectos" }));
  expect(screen.getByRole("heading", { level: 1, name: "Proyectos" })).toHaveFocus();
});

test("cambiar solo la búsqueda no mueve el foco", async () => {
  const user = montar("/otra");
  const enlace = screen.getByRole("link", { name: "Página 2" });
  await user.click(enlace);
  expect(screen.getByRole("heading", { name: "Otra pantalla" })).not.toHaveFocus();
});

test("si el título todavía no existe, el foco queda en el contenido y pasa al título cuando aparece", async () => {
  const user = montar("/otra");
  await user.click(screen.getByRole("link", { name: "Ir a la pantalla lenta" }));
  expect(screen.getByRole("main")).toHaveFocus();
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { level: 1, name: "Pantalla lenta" }),
    ).toHaveFocus(),
  );
});

test("si la persona ya movió el foco mientras cargaba, el título no se lo roba", async () => {
  const user = montar("/otra");
  await user.click(screen.getByRole("link", { name: "Ir a la pantalla lenta" }));
  const enlaceDeCabecera = screen.getByRole("link", { name: "Proyectos" });
  enlaceDeCabecera.focus();
  const titulo = await screen.findByRole("heading", { level: 1, name: "Pantalla lenta" });
  expect(titulo).not.toHaveFocus();
  expect(enlaceDeCabecera).toHaveFocus();
});

test("al volver del ingreso con replace, el foco va al título de la pantalla", async () => {
  montar("/auth/callback");
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { level: 1, name: "Otra pantalla" }),
    ).toHaveFocus(),
  );
});

test("al cargar la página directamente, el foco no se mueve", () => {
  montar("/proyectos");
  expect(screen.getByRole("heading", { level: 1, name: "Proyectos" })).not.toHaveFocus();
});
