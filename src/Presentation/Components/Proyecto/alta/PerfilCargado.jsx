import { textoCompromiso, textoModalidad } from "@/Presentation/Formatos/proyecto.js";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { Chip } from "@/Presentation/Components/App/ui/Chip.jsx";
import estilos from "./PerfilCargado.module.css";

export function PerfilCargado({ perfil, numero, enEdicion, alEditar, alQuitar }) {
  const idTitulo = `perfil-cargado-${perfil.clave}`;
  return (
    <article className={estilos.perfil} aria-labelledby={idTitulo}>
      <h3 id={idTitulo} className={estilos.titulo}>
        Perfil {numero}
        {enEdicion && <span className={estilos.editando}> · Lo estás editando</span>}
      </h3>
      <p className={estilos.descripcion}>{perfil.descripcion}</p>
      <ul className={estilos.chips} aria-label="Habilidades requeridas">
        {perfil.requeridas.map((habilidad) => (
          <li key={habilidad.codigo}>
            <Chip>{habilidad.titulo}</Chip>
          </li>
        ))}
      </ul>
      <p className={estilos.datos}>
        {[
          textoCompromiso({ cantidadHoras: perfil.horas, periodo: perfil.periodo }),
          textoModalidad(perfil.modalidad),
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <div className={estilos.acciones}>
        <Boton
          disabled={enEdicion}
          aria-label={`Editar perfil ${numero}`}
          onClick={() => alEditar(perfil.clave)}
        >
          Editar
        </Boton>
        <Boton
          aria-label={`Quitar perfil ${numero}`}
          onClick={() => alQuitar(perfil.clave)}
        >
          Quitar
        </Boton>
      </div>
    </article>
  );
}
