import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DialogoDeConfirmacion } from "@/Presentation/Components/App/dialogos/DialogoDeConfirmacion.jsx";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { actividadEnCurso } from "@/Presentation/Formatos/bajaDeColaboradora.js";
import { useDarDeBajaColaboradora } from "@/Presentation/Hooks/colaboradora/useDarDeBajaColaboradora.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { RUTA_BIENVENIDA } from "@/Presentation/Routes/rutas.js";
import estilos from "@/Presentation/Components/Colectivo/BajaDelColectivo.module.css";

export function BajaDeColaboradora({ colaboradorId }) {
  const { recargarCuenta } = useAuth();
  const navigate = useNavigate();
  const avisar = useAvisos();
  const baja = useDarDeBajaColaboradora(colaboradorId);
  const [abierto, setAbierto] = useState(false);
  const [falla, setFalla] = useState(null);
  const [terminando, setTerminando] = useState(false);
  const pendientes = actividadEnCurso(falla);

  async function confirmar() {
    const resultado = await baja.ejecutar();
    if (resultado.ignorada) return;
    if (!resultado.ok) {
      setFalla(resultado.error);
      return;
    }
    setTerminando(true);
    avisar.exito("Diste de baja tu perfil de colaboradora.");
    await recargarCuenta();
    navigate(RUTA_BIENVENIDA, { replace: true });
  }

  return (
    <section className={estilos.seccion} aria-labelledby="baja-colaboradora">
      <h2 id="baja-colaboradora">Dar de baja mi perfil</h2>
      <p>Tu perfil deja de aparecer en las búsquedas y su historial se conserva.</p>
      <Boton
        variante="peligroso"
        onClick={() => {
          setFalla(null);
          setAbierto(true);
        }}
      >
        Dar de baja mi perfil
      </Boton>
      <DialogoDeConfirmacion
        abierto={abierto}
        titulo="¿Dar de baja tu perfil de colaboradora?"
        descripcion="Solo se puede si no tenés postulaciones pendientes ni colaboraciones activas. Si volvés a darte de alta con la misma cuenta, se creará un perfil nuevo y se conservará el historial del anterior."
        textoConfirmar="Dar de baja mi perfil"
        textoEnviando="Dando de baja…"
        permanente={false}
        peligroso
        enviando={baja.enviando || terminando}
        confirmarDeshabilitado={Boolean(pendientes)}
        alConfirmar={confirmar}
        alCancelar={() => setAbierto(false)}
      >
        {pendientes && (
          <div role="alert">
            <p>Antes de darte de baja, resolvé esto:</p>
            <ul>
              {pendientes.map((item) => (
                <li key={item.id}>
                  {item.proyecto}: {item.estado.toLowerCase()}
                </li>
              ))}
            </ul>
          </div>
        )}
        {falla && !pendientes && (
          <p role="alert">No pudimos dar de baja tu perfil. Probá de nuevo.</p>
        )}
      </DialogoDeConfirmacion>
    </section>
  );
}
