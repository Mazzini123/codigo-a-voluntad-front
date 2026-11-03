export function HabilidadList({ habilidades }) {
  if (habilidades.length === 0) return <p>No hay habilidades en esta página.</p>;
  return (
    <ul className="habilidad-list">
      {habilidades.map((habilidad) => (
        <li className="panel" key={habilidad.codigo}>
          <h3>{habilidad.titulo}</h3>
          <p>{habilidad.descripcion || "Sin descripción"}</p>
          <small>{habilidad.activo ? "Activa" : "Inactiva"}</small>
        </li>
      ))}
    </ul>
  );
}
