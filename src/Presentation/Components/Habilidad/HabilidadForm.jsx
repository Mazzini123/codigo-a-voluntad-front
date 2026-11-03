import { useState } from "react";

export function HabilidadForm({ onCrear, guardando, error }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  async function enviar(event) {
    event.preventDefault();
    if (!titulo.trim() || guardando) return;
    if (await onCrear({ titulo: titulo.trim(), descripcion: descripcion.trim() })) {
      setTitulo("");
      setDescripcion("");
    }
  }
  return (
    <form onSubmit={enviar} className="panel habilidad-form">
      <h2>Nueva habilidad</h2>
      <fieldset disabled={guardando}>
        <label htmlFor="titulo">Título</label>
        <input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />
        <label htmlFor="descripcion">Descripción</label>
        <textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <button type="submit" disabled={!titulo.trim()}>
          {guardando ? "Guardando…" : "Crear habilidad"}
        </button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
