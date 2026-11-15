import { useCallback, useState } from "react";
import { reclutamientoDependencies } from "@/Presentation/Dependencies/reclutamientoDependencies.js";
import {
  armarInvitacion,
  validarInvitacion,
} from "@/Presentation/Formularios/reclutamiento/invitacion.js";
import { nombreVisible } from "@/Presentation/Formatos/colaboradora.js";
import { avisoDeInvitacionEnviada } from "@/Presentation/Formatos/reclutamiento.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

const MENSAJES = Object.freeze({
  409: "Ya invitaste a esta persona para este perfil.",
  422: "El mensaje no es válido. Revisalo.",
});
const SIN_INVITADAS = new Set();

export function useInvitarColaborador(
  proyectoId,
  perfilId,
  dependencias = reclutamientoDependencies,
) {
  const avisar = useAvisos();
  const [aInvitar, setAInvitar] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  const [invitadas, setInvitadas] = useState(SIN_INVITADAS);
  const [ultimaInvitada, setUltimaInvitada] = useState(null);

  const invitar = useCallback(
    (signal, colaboradorId, texto) =>
      dependencias.invitarColaborador(
        proyectoId,
        perfilId,
        armarInvitacion(colaboradorId, texto),
        { signal },
      ),
    [proyectoId, perfilId, dependencias],
  );
  const { ejecutar, enviando, error, reiniciar } = useMutacion(invitar, {
    mensajes: MENSAJES,
  });

  const errorDelMensaje = intentoEnviar ? validarInvitacion(mensaje) : null;

  function abrir(colaborador) {
    reiniciar();
    setUltimaInvitada(null);
    setMensaje("");
    setIntentoEnviar(false);
    setAInvitar(colaborador);
  }

  function cancelar() {
    reiniciar();
    setAInvitar(null);
    setMensaje("");
    setIntentoEnviar(false);
  }

  async function enviar() {
    if (validarInvitacion(mensaje)) {
      setIntentoEnviar(true);
      return;
    }
    const { ok } = await ejecutar(aInvitar.id, mensaje);
    if (!ok) return;
    setInvitadas((previas) => new Set(previas).add(aInvitar.id));
    setUltimaInvitada(aInvitar.id);
    avisar.exito(avisoDeInvitacionEnviada(nombreVisible(aInvitar)));
    setAInvitar(null);
    setMensaje("");
    setIntentoEnviar(false);
  }

  return {
    aInvitar,
    mensaje,
    errorDelMensaje,
    errorDeEnvio: error,
    enviando,
    invitadas,
    ultimaInvitada,
    abrir,
    cambiarMensaje: setMensaje,
    enviar,
    cancelar,
  };
}
