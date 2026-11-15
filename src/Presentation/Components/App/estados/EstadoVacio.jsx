import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import estilos from "./EstadoVacio.module.css";

export function EstadoVacio({
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
