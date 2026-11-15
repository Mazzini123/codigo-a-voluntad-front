import { useState } from "react";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import estilos from "./HabilidadForm.module.css";

export function HabilidadForm({ onCrear, guardando, error }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const sinTitulo = !titulo.trim();

  async function enviar(event) {
    event.preventDefault();
    if (sinTitulo || guardando) return;
    if (await onCrear({ titulo: titulo.trim(), descripcion: descripcion.trim() })) {
      setTitulo("");
      setDescripcion("");
    }
  }

  return (
    <form
      onSubmit={enviar}
      className={estilos.formulario}
      aria-labelledby="nueva-habilidad"
    >
      <fieldset disabled={guardando} className={estilos.campos}>
        <h2 id="nueva-habilidad">Nueva habilidad</h2>
        <div className={estilos.campo}>
          <label htmlFor="titulo" className={estilos.etiqueta}>
            Nombre de la habilidad (obligatorio)
          </label>
          <input
            id="titulo"
            className={estilos.control}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            placeholder="Ej.: Diseño de interfaces"
          />
        </div>
        <div className={estilos.campo}>
          <label htmlFor="descripcion" className={estilos.etiqueta}>
            Descripción
          </label>
          <textarea
            id="descripcion"
            className={estilos.control}
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            aria-describedby="ayuda-descripcion"
            placeholder="Contá en una línea para qué sirve, así un colectivo sin experiencia técnica la entiende."
          />
        </div>
        <div className={estilos.acciones}>
          <Boton
            variante="primario"
            type="submit"
            enviando={guardando}
            textoEnviando="Guardando…"
            disabled={sinTitulo}
          >
            Crear habilidad
          </Boton>
        </div>
      </fieldset>
      {error && (
        <p role="alert" className={estilos.error}>
          <Icono nombre="alerta" />
          {error.mensaje}
        </p>
      )}
    </form>
  );
}
