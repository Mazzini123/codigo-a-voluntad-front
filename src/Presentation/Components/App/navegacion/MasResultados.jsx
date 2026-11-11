import { Boton } from "../ui/Boton.jsx";

export function MasResultados({ consulta, texto }) {
  if (!consulta.hayMas) return null;
  return (
    <div>
      {consulta.error && (
        <p role="alert">No pudimos cargar más resultados. Podés reintentar.</p>
      )}
      <Boton
        enviando={consulta.cargando}
        textoEnviando="Cargando…"
        onClick={consulta.cargarMas}
      >
        {texto}
      </Boton>
    </div>
  );
}
