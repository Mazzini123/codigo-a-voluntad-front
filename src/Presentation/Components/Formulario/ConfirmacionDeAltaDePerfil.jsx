import { useEffect, useRef } from "react";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import estilos from "@/Presentation/Components/Perfil/Perfil.module.css";

export function ConfirmacionDeAltaDePerfil({ actualizando, actualizarCuenta }) {
  const mensaje = useRef(null);

  useEffect(() => {
    mensaje.current?.focus();
  }, []);

  return (
    <div className={estilos.panel}>
      <p ref={mensaje} role="status" tabIndex={-1}>
        {actualizando
          ? "Tu perfil se creó. Estamos actualizando tu cuenta."
          : "Tu perfil se creó. Falta actualizar tu cuenta."}
      </p>
      <div>
        <Boton
          enviando={actualizando}
          textoEnviando="Actualizando…"
          onClick={() => actualizarCuenta()}
        >
          Actualizar cuenta
        </Boton>
      </div>
    </div>
  );
}
