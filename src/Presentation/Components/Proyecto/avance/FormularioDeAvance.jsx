import { useCallback, useId, useRef } from "react";
import { DialogoDeConfirmacion } from "@/Presentation/Components/App/dialogos/DialogoDeConfirmacion.jsx";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { Campo } from "@/Presentation/Components/App/ui/Campo.jsx";
import { ErrorDeAccion } from "@/Presentation/Components/Proyecto/avance/ErrorDeAccion.jsx";
import { textoDePorcentaje } from "@/Presentation/Formatos/avance.js";
import { useEnfocarPrimerError } from "@/Presentation/Hooks/comunes/useEnfocarPrimerError.js";
import estilos from "./FormularioDeAvance.module.css";

const CAMPO_CON_ERROR = '[aria-invalid="true"]';

function ayudaDelPorcentaje(actual) {
  return actual === null
    ? "Un número entre 0 y 100."
    : `Un número entre 0 y 100 que supere el avance actual: ${textoDePorcentaje(actual)}.`;
}

export function FormularioDeAvance({ registro, porcentajeActual }) {
  const idDeTitulo = useId();
  const refFormulario = useRef(null);
  const { valores, errores, errorDelServidor, ocupado, confirmando } = registro;
  useEnfocarPrimerError(refFormulario, registro.intentos, errorDelServidor);
  const primerCampoConError = useCallback(
    () => refFormulario.current?.querySelector(CAMPO_CON_ERROR),
    [],
  );

  function enviar(evento) {
    evento.preventDefault();
    registro.pedirConfirmacion();
  }

  return (
    <section className={estilos.seccion} aria-labelledby={idDeTitulo}>
      <h2 id={idDeTitulo}>Registrar un avance</h2>
      <form
        ref={refFormulario}
        noValidate
        className={estilos.formulario}
        onSubmit={enviar}
      >
        <Campo
          etiqueta="Porcentaje de avance"
          obligatorio
          inputMode="decimal"
          autoComplete="off"
          value={valores.porcentaje}
          ayuda={ayudaDelPorcentaje(porcentajeActual)}
          error={errores.porcentaje}
          disabled={ocupado}
          onChange={(evento) => registro.cambiar("porcentaje", evento.target.value)}
        />
        <Campo
          etiqueta="Dirección del sistema"
          obligatorio
          type="url"
          inputMode="url"
          autoComplete="off"
          value={valores.urlSistema}
          error={errores.urlSistema}
          disabled={ocupado}
          onChange={(evento) => registro.cambiar("urlSistema", evento.target.value)}
        />
        <Campo
          etiqueta="Dirección del repositorio"
          obligatorio
          type="url"
          inputMode="url"
          autoComplete="off"
          value={valores.urlRepositorio}
          error={errores.urlRepositorio}
          disabled={ocupado}
          onChange={(evento) => registro.cambiar("urlRepositorio", evento.target.value)}
        />
        {errorDelServidor && <ErrorDeAccion error={errorDelServidor} />}
        <Boton type="submit" variante="primario" disabled={ocupado}>
          Registrar avance
        </Boton>
      </form>
      <DialogoDeConfirmacion
        abierto={confirmando}
        titulo={`¿Registrar el avance: ${textoDePorcentaje(registro.porcentajeAConfirmar)}?`}
        descripcion="Un avance no se puede editar ni borrar, y el siguiente tiene que superarlo."
        textoConfirmar="Registrar avance"
        textoEnviando="Registrando…"
        enviando={ocupado}
        alConfirmar={registro.confirmar}
        alCancelar={registro.cancelar}
        destinoDeFoco={primerCampoConError}
      />
    </section>
  );
}
