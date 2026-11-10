import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ESTADO_SOLICITUD } from "@/Application/Domain/Enums/ESTADO_SOLICITUD.js";
import { DialogoDeConfirmacion } from "@/Presentation/Components/App/dialogos/DialogoDeConfirmacion.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { EstadoVacio } from "@/Presentation/Components/App/estados/EstadoVacio.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { EnlaceBoton } from "@/Presentation/Components/App/ui/EnlaceBoton.jsx";
import {
  mensajeDeMembresia,
  nombreDelEstadoDeSolicitud,
} from "@/Presentation/Formatos/membresia.js";
import { fechaLarga } from "@/Presentation/Formatos/proyecto.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useMisSolicitudesDeIngreso } from "@/Presentation/Hooks/membresia/useMisSolicitudesDeIngreso.js";
import { rutaColectivo, RUTA_PROYECTOS } from "@/Presentation/Routes/rutas.js";
import estilos from "@/Presentation/Pages/colectivo/MiembrosPage.module.css";

export default function MisSolicitudesPage() {
  const consulta = useMisSolicitudesDeIngreso();
  const avisar = useAvisos();
  const [aCancelar, setACancelar] = useState(null);
  const refTitulo = useRef(null);
  const enfocarTitulo = useCallback(() => refTitulo.current, []);

  async function confirmar() {
    const resultado = await consulta.cancelar(aCancelar);
    if (!resultado) return;
    setACancelar(null);
    if (resultado.ok) avisar.exito("Cancelaste la solicitud.");
    else
      avisar.error(
        mensajeDeMembresia(
          resultado.error,
          "No pudimos cancelar la solicitud. Probá de nuevo.",
        ),
      );
  }

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-mis-solicitudes">
      <TituloDePagina>Mis solicitudes</TituloDePagina>
      <div>
        <h1 id="titulo-mis-solicitudes" ref={refTitulo} tabIndex={-1}>
          Mis solicitudes
        </h1>
        <p>Los colectivos a los que pediste sumarte.</p>
      </div>
      <Listado consulta={consulta} alCancelar={setACancelar} />
      <DialogoDeConfirmacion
        abierto={Boolean(aCancelar)}
        titulo="¿Cancelar la solicitud?"
        descripcion="El colectivo ya no la va a ver. Podés volver a pedir el ingreso más adelante."
        textoConfirmar="Cancelar la solicitud"
        textoCancelar="Volver"
        textoEnviando="Cancelando…"
        enviando={consulta.procesando}
        destinoDeFoco={enfocarTitulo}
        alConfirmar={confirmar}
        alCancelar={() => setACancelar(null)}
      />
    </section>
  );
}

function Listado({ consulta, alCancelar }) {
  if (consulta.error) {
    return (
      <EstadoDeError
        titulo="No pudimos cargar tus solicitudes"
        error={consulta.error}
        alReintentar={consulta.reintentar}
      />
    );
  }
  if (!consulta.solicitudes) {
    return (
      <Esqueleto etiqueta="Cargando solicitudes…">
        <BloqueEsqueleto alto="4rem" />
      </Esqueleto>
    );
  }
  if (!consulta.solicitudes.length) {
    return (
      <EstadoVacio
        icono="personas"
        titulo="Todavía no pediste sumarte a ningún colectivo"
        descripcion="Desde el perfil de un colectivo podés pedir el ingreso."
      >
        <EnlaceBoton to={RUTA_PROYECTOS}>Explorar proyectos</EnlaceBoton>
      </EstadoVacio>
    );
  }
  return (
    <ul className={estilos.lista} aria-label="Tus solicitudes de ingreso">
      {consulta.solicitudes.map((solicitud) => {
        const nombre = solicitud.colectivo?.nombre ?? "Colectivo sin nombre disponible";
        const fecha = solicitud.fechaSolicitud ?? solicitud.createdAt;
        return (
          <li key={solicitud.id} className={estilos.fila}>
            <h3>
              <Link to={rutaColectivo(solicitud.colectivo.id)}>{nombre}</Link>
            </h3>
            <p>
              <strong>{nombreDelEstadoDeSolicitud(solicitud.estado)}</strong>
              {fecha && Number.isFinite(Date.parse(fecha)) && (
                <>
                  {" "}
                  · <time dateTime={fecha}>{fechaLarga(fecha)}</time>
                </>
              )}
            </p>
            {solicitud.estado === ESTADO_SOLICITUD.PENDIENTE && (
              <div className={estilos.acciones}>
                <Boton
                  variante="peligroso"
                  disabled={consulta.procesando}
                  onClick={() => alCancelar(solicitud)}
                  aria-label={`Cancelar la solicitud a ${nombre}`}
                >
                  Cancelar
                </Boton>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
