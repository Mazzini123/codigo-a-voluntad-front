import { useNavigate } from "react-router-dom";
import { ROL_CUENTA } from "@/Application/Domain/Enums/ROL_CUENTA.js";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { useReactivarColaboradora } from "@/Presentation/Hooks/colaboradora/useReactivarColaboradora.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { inicioPorRol } from "@/Presentation/Routes/rutas.js";
import estilos from "@/Presentation/Components/Membresia/PedirIngreso.module.css";

export function ReactivarColaboradora({ colaboradorId }) {
  const { recargarCuenta } = useAuth();
  const navigate = useNavigate();
  const avisar = useAvisos();
  const reactivacion = useReactivarColaboradora(colaboradorId);

  async function reactivar() {
    const resultado = await reactivacion.ejecutar();
    if (!resultado.ok) return;
    avisar.exito("Reactivaste tu perfil.");
    await recargarCuenta();
    navigate(inicioPorRol(ROL_CUENTA.COLABORADORA), { replace: true });
  }

  return (
    <div className={estilos.pedido} role="region" aria-labelledby="titulo-reactivar">
      <h2 id="titulo-reactivar">Ya tenías un perfil de colaboradora</h2>
      <p>Lo diste de baja antes. Podés reactivarlo con tus datos e historial.</p>
      <Boton
        enviando={reactivacion.enviando}
        textoEnviando="Reactivando…"
        onClick={reactivar}
      >
        Reactivar mi perfil
      </Boton>
      {reactivacion.error && (
        <p role="alert">No pudimos reactivar tu perfil. Probá de nuevo.</p>
      )}
    </div>
  );
}
