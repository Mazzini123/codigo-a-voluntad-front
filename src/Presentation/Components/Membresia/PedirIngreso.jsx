import { Link } from "react-router-dom";
import { puedePedirIngreso } from "@/Application/Domain/Reglas/membresia.js";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { mensajeDeMembresia } from "@/Presentation/Formatos/membresia.js";
import { useSolicitarIngreso } from "@/Presentation/Hooks/membresia/useSolicitarIngreso.js";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { RUTA_MIS_SOLICITUDES } from "@/Presentation/Routes/rutas.js";
import estilos from "./PedirIngreso.module.css";

export function PedirIngreso({ colectivo }) {
  const { usuario } = useAuth();
  if (!puedePedirIngreso(usuario, colectivo)) return null;
  return <Pedido colectivoId={colectivo.id} />;
}

function Pedido({ colectivoId }) {
  const pedido = useSolicitarIngreso(colectivoId);
  const enviada = Boolean(pedido.datos);
  return (
    <div className={estilos.pedido}>
      {enviada ? (
        <p role="status">
          Enviamos tu solicitud. Podés seguirla en{" "}
          <Link to={RUTA_MIS_SOLICITUDES}>Mis solicitudes</Link>.
        </p>
      ) : (
        <Boton
          enviando={pedido.enviando}
          textoEnviando="Enviando…"
          onClick={() => pedido.ejecutar()}
        >
          Pedir sumarme
        </Boton>
      )}
      {pedido.error && (
        <p role="alert">
          {mensajeDeMembresia(
            pedido.error,
            "No pudimos enviar la solicitud. Probá de nuevo.",
          )}
        </p>
      )}
    </div>
  );
}
