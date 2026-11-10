import { useCallback, useRef, useState } from "react";
import { PERMISO } from "@/Application/Domain/Enums/PERMISO.js";
import { ROL_EN_CONTEXTO } from "@/Application/Domain/Enums/ROL_EN_CONTEXTO.js";
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
import { AbandonarColectivo } from "@/Presentation/Components/Membresia/AbandonarColectivo.jsx";
import {
  mensajeDeMembresia,
  nombreDelRol,
  nombreDePersona,
} from "@/Presentation/Formatos/membresia.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useMiembros } from "@/Presentation/Hooks/membresia/useMiembros.js";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import estilos from "./MiembrosPage.module.css";

const ACCIONES = Object.freeze({
  quitar: {
    texto: "Quitar del colectivo",
    titulo: (nombre) => `¿Quitar a ${nombre} del colectivo?`,
    descripcion:
      "Deja de poder operar como parte del colectivo. Si más adelante quiere volver, tiene que pedir el ingreso otra vez.",
    resultado: "Quitaste a la persona del colectivo.",
    fallo: "No pudimos quitar a la persona. Probá de nuevo.",
    permanente: true,
  },
  transferir: {
    texto: "Pasar el liderazgo",
    titulo: (nombre) => `¿Pasarle el liderazgo a ${nombre}?`,
    descripcion:
      "Vas a seguir en el colectivo como miembro y ya no vas a poder editar sus datos, resolver solicitudes ni quitar personas.",
    resultado: "Pasaste el liderazgo.",
    fallo: "No pudimos pasar el liderazgo. Probá de nuevo.",
    permanente: true,
  },
});

export default function MiembrosPage() {
  const { usuario } = useAuth();
  return <Miembros key={usuario.perfilId} usuario={usuario} />;
}

function Miembros({ usuario }) {
  const { recargarCuenta } = useAuth();
  const avisar = useAvisos();
  const colectivoId = usuario.perfilId;
  const consulta = useMiembros(colectivoId);
  const [confirmacion, setConfirmacion] = useState(null);
  const refTitulo = useRef(null);
  const enfocarTitulo = useCallback(() => refTitulo.current, []);
  const accion = confirmacion && ACCIONES[confirmacion.tipo];
  const puedeQuitar = tienePermiso(usuario, PERMISO.MIEMBRO_ELIMINAR);
  const puedeTransferir = tienePermiso(usuario, PERMISO.LIDER_ASIGNAR);
  const miContexto = usuario.contextoActual?.id ?? null;

  async function confirmar() {
    const resultado = await consulta.operar(
      confirmacion.tipo,
      confirmacion.miembro.contextoId,
    );
    if (!resultado) return;
    const tipo = confirmacion.tipo;
    setConfirmacion(null);
    if (!resultado.ok) {
      avisar.error(mensajeDeMembresia(resultado.error, accion.fallo));
      return;
    }
    avisar.exito(accion.resultado);
    if (tipo === "transferir") await recargarCuenta();
  }

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-miembros">
      <TituloDePagina>Miembros</TituloDePagina>
      <div>
        <h1 id="titulo-miembros" ref={refTitulo} tabIndex={-1}>
          Miembros
        </h1>
        <p>Las personas que hoy forman parte del colectivo.</p>
      </div>
      <Listado
        consulta={consulta}
        miContexto={miContexto}
        puedeQuitar={puedeQuitar}
        puedeTransferir={puedeTransferir}
        alElegir={(tipo, miembro) => setConfirmacion({ tipo, miembro })}
      />
      <AbandonarColectivo
        colectivoId={colectivoId}
        esLider={usuario.contextoActual?.rol === ROL_EN_CONTEXTO.LIDER}
      />
      <DialogoDeConfirmacion
        abierto={Boolean(accion)}
        titulo={accion?.titulo(nombreDePersona(confirmacion?.miembro.nombre))}
        descripcion={accion?.descripcion}
        textoConfirmar={accion?.texto}
        textoEnviando="Procesando…"
        permanente={Boolean(accion?.permanente)}
        peligroso={confirmacion?.tipo === "quitar"}
        enviando={consulta.procesando}
        destinoDeFoco={enfocarTitulo}
        alConfirmar={confirmar}
        alCancelar={() => setConfirmacion(null)}
      />
    </section>
  );
}

function Listado({ consulta, miContexto, puedeQuitar, puedeTransferir, alElegir }) {
  if (consulta.error) {
    return (
      <EstadoDeError
        titulo="No pudimos cargar los miembros"
        error={consulta.error}
        alReintentar={consulta.reintentar}
      />
    );
  }
  if (!consulta.miembros) {
    return (
      <Esqueleto etiqueta="Cargando miembros…">
        <BloqueEsqueleto alto="4rem" />
        <BloqueEsqueleto alto="4rem" />
      </Esqueleto>
    );
  }
  if (!consulta.miembros.length) {
    return (
      <EstadoVacio
        icono="personas"
        titulo="Todavía no hay miembros"
        descripcion="Cuando aceptes solicitudes de ingreso, las personas aparecen acá."
      />
    );
  }
  return (
    <ul className={estilos.lista} aria-label="Miembros del colectivo">
      {consulta.miembros.map((miembro) => {
        const soyYo = miembro.contextoId === miContexto;
        const esLider = miembro.rol === ROL_EN_CONTEXTO.LIDER;
        const nombre = nombreDePersona(miembro.nombre);
        return (
          <li key={miembro.contextoId} className={estilos.fila}>
            <h3>
              {nombre}
              {soyYo && " (vos)"}
            </h3>
            <p>{nombreDelRol(miembro.rol)}</p>
            {!soyYo && !esLider && (puedeQuitar || puedeTransferir) && (
              <div className={estilos.acciones}>
                {puedeTransferir && (
                  <Boton
                    disabled={consulta.procesando}
                    onClick={() => alElegir("transferir", miembro)}
                    aria-label={`Pasarle el liderazgo a ${nombre}`}
                  >
                    Pasar el liderazgo
                  </Boton>
                )}
                {puedeQuitar && (
                  <Boton
                    variante="peligroso"
                    disabled={consulta.procesando}
                    onClick={() => alElegir("quitar", miembro)}
                    aria-label={`Quitar a ${nombre} del colectivo`}
                  >
                    Quitar
                  </Boton>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
