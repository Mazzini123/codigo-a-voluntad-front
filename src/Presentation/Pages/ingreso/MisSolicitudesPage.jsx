import { useCallback, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { registroIncompleto } from "@/Application/Domain/Reglas/registro.js";
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
import { SelloDeBusqueda } from "@/Presentation/Components/Proyecto/SelloDeBusqueda.jsx";
import {
  mensajeDeMembresia,
  selloDeSolicitud,
  textoDeRevisionSinNovedades,
} from "@/Presentation/Formatos/membresia.js";
import { fechaLarga } from "@/Presentation/Formatos/proyecto.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { useEsperaDeIngreso } from "@/Presentation/Hooks/membresia/useEsperaDeIngreso.js";
import { useMisSolicitudesDeIngreso } from "@/Presentation/Hooks/membresia/useMisSolicitudesDeIngreso.js";
import {
  rutaColectivo,
  RUTA_ALTA_COLECTIVO,
  RUTA_BIENVENIDA,
  RUTA_PROYECTOS,
  RUTA_UNIRME_A_COLECTIVO,
} from "@/Presentation/Routes/rutas.js";
import estilos from "./MisSolicitudesPage.module.css";

const BAJADA_DE_LA_ESPERA =
  "Quienes coordinan el colectivo revisan tu pedido. Cuando lo acepten, vas a entrar directo la próxima vez que ingreses. Podés cerrar esta página y volver cuando quieras.";

export default function MisSolicitudesPage() {
  const consulta = useMisSolicitudesDeIngreso();
  const { usuario } = useAuth();
  const espera = useEsperaDeIngreso();
  const enRegistro = registroIncompleto(usuario);
  const avisar = useAvisos();
  const [aCancelar, setACancelar] = useState(null);
  const refTitulo = useRef(null);
  const enfocarTitulo = useCallback(() => refTitulo.current, []);

  async function confirmar() {
    const resultado = await consulta.cancelar(aCancelar);
    if (!resultado) return;
    setACancelar(null);
    if (resultado.ok) {
      avisar.exito("Cancelaste la solicitud.");
      if (espera.enEspera) await espera.volverAElegir();
    } else
      avisar.error(
        mensajeDeMembresia(
          resultado.error,
          "No pudimos cancelar la solicitud. Probá de nuevo.",
        ),
      );
  }

  async function actualizar() {
    await Promise.all([espera.actualizar(), consulta.reintentar()]);
  }

  if (espera.destino) return <Navigate to={espera.destino} replace />;

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-mis-solicitudes">
      <TituloDePagina>
        {espera.enEspera ? "Esperando que te acepten" : "Mis solicitudes"}
      </TituloDePagina>
      <div className={estilos.titulos}>
        <h1 id="titulo-mis-solicitudes" ref={refTitulo} tabIndex={-1}>
          {espera.enEspera ? "Esperando que te acepten" : "Mis solicitudes"}
        </h1>
        <p className={estilos.bajada}>
          {espera.enEspera
            ? BAJADA_DE_LA_ESPERA
            : "Los colectivos a los que pediste sumarte."}
        </p>
      </div>
      {espera.enEspera && (
        <div className={estilos.revision}>
          <Boton
            variante="primario"
            enviando={espera.actualizando}
            textoEnviando="Actualizando…"
            onClick={actualizar}
          >
            Actualizar
          </Boton>
          <p role="status" className={estilos.sinNovedades}>
            {espera.revisadoA ? textoDeRevisionSinNovedades(espera.revisadoA) : ""}
          </p>
        </div>
      )}
      <Listado consulta={consulta} alCancelar={setACancelar} enRegistro={enRegistro} />
      {espera.enEspera && (
        <div className={estilos.acciones}>
          <EnlaceBoton to={RUTA_UNIRME_A_COLECTIVO}>
            Pedir sumarme a otro colectivo
          </EnlaceBoton>
          <EnlaceBoton to={RUTA_ALTA_COLECTIVO}>Crear mi propio colectivo</EnlaceBoton>
        </div>
      )}
      {enRegistro && !espera.enEspera && (
        <div className={estilos.acciones}>
          <EnlaceBoton to={RUTA_BIENVENIDA}>Elegir cómo registrarme</EnlaceBoton>
        </div>
      )}
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

function Listado({ consulta, alCancelar, enRegistro }) {
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
        descripcion={
          enRegistro
            ? "Cuando pidas sumarte a uno, vas a ver acá cómo va tu pedido."
            : "Desde el perfil de un colectivo podés pedir el ingreso."
        }
      >
        {!enRegistro && <EnlaceBoton to={RUTA_PROYECTOS}>Explorar proyectos</EnlaceBoton>}
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
            <p className={estilos.estado}>
              <SelloDeBusqueda estado={selloDeSolicitud(solicitud.estado)} />
              {fecha && Number.isFinite(Date.parse(fecha)) && (
                <time dateTime={fecha}>{fechaLarga(fecha)}</time>
              )}
            </p>
            {enRegistro && solicitud.estado === ESTADO_SOLICITUD.RECHAZADA && (
              <p className={estilos.ayuda}>
                Podés pedir sumarte a otro colectivo o crear el tuyo.
              </p>
            )}
            {solicitud.estado === ESTADO_SOLICITUD.PENDIENTE && (
              <div className={estilos.acciones}>
                <Boton
                  variante="peligroso"
                  disabled={consulta.procesando}
                  onClick={() => alCancelar(solicitud)}
                  aria-label={`Cancelar la solicitud a ${nombre}`}
                >
                  Cancelar la solicitud
                </Boton>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
