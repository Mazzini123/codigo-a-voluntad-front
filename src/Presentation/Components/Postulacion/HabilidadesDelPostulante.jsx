import { useId } from "react";
import {
  encajeDeHabilidades,
  habilidadesFueraDelPerfil,
  requeridasCubiertas,
} from "@/Application/Domain/Reglas/encaje.js";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { Chip } from "@/Presentation/Components/App/ui/Chip.jsx";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import { TextoOculto } from "@/Presentation/Components/App/ui/TextoOculto.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { FranjaDeEncaje } from "@/Presentation/Components/Proyecto/detalle/FranjaDeEncaje.jsx";
import { textoEncajeDelPostulante } from "@/Presentation/Formatos/colaboracion.js";
import { useColaboradora } from "@/Presentation/Hooks/colaboradora/useColaboradora.js";
import estilos from "./HabilidadesDelPostulante.module.css";

export function HabilidadesDelPostulante({ colaboradoraId, perfil }) {
  const { colaboradora, error, cargando, recargar } = useColaboradora(colaboradoraId);

  if (error?.status === 404) {
    return (
      <p className={estilos.nota}>Su perfil de colaboradora ya no está disponible.</p>
    );
  }
  if (error) {
    return (
      <div className={estilos.error}>
        <p>No pudimos cargar sus habilidades.</p>
        <Boton icono="reintentar" onClick={recargar} enviando={cargando}>
          Reintentar
        </Boton>
      </div>
    );
  }
  if (!colaboradora) {
    return (
      <Esqueleto etiqueta="Cargando habilidades…">
        <BloqueEsqueleto alto="2rem" ancho="60%" />
      </Esqueleto>
    );
  }
  return <Comparacion habilidades={colaboradora.habilidades ?? []} perfil={perfil} />;
}

function Comparacion({ habilidades, perfil }) {
  if (habilidades.length === 0) {
    return <p className={estilos.nota}>Todavía no cargó habilidades.</p>;
  }
  const codigos = new Set(habilidades.map(({ codigo }) => codigo));
  const encaje = encajeDeHabilidades(perfil, codigos);
  const requeridas = requeridasCubiertas(perfil, codigos);
  const otras = habilidadesFueraDelPerfil(perfil, habilidades);
  return (
    <div className={estilos.bloque}>
      {encaje && <FranjaDeEncaje>{textoEncajeDelPostulante(encaje)}</FranjaDeEncaje>}
      {requeridas.length > 0 && (
        <ListaDeHabilidades titulo="Lo que pide el perfil">
          {requeridas.map(({ habilidad, tiene }) => (
            <li key={habilidad.codigo}>
              <Chip tipo={tiene ? "requerida" : "opcional"}>
                <Icono nombre={tiene ? "tilde" : "cruz"} tamano={16} />
                {habilidad.titulo}
                <TextoOculto>{tiene ? ". La tiene" : ". No la tiene"}</TextoOculto>
              </Chip>
            </li>
          ))}
        </ListaDeHabilidades>
      )}
      {otras.length > 0 && (
        <ListaDeHabilidades
          titulo={requeridas.length > 0 ? "Otras habilidades" : "Habilidades"}
        >
          {otras.map((habilidad) => (
            <li key={habilidad.codigo}>
              <Chip tipo="opcional">{habilidad.titulo}</Chip>
            </li>
          ))}
        </ListaDeHabilidades>
      )}
    </div>
  );
}

function ListaDeHabilidades({ titulo, children }) {
  const id = useId();
  return (
    <div className={estilos.grupo}>
      <p id={id} className={estilos.titulo}>
        {titulo}
      </p>
      <ul className={estilos.chips} aria-labelledby={id}>
        {children}
      </ul>
    </div>
  );
}
