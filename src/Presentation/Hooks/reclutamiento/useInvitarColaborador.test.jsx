import { ApiError } from "@/Infrastructure/Http/ApiError.js";
import { act, renderHook, waitFor } from "@testing-library/react";
import { AvisosContext } from "@/Presentation/Context/AvisosContext.js";
import { useInvitarColaborador } from "./useInvitarColaborador.js";

const ada = { id: "ada", nombre: "Ada" };

function armar({ invitar } = {}) {
  const avisos = { exito: vi.fn(), error: vi.fn(), info: vi.fn() };
  const dependencias = { invitarColaborador: invitar ?? vi.fn(async () => ({})) };
  const wrapper = ({ children }) => (
    <AvisosContext.Provider value={avisos}>{children}</AvisosContext.Provider>
  );
  const hook = renderHook(() => useInvitarColaborador("p1", "pe1", dependencias), {
    wrapper,
  });
  return { ...hook, avisos, dependencias };
}

test("abrir deja el diálogo vacío y sin error", () => {
  const { result } = armar();
  act(() => result.current.abrir(ada));
  expect(result.current.aInvitar).toBe(ada);
  expect(result.current.mensaje).toBe("");
  expect(result.current.errorDelMensaje).toBeNull();
});

test("un mensaje inválido no se envía y recién entonces marca el error", async () => {
  const { result, dependencias } = armar();
  act(() => result.current.abrir(ada));
  expect(result.current.errorDelMensaje).toBeNull();
  await act(() => result.current.enviar());
  expect(result.current.errorDelMensaje).toBe("Escribí un mensaje para la invitación.");
  expect(dependencias.invitarColaborador).not.toHaveBeenCalled();
});

test("envía la invitación, avisa, marca a la persona y cierra", async () => {
  const { result, avisos, dependencias } = armar();
  act(() => result.current.abrir(ada));
  act(() => result.current.cambiarMensaje("Hola"));
  await act(() => result.current.enviar());
  expect(dependencias.invitarColaborador).toHaveBeenCalledWith(
    "p1",
    "pe1",
    { colaboradorId: "ada", mensaje: "Hola" },
    { signal: expect.any(AbortSignal) },
  );
  expect(avisos.exito).toHaveBeenCalledWith("Invitación enviada a «Ada».");
  expect(result.current.aInvitar).toBeNull();
  expect(result.current.invitadas.has("ada")).toBe(true);
  expect(result.current.ultimaInvitada).toBe("ada");
});

test("un fallo deja el diálogo abierto con el mensaje y el texto propio del status", async () => {
  const invitar = vi.fn(async () => {
    throw new ApiError({ status: 409 });
  });
  const { result, avisos } = armar({ invitar });
  act(() => result.current.abrir(ada));
  act(() => result.current.cambiarMensaje("Hola"));
  await act(() => result.current.enviar());
  await waitFor(() =>
    expect(result.current.errorDeEnvio?.mensaje).toBe(
      "Ya invitaste a esta persona para este perfil.",
    ),
  );
  expect(result.current.aInvitar).toBe(ada);
  expect(result.current.mensaje).toBe("Hola");
  expect(result.current.invitadas.size).toBe(0);
  expect(avisos.exito).not.toHaveBeenCalled();
});

test("cancelar descarta el mensaje y el error", async () => {
  const invitar = vi.fn(async () => {
    throw new Error("falló");
  });
  const { result } = armar({ invitar });
  act(() => result.current.abrir(ada));
  act(() => result.current.cambiarMensaje("Hola"));
  await act(() => result.current.enviar());
  act(() => result.current.cancelar());
  expect(result.current.aInvitar).toBeNull();
  expect(result.current.mensaje).toBe("");
  expect(result.current.errorDeEnvio).toBeNull();
});

test("un segundo envío mientras hay uno en curso se ignora", async () => {
  let liberar;
  const invitar = vi.fn(() => new Promise((resolver) => (liberar = resolver)));
  const { result } = armar({ invitar });
  act(() => result.current.abrir(ada));
  act(() => result.current.cambiarMensaje("Hola"));
  let primero;
  act(() => {
    primero = result.current.enviar();
  });
  await waitFor(() => expect(result.current.enviando).toBe(true));
  await act(() => result.current.enviar());
  expect(invitar).toHaveBeenCalledTimes(1);
  await act(async () => {
    liberar({});
    await primero;
  });
});
