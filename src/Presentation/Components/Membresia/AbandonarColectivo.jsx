import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DialogoDeConfirmacion } from "@/Presentation/Components/App/dialogos/DialogoDeConfirmacion.jsx";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { mensajeDeMembresia } from "@/Presentation/Formatos/membresia.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useAbandonarColectivo } from "@/Presentation/Hooks/membresia/useAbandonarColectivo.js";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { RUTA_BIENVENIDA } from "@/Presentation/Routes/rutas.js";
import estilos from "./AbandonarColectivo.module.css";

export function AbandonarColectivo({ colectivoId, esLider }) {
  const { recargarCuenta } = useAuth();
  const navigate = useNavigate();
  const avisar = useAvisos();
  const abandono = useAbandonarColectivo(colectivoId);
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [terminando, setTerminando] = useState(false);

  async function confirmar() {
    const resultado = await abandono.ejecutar();
    if (resultado.ignorada) return;
    if (!resultado.ok) {
      setMensaje(
        mensajeDeMembresia(
          resultado.error,
          "No pudimos sacarte del colectivo. Probá de nuevo.",
        ),
      );
      return;
    }
    setTerminando(true);
    avisar.exito("Saliste del colectivo.");
    await recargarCuenta();
    navigate(RUTA_BIENVENIDA, { replace: true });
  }

  return (
    <section className={estilos.seccion} aria-labelledby="abandonar-colectivo">
      <h2 id="abandonar-colectivo">Salir del colectivo</h2>
      <p>
        {esLider
          ? "Si tenés el liderazgo, antes de salir tenés que pasárselo a otra persona."
          : "Dejás de operar como parte del colectivo. El historial sigue visible."}
      </p>
      <Boton
        variante="peligroso"
        onClick={() => {
          setMensaje(null);
          setAbierto(true);
        }}
      >
        Salir del colectivo
      </Boton>
      <DialogoDeConfirmacion
        abierto={abierto}
        titulo="¿Salir del colectivo?"
        descripcion="Vas a dejar de ver el panel del colectivo. Para volver, tenés que pedir el ingreso otra vez."
        textoConfirmar="Salir del colectivo"
        textoEnviando="Saliendo…"
        enviando={abandono.enviando || terminando}
        alConfirmar={confirmar}
        alCancelar={() => setAbierto(false)}
      >
        {mensaje && <p role="alert">{mensaje}</p>}
      </DialogoDeConfirmacion>
    </section>
  );
}
