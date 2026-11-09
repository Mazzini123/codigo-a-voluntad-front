import { Link, useLocation } from "react-router-dom";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { Chip } from "@/Presentation/Components/App/ui/Chip.jsx";
import { nombreVisible } from "@/Presentation/Formatos/colaboradora.js";
import {
  cantidadDeOpcionalesQueTiene,
  MOTIVO_SIN_MENSAJERIA,
  recibeMensajeriaInterna,
  textoOpcionalesQueTiene,
} from "@/Presentation/Formatos/reclutamiento.js";
import { estadoParaVolver, rutaColaboradora } from "@/Presentation/Routes/rutas.js";
import { idDeInvitacion } from "./idsDeInvitacion.js";
import estilos from "./TarjetaDeColaboradora.module.css";

export function TarjetaDeColaboradora({
  candidata,
  totalOpcionales,
  invitada,
  ocupado,
  alContactar,
}) {
  const location = useLocation();
  const { colaborador } = candidata;
  const nombre = nombreVisible(colaborador);
  const habilidades = (colaborador.habilidades ?? [])
    .map(({ titulo }) => titulo)
    .filter(Boolean);
  const opcionales = textoOpcionalesQueTiene(
    cantidadDeOpcionalesQueTiene(candidata),
    totalOpcionales,
  );
  const recibeMensajes = recibeMensajeriaInterna(colaborador);

  return (
    <li className={estilos.tarjeta}>
      <h2 className={estilos.nombre}>
        <Link
          className={estilos.enlace}
          to={rutaColaboradora(colaborador.id)}
          state={estadoParaVolver(location, "Volver a las colaboradoras del perfil")}
        >
          {nombre}
        </Link>
      </h2>
      {habilidades.length > 0 && <p>Habilidades: {habilidades.join(", ")}</p>}
      {opcionales && <p>{opcionales}</p>}
      <div className={estilos.accion}>
        {invitada ? (
          <span
            id={idDeInvitacion(colaborador.id)}
            tabIndex={-1}
            className={estilos.sello}
          >
            <Chip tipo="requerida">Invitación enviada</Chip>
          </span>
        ) : (
          <Boton
            disabled={ocupado || !recibeMensajes}
            motivoDeshabilitado={recibeMensajes ? undefined : MOTIVO_SIN_MENSAJERIA}
            onClick={() => alContactar(colaborador)}
          >
            Contactar
          </Boton>
        )}
      </div>
    </li>
  );
}
