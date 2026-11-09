import { useState } from "react";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { useDarDeBajaColectivo } from "@/Presentation/Hooks/colectivo/useDarDeBajaColectivo.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { DialogoDeConfirmacion } from "@/Presentation/Components/App/dialogos/DialogoDeConfirmacion.jsx";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { Campo } from "@/Presentation/Components/App/ui/Campo.jsx";
import estilos from "./BajaDelColectivo.module.css";

export function BajaDelColectivo({ colectivo }) {
  const { cerrarSesion, invalidarPerfil } = useAuth();
  const avisar = useAvisos();
  const baja = useDarDeBajaColectivo(colectivo.id);
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [terminando, setTerminando] = useState(false);
  async function confirmar() {
    if (nombre !== colectivo.nombre || baja.enviando || terminando) return;
    const resultado = await baja.ejecutar();
    if (resultado.ignorada) return;
    if (!resultado.ok && resultado.error?.status !== 409) {
      setMensaje("No pudimos dar de baja el colectivo. Probá de nuevo.");
      return;
    }
    setTerminando(true);
    avisar[resultado.ok ? "exito" : "info"](
      resultado.ok
        ? "Diste de baja el colectivo."
        : "Este colectivo ya estaba dado de baja.",
    );
    await invalidarPerfil();
    await cerrarSesion();
  }
  return (
    <section className={estilos.seccion} aria-labelledby="baja-colectivo">
      <h2 id="baja-colectivo">Dar de baja el colectivo</h2>
      <p>
        La baja es permanente. La historia del colectivo seguirá visible en la plataforma.
      </p>
      <Boton
        variante="peligroso"
        onClick={() => {
          setNombre("");
          setMensaje(null);
          setAbierto(true);
        }}
      >
        Dar de baja el colectivo
      </Boton>
      <DialogoDeConfirmacion
        abierto={abierto}
        titulo="¿Dar de baja el colectivo?"
        descripcion="Se cierran los proyectos abiertos, se rechazan las postulaciones pendientes, finalizan las colaboraciones activas y se borran los medios de contacto y las redes sociales. El historial sigue visible. Tu cuenta de ingreso se conserva y queda sin perfil."
        textoConfirmar="Dar de baja el colectivo"
        textoEnviando="Dando de baja…"
        enviando={baja.enviando || terminando}
        confirmarDeshabilitado={nombre !== colectivo.nombre}
        alConfirmar={confirmar}
        alCancelar={() => setAbierto(false)}
      >
        <Campo
          etiqueta="Nombre del colectivo"
          ayuda={`Escribí ${colectivo.nombre} para confirmar.`}
          value={nombre}
          onChange={(evento) => setNombre(evento.target.value)}
          disabled={baja.enviando || terminando}
          autoComplete="off"
        />
        {mensaje && <p role="alert">{mensaje}</p>}
      </DialogoDeConfirmacion>
    </section>
  );
}
