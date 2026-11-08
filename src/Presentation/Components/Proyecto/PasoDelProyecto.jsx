import { useEffect, useRef, useState } from "react";
import { Boton } from "../App/Boton.jsx";
import { Campo } from "../App/Campo.jsx";
import { validarEtiqueta } from "../Colectivo/validarColectivo.js";
import { ListaDeTextos } from "../Formulario/EditoresDeListas.jsx";
import { idDeCampo } from "../Formulario/formulario.js";
import estilos from "../Formulario/Formulario.module.css";
import { ResumenDeErrores } from "../Formulario/ResumenDeErrores.jsx";
import { itemsDelResumenDelAlta } from "./formularioProyecto.js";
import { validarDatosDelProyecto } from "./validarProyecto.js";

export function PasoDelProyecto({
  idBase,
  refTitulo,
  proyecto,
  alCambiar,
  alSiguiente,
  fechaOriginal,
  enviando = false,
  textoAccion = "Siguiente",
}) {
  const [intento, setIntento] = useState(0);
  const refFormulario = useRef(null);
  const datosParaValidar =
    proyecto.fechaCierre === fechaOriginal ? { ...proyecto, fechaCierre: "" } : proyecto;
  const errores = intento > 0 ? validarDatosDelProyecto(datosParaValidar) : {};
  const resumen = itemsDelResumenDelAlta(errores, idBase);

  useEffect(() => {
    if (intento === 0) return;
    refFormulario.current?.querySelector('[aria-invalid="true"]')?.focus();
  }, [intento]);

  function enviar(evento) {
    evento.preventDefault();
    if (enviando) return;
    if (Object.keys(validarDatosDelProyecto(datosParaValidar)).length > 0) {
      setIntento((actual) => actual + 1);
      return;
    }
    alSiguiente();
  }

  return (
    <form ref={refFormulario} noValidate onSubmit={enviar} className={estilos.formulario}>
      <h2 ref={refTitulo} tabIndex={-1}>
        El proyecto
      </h2>
      <fieldset className={estilos.campos} disabled={enviando}>
        <Campo
          id={idDeCampo(idBase, "titulo")}
          etiqueta="Título"
          obligatorio
          value={proyecto.titulo}
          error={errores.titulo}
          onChange={(e) => alCambiar({ titulo: e.target.value })}
        />
        <Campo
          id={idDeCampo(idBase, "descripcion")}
          etiqueta="Descripción"
          obligatorio
          multilinea
          rows={5}
          ayuda="Contá qué problema quieren resolver y para quién."
          value={proyecto.descripcion}
          error={errores.descripcion}
          onChange={(e) => alCambiar({ descripcion: e.target.value })}
        />
        <fieldset className={estilos.seccion}>
          <legend>Etiquetas (opcional)</legend>
          <ListaDeTextos
            textos={proyecto.etiquetas}
            etiqueta="Nueva etiqueta"
            ayuda="Sirven para que las colaboradoras encuentren el proyecto."
            nombreDeLista="Etiquetas agregadas"
            textoQuitar="Quitar etiqueta"
            validar={validarEtiqueta}
            alCambiar={(etiquetas) => alCambiar({ etiquetas })}
          />
        </fieldset>
        <Campo
          id={idDeCampo(idBase, "fechaCierre")}
          etiqueta="Fecha de cierre del proyecto (opcional)"
          type="date"
          ayuda="Si la ponés, el proyecto se cierra solo ese día."
          value={proyecto.fechaCierre}
          error={errores.fechaCierre}
          onChange={(e) => alCambiar({ fechaCierre: e.target.value })}
        />
      </fieldset>

      <ResumenDeErrores items={resumen} />

      <div className={estilos.acciones}>
        <Boton
          variante="primario"
          type="submit"
          enviando={enviando}
          textoEnviando="Guardando…"
        >
          {textoAccion}
        </Boton>
      </div>
    </form>
  );
}
