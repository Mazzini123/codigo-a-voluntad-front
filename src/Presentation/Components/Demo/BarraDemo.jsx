import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import {
  cambiarRolDemo,
  reiniciarDemo,
} from "@/Presentation/Dependencies/demoDependencies.js";
import estilos from "./BarraDemo.module.css";

export default function BarraDemo() {
  const { usuario } = useAuth();
  const rol = usuario ? (usuario.rol ?? "SIN_PERFIL") : "VISITANTE";
  return (
    <aside className={estilos.barra} aria-label="Controles de la demo">
      <div>
        <strong>Modo demo</strong>
        <p>Datos ficticios guardados en esta pestaña. No se usa el backend.</p>
      </div>
      <label>
        Ver como
        <select
          value={rol}
          onChange={(evento) => void cambiarRolDemo(evento.target.value)}
        >
          <option value="VISITANTE">Visitante</option>
          <option value="COLECTIVO">Colectivo</option>
          <option value="COLABORADORA">Colaboradora</option>
          <option value="SIN_PERFIL">Cuenta sin perfil</option>
        </select>
      </label>
      <button type="button" onClick={reiniciarDemo}>
        Reiniciar ejemplos
      </button>
    </aside>
  );
}
