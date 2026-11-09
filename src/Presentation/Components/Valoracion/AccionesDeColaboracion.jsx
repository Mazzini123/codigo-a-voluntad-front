import { useRef, useState } from "react";
import { COLABORACION_ESTADO } from "@/Application/Domain/Enums/COLABORACION_ESTADO.js";
import { ROL_CUENTA } from "@/Application/Domain/Enums/ROL_CUENTA.js";
import { AUTOR_VALORACION } from "@/Application/Domain/Enums/AUTOR_VALORACION.js";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useGestionarColaboracion } from "@/Presentation/Hooks/valoracion/useGestionarColaboracion.js";
import { validarValoracion } from "@/Presentation/Formularios/valoracion/validarValoracion.js";
import { DialogoDeConfirmacion } from "@/Presentation/Components/App/dialogos/DialogoDeConfirmacion.jsx";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { Campo } from "@/Presentation/Components/App/ui/Campo.jsx";
import { Selector } from "@/Presentation/Components/App/ui/Selector.jsx";
import estilos from "./Valoracion.module.css";

const PUNTAJES = [1, 2, 3, 4, 5].map((valor) => ({ valor, texto: `${valor} de 5` }));

export function AccionesDeColaboracion({
  proyectoId,
  colaboracion,
  alActualizar,
  ocupado = false,
}) {
  const { usuario } = useAuth();
  const avisar = useAvisos();
  const [accion, setAccion] = useState(null);
  const [puntaje, setPuntaje] = useState("");
  const [comentario, setComentario] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [actualizando, setActualizando] = useState(false);
  const [requiereActualizar, setRequiereActualizar] = useState(false);
  const refResultado = useRef(null);
  const mutacion = useGestionarColaboracion(proyectoId, colaboracion.id);
  const esColectivo = usuario?.rol === ROL_CUENTA.COLECTIVO;
  const valoracion = esColectivo
    ? colaboracion.valoracionDelColectivo
    : colaboracion.valoracionDelColaborador;
  const aceptada = colaboracion.estado === COLABORACION_ESTADO.ACEPTADA;
  const finalizada = colaboracion.estado === COLABORACION_ESTADO.FINALIZADA;
  const enviando = mutacion.enviando || actualizando;

  function abrir(tipo) {
    setMensaje(null);
    setPuntaje("");
    setComentario("");
    setAccion(tipo);
  }

  async function confirmar() {
    if (enviando) return;
    if (accion === "valorar") {
      const error = validarValoracion(puntaje, comentario);
      if (error) {
        setMensaje(error);
        return;
      }
    }
    setMensaje(null);
    const request = {
      autor: esColectivo ? AUTOR_VALORACION.COLECTIVO : AUTOR_VALORACION.COLABORADOR,
      puntaje: Number(puntaje),
      ...(comentario.trim() ? { comentario: comentario.trim() } : {}),
    };
    const resultado = await mutacion.ejecutar(accion, request);
    if (resultado.ignorada) return;
    if (resultado.ok || resultado.error?.status === 409) {
      setActualizando(true);
      const actualizado = await alActualizar();
      setActualizando(false);
      if (resultado.ok) {
        setRequiereActualizar(actualizado === false);
        setAccion(null);
        avisar.exito(
          `${accion === "finalizar" ? "Finalizaste la colaboración." : "Guardamos tu valoración."}${actualizado === false ? " No pudimos actualizar la lista; reintentá la consulta." : ""}`,
        );
        return;
      }
      if (actualizado !== false) {
        setAccion(null);
        avisar.info(
          "La colaboración cambió o esta parte ya la valoró. Revisá el estado actualizado.",
        );
        return;
      }
    }
    setMensaje(
      resultado.error?.status === 409
        ? "La colaboración cambió o ya fue valorada. No pudimos actualizarla; cerrá el diálogo y reintentá la consulta."
        : "No pudimos completar la acción. Probá de nuevo.",
    );
  }

  return (
    <div ref={refResultado} tabIndex={-1}>
      {valoracion && (
        <p>
          Tu valoración: <strong>{valoracion.puntaje} de 5</strong>
          {valoracion.comentario && (
            <span className={estilos.comentario}> · {valoracion.comentario}</span>
          )}
        </p>
      )}
      <div className={estilos.acciones}>
        {aceptada && (
          <Boton
            disabled={ocupado || enviando || requiereActualizar}
            onClick={() => abrir("finalizar")}
          >
            Finalizar colaboración
          </Boton>
        )}
        {finalizada && !valoracion && (
          <Boton
            disabled={ocupado || enviando || requiereActualizar}
            onClick={() => abrir("valorar")}
          >
            Valorar
          </Boton>
        )}
      </div>
      {requiereActualizar && (
        <p>
          La acción ya se realizó. Actualizá la lista antes de continuar.{" "}
          <Boton
            onClick={async () => {
              setActualizando(true);
              const actualizado = await alActualizar();
              setActualizando(false);
              if (actualizado !== false) setRequiereActualizar(false);
            }}
            enviando={actualizando}
            textoEnviando="Actualizando…"
          >
            Actualizar colaboración
          </Boton>
        </p>
      )}
      <DialogoDeConfirmacion
        abierto={Boolean(accion)}
        titulo={
          accion === "finalizar"
            ? "¿Finalizar la colaboración?"
            : esColectivo
              ? "Valorar a la persona colaboradora"
              : "Valorar al colectivo"
        }
        descripcion={
          accion === "finalizar"
            ? "La colaboración pasará al historial y ambas partes podrán valorarse. No finaliza el proyecto."
            : "Tu valoración es pública y solo podés enviarla una vez. Si tu contribución es anónima, tu nombre no se mostrará."
        }
        textoConfirmar={
          accion === "finalizar" ? "Finalizar colaboración" : "Enviar valoración"
        }
        textoEnviando="Guardando…"
        permanente
        peligroso={false}
        enviando={enviando}
        confirmarDeshabilitado={
          accion === "valorar" && Boolean(validarValoracion(puntaje, comentario))
        }
        alConfirmar={confirmar}
        alCancelar={() => setAccion(null)}
        destinoDeFoco={() => refResultado.current}
      >
        {accion === "valorar" && (
          <div className={estilos.formulario}>
            <Selector
              etiqueta="Puntaje"
              obligatorio
              opciones={PUNTAJES}
              textoVacio="Elegí un puntaje"
              value={puntaje}
              onChange={(evento) => setPuntaje(evento.target.value)}
              disabled={enviando}
            />
            <Campo
              etiqueta="Comentario"
              multilinea
              maxLength={280}
              ayuda="Opcional. Hasta 280 caracteres. Evitá incluir datos personales."
              value={comentario}
              onChange={(evento) => setComentario(evento.target.value)}
              disabled={enviando}
            />
          </div>
        )}
        {mensaje && (
          <p role="alert" className={estilos.error}>
            {mensaje}
          </p>
        )}
      </DialogoDeConfirmacion>
    </div>
  );
}
