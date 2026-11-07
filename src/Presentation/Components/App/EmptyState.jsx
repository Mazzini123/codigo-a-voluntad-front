import { Icono } from "./Icono.jsx";
import estilos from "./EmptyState.module.css";

export function EmptyState({
  titulo,
  descripcion,
  icono = "vacio",
  nivel = 2,
  children,
}) {
  const Titulo = `h${nivel}`;
  return (
    <div className={estilos.vacio}>
      {icono && <Icono nombre={icono} tamano={32} className={estilos.icono} />}
      <Titulo>{titulo}</Titulo>
      {descripcion && <p className={estilos.descripcion}>{descripcion}</p>}
      {children && <div className={estilos.accion}>{children}</div>}
    </div>
  );
}
