import { useCallback, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ESTADO_SOLICITUD } from "@/Application/Domain/Enums/ESTADO_SOLICITUD.js";
import { PERMISO } from "@/Application/Domain/Enums/PERMISO.js";
import { tienePermiso } from "@/Application/Domain/Reglas/permisos.js";
import { DialogoDeConfirmacion } from "@/Presentation/Components/App/dialogos/DialogoDeConfirmacion.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { EstadoVacio } from "@/Presentation/Components/App/estados/EstadoVacio.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { Selector } from "@/Presentation/Components/App/ui/Selector.jsx";
import {
  ESTADOS_DE_SOLICITUD,
  mensajeDeMembresia,
  nombreDelEstadoDeSolicitud,
  nombreDePersona,
} from "@/Presentation/Formatos/membresia.js";
import { fechaLarga } from "@/Presentation/Formatos/proyecto.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useSolicitudesDeIngreso } from "@/Presentation/Hooks/membresia/useSolicitudesDeIngreso.js";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import estilos from "./MiembrosPage.module.css";

const ACCIONES = Object.freeze({
  aceptar: {
    texto: "Aceptar",
    titulo: (nombre) => `¿Sumar a ${nombre} al colectivo?`,
    descripcion: "Va a poder ver el panel y gestionar los proyectos del colectivo.",
    resultado: "Aceptaste la solicitud.",
    fallo: "No pudimos aceptar la solicitud. Probá de nuevo.",
    permanente: false,
  },
  rechazar: {
    texto: "Rechazar",
    titulo: (nombre) => `¿Rechazar la solicitud de ${nombre}?`,
    descripcion: "La persona puede volver a pedir el ingreso más adelante.",
    resultado: "Rechazaste la solicitud.",
    fallo: "No pudimos rechazar la solicitud. Probá de nuevo.",
    permanente: true,
  },
});

const OPCIONES = Object.freeze([{ valor: "", texto: "Todas" }, ...ESTADOS_DE_SOLICITUD]);

function estadoDeLaUrl(valor) {
  if (valor === null) return ESTADO_SOLICITUD.PENDIENTE;
  return OPCIONES.some((opcion) => opcion.valor === valor)
    ? valor
    : ESTADO_SOLICITUD.PENDIENTE;
}

export default function SolicitudesDeIngresoPage() {
  const { usuario } = useAuth();
  if (!tienePermiso(usuario, PERMISO.MEMBRESIA_SOLICITUD_RESOLVER)) {
    return (
      <section className={estilos.pagina} aria-labelledby="titulo-solicitudes">
        <TituloDePagina>Solicitudes de ingreso</TituloDePagina>
        <h1 id="titulo-solicitudes" tabIndex={-1}>
          Solicitudes de ingreso
        </h1>
        <p>Solo quien tiene el liderazgo del colectivo puede revisar las solicitudes.</p>
      </section>
    );
  }
  return <Solicitudes key={usuario.perfilId} colectivoId={usuario.perfilId} />;
}

function Solicitudes({ colectivoId }) {
  const [parametros, setParametros] = useSearchParams();
  const estado = estadoDeLaUrl(parametros.get("estado"));
  const consulta = useSolicitudesDeIngreso(colectivoId, estado);
  const avisar = useAvisos();
  const [confirmacion, setConfirmacion] = useState(null);
  const refTitulo = useRef(null);
  const enfocarTitulo = useCallback(() => refTitulo.current, []);
  const accion = confirmacion && ACCIONES[confirmacion.tipo];

  function cambiarEstado(evento) {
    const siguientes = new URLSearchParams(parametros);
    siguientes.set("estado", evento.target.value);
    setParametros(siguientes);
  }

  async function confirmar() {
    const resultado = await consulta.resolver(
      confirmacion.tipo,
      confirmacion.solicitud.id,
    );
    if (!resultado) return;
    setConfirmacion(null);
    if (resultado.ok) avisar.exito(accion.resultado);
    else avisar.error(mensajeDeMembresia(resultado.error, accion.fallo));
  }

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-solicitudes">
      <TituloDePagina>Solicitudes de ingreso</TituloDePagina>
      <div>
        <h1 id="titulo-solicitudes" ref={refTitulo} tabIndex={-1}>
          Solicitudes de ingreso
        </h1>
        <p>Personas que pidieron sumarse al colectivo.</p>
      </div>
      <div className={estilos.filtro}>
        <Selector
          etiqueta="Estado de la solicitud"
          opciones={OPCIONES}
          value={estado}
          onChange={cambiarEstado}
          disabled={consulta.procesando}
        />
      </div>
      <Listado
        consulta={consulta}
        estado={estado}
        alElegir={(tipo, solicitud) => setConfirmacion({ tipo, solicitud })}
      />
      <DialogoDeConfirmacion
        abierto={Boolean(accion)}
        titulo={accion?.titulo(nombreDePersona(confirmacion?.solicitud.usuario?.nombre))}
        descripcion={accion?.descripcion}
        textoConfirmar={accion?.texto}
        textoEnviando="Procesando…"
        permanente={Boolean(accion?.permanente)}
        enviando={consulta.procesando}
        destinoDeFoco={enfocarTitulo}
        alConfirmar={confirmar}
        alCancelar={() => setConfirmacion(null)}
      />
    </section>
  );
}

function Listado({ consulta, estado, alElegir }) {
  if (consulta.error) {
    return (
      <EstadoDeError
        titulo="No pudimos cargar las solicitudes"
        error={consulta.error}
        alReintentar={consulta.reintentar}
      />
    );
  }
  if (!consulta.solicitudes) {
    return (
      <Esqueleto etiqueta="Cargando solicitudes…">
        <BloqueEsqueleto alto="4rem" />
        <BloqueEsqueleto alto="4rem" />
      </Esqueleto>
    );
  }
  if (!consulta.solicitudes.length) {
    return estado === ESTADO_SOLICITUD.PENDIENTE ? (
      <EstadoVacio
        icono="personas"
        titulo="No hay solicitudes pendientes"
        descripcion="Cuando alguien pida sumarse al colectivo, la solicitud aparece acá."
      />
    ) : (
      <p>No hay solicitudes con este estado.</p>
    );
  }
  return (
    <ul className={estilos.lista} aria-label="Solicitudes de ingreso">
      {consulta.solicitudes.map((solicitud) => {
        const nombre = nombreDePersona(solicitud.usuario?.nombre);
        const fecha = solicitud.fechaSolicitud ?? solicitud.createdAt;
        return (
          <li key={solicitud.id} className={estilos.fila}>
            <h3>{nombre}</h3>
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
                  disabled={consulta.procesando}
                  onClick={() => alElegir("aceptar", solicitud)}
                  aria-label={`Aceptar a ${nombre}`}
                >
                  Aceptar
                </Boton>
                <Boton
                  variante="peligroso"
                  disabled={consulta.procesando}
                  onClick={() => alElegir("rechazar", solicitud)}
                  aria-label={`Rechazar a ${nombre}`}
                >
                  Rechazar
                </Boton>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
