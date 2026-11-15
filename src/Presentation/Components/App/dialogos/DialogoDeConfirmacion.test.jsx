import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DialogoDeConfirmacion } from "./DialogoDeConfirmacion.jsx";

function Pantalla({
  alConfirmar = () => {},
  enviando = false,
  contenido = null,
  destinoDeFoco,
}) {
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setAbierto(true)}>
        Rechazar
      </button>
      <button type="button">Otro destino</button>
      <DialogoDeConfirmacion
        abierto={abierto}
        titulo="¿Rechazar la postulación de Ana?"
        descripcion="Ana va a ver que su postulación fue rechazada."
        textoConfirmar="Rechazar postulación"
        textoEnviando="Rechazando…"
        enviando={enviando}
        alConfirmar={alConfirmar}
        alCancelar={() => setAbierto(false)}
        destinoDeFoco={destinoDeFoco}
      >
        {contenido}
      </DialogoDeConfirmacion>
    </>
  );
}

async function abrir(props) {
  const user = userEvent.setup();
  render(<Pantalla {...props} />);
  await user.click(screen.getByRole("button", { name: "Rechazar" }));
  return user;
}

test("tiene nombre, descripción y el aviso de acción permanente", async () => {
  await abrir();
  const dialogo = screen.getByRole("dialog", {
    name: "¿Rechazar la postulación de Ana?",
  });
  expect(dialogo).toHaveAccessibleDescription(
    "Ana va a ver que su postulación fue rechazada.",
  );
  expect(dialogo).toHaveTextContent("Esta acción no se puede deshacer.");
});

test("al abrir, el foco va a Cancelar y no al botón peligroso", async () => {
  await abrir();
  expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
});

test("Cancelar cierra y devuelve el foco al botón que lo abrió", async () => {
  const user = await abrir();
  await user.click(screen.getByRole("button", { name: "Cancelar" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Rechazar" })).toHaveFocus();
});

test("Esc cierra y devuelve el foco al botón que lo abrió", async () => {
  const user = await abrir();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Rechazar" })).toHaveFocus();
});

test("al cerrar, el foco va al destino indicado y no al botón que lo abrió", async () => {
  const destinoDeFoco = () => screen.getByRole("button", { name: "Otro destino" });
  const user = await abrir({ destinoDeFoco });
  await user.click(screen.getByRole("button", { name: "Cancelar" }));
  expect(screen.getByRole("button", { name: "Otro destino" })).toHaveFocus();
});

test("si el destino no existe, el foco vuelve al botón que lo abrió", async () => {
  const user = await abrir({ destinoDeFoco: () => null });
  await user.keyboard("{Escape}");
  expect(screen.getByRole("button", { name: "Rechazar" })).toHaveFocus();
});

test("confirmar llama a alConfirmar", async () => {
  const alConfirmar = vi.fn();
  const user = await abrir({ alConfirmar });
  await user.click(screen.getByRole("button", { name: "Rechazar postulación" }));
  expect(alConfirmar).toHaveBeenCalledTimes(1);
});

test("mientras envía, deshabilita los dos botones, muestra el gerundio y Esc no cierra", async () => {
  const user = await abrir({ enviando: true });
  expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  const confirmar = screen.getByRole("button", { name: "Rechazando…" });
  expect(confirmar).toBeDisabled();
  expect(confirmar).toHaveAttribute("aria-busy", "true");
  screen.getByRole("dialog").focus();
  await user.keyboard("{Escape}");
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});

test("muestra el contenido extra entre la descripción y las acciones", async () => {
  await abrir({ contenido: <p>Ana va a recibir un aviso.</p> });
  const dialogo = screen.getByRole("dialog");
  const extra = within(dialogo).getByText("Ana va a recibir un aviso.");
  const descripcion = within(dialogo).getByText(
    "Ana va a ver que su postulación fue rechazada.",
  );
  const cancelar = within(dialogo).getByRole("button", { name: "Cancelar" });
  expect(descripcion.compareDocumentPosition(extra)).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING,
  );
  expect(extra.compareDocumentPosition(cancelar)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
});
