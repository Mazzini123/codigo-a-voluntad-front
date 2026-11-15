import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import estilos from "./Formulario.module.css";

function unirConY(enlaces) {
  return enlaces.flatMap((enlace, indice) => {
    if (indice === 0) return [enlace];
    const separador = indice === enlaces.length - 1 ? " y " : ", ";
    return [separador, enlace];
  });
}

export function ResumenDeErrores({ items }) {
  if (items.length === 0) return null;

  function enfocar(evento, id) {
    evento.preventDefault();
    document.getElementById(id)?.focus();
  }

  const enlaces = items.map(({ id, etiqueta }) => (
    <a key={id} href={`#${id}`} onClick={(evento) => enfocar(evento, id)}>
      {etiqueta}
    </a>
  ));

  return (
    <div role="alert" className={estilos.resumen}>
      <Icono nombre="alerta" />
      <p>
        Revisá {items.length} {items.length === 1 ? "campo" : "campos"}:{" "}
        {unirConY(enlaces)}.
      </p>
    </div>
  );
}
