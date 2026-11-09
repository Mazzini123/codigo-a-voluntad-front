import { useLocation } from "react-router-dom";
import { COLABORACION_ESTADO } from "@/Application/Domain/Enums/COLABORACION_ESTADO.js";
import { PROYECTO_ESTADO } from "@/Application/Domain/Enums/PROYECTO_ESTADO.js";
import { ROL_CUENTA } from "@/Application/Domain/Enums/ROL_CUENTA.js";
import { ESTADO_BUSQUEDA, motivoNoPostulable } from "@/Presentation/Formatos/proyecto.js";
import { RUTA_BIENVENIDA, RUTA_LOGIN } from "@/Presentation/Routes/rutas.js";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { EnlaceBoton } from "@/Presentation/Components/App/ui/EnlaceBoton.jsx";
import { idDePostulacion } from "@/Presentation/Components/Proyecto/alta/idsDePerfil.js";
import { BuscarColaboradoras } from "@/Presentation/Components/Reclutamiento/BuscarColaboradoras.jsx";
import { SelloDeBusqueda } from "@/Presentation/Components/Proyecto/SelloDeBusqueda.jsx";
import estilos from "./AccionDePerfil.module.css";

const SELLO_DE_POSTULACION = Object.freeze({
  [COLABORACION_ESTADO.PENDIENTE]: {
    tipo: ESTADO_BUSQUEDA.LIMITE,
    texto: "Tu postulación está pendiente",
  },
  [COLABORACION_ESTADO.ACEPTADA]: {
    tipo: ESTADO_BUSQUEDA.ABIERTA,
    texto: "Tu postulación fue aceptada",
  },
  [COLABORACION_ESTADO.RECHAZADA]: {
    tipo: ESTADO_BUSQUEDA.RECHAZADA,
    texto: "Tu postulación fue rechazada",
  },
});

export function AccionDePerfil({
  perfil,
  proyecto,
  usuario,
  postulacion = null,
  esDueno = false,
  alPostular,
  hoy = new Date(),
}) {
  const { pathname, search, hash } = useLocation();

  if (proyecto.estado === PROYECTO_ESTADO.FINALIZADO) return null;
  if (usuario?.rol === ROL_CUENTA.COLECTIVO)
    return esDueno ? (
      <BuscarColaboradoras perfil={perfil} proyecto={proyecto} hoy={hoy} />
    ) : null;
  if (postulacion)
    return (
      <span id={idDePostulacion(perfil.id)} tabIndex={-1} className={estilos.sello}>
        <SelloDeBusqueda estado={SELLO_DE_POSTULACION[postulacion.estado]} />
      </span>
    );

  const motivo = motivoNoPostulable(perfil, proyecto, hoy);
  if (motivo) {
    return (
      <Boton disabled motivoDeshabilitado={motivo}>
        Postularme
      </Boton>
    );
  }
  if (!usuario) {
    return (
      <div className={estilos.grupo}>
        <EnlaceBoton to={RUTA_LOGIN} state={{ desde: { pathname, search, hash } }}>
          Ingresar para postularme
        </EnlaceBoton>
        <p className={estilos.nota}>Ingresá como colaboradora para postularte.</p>
      </div>
    );
  }
  if (!usuario.rol) {
    return <EnlaceBoton to={RUTA_BIENVENIDA}>Completar mi perfil</EnlaceBoton>;
  }
  return (
    <Boton variante="primario" onClick={() => alPostular(perfil)}>
      Postularme
    </Boton>
  );
}
