import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { DialogoDeConfirmacion } from "@/Presentation/Components/App/dialogos/DialogoDeConfirmacion.jsx";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import { ResumenDeErrores } from "./ResumenDeErrores.jsx";
import estilos from "./Formulario.module.css";

export function PieDeFormularioDePerfil({
  formulario,
  esAlta,
  enviando,
  textoEnviar,
  textoEnviando,
  deshabilitado,
  motivoDeshabilitado,
}) {
  const { resumen, sinCampo, salida } = formulario;
  return (
    <>
      <ResumenDeErrores items={resumen} />

      {sinCampo && (
        <p role="alert" className={estilos.errorGeneral}>
          <Icono nombre="alerta" />
          {sinCampo}
        </p>
      )}

      <div className={estilos.acciones}>
        <Boton
          variante="primario"
          type="submit"
          enviando={enviando}
          textoEnviando={textoEnviando}
          disabled={deshabilitado}
          motivoDeshabilitado={motivoDeshabilitado}
        >
          {textoEnviar}
        </Boton>
      </div>

      <DialogoDeConfirmacion
        abierto={salida.preguntando}
        permanente={false}
        peligroso
        titulo="¿Salir sin guardar?"
        descripcion={
          esAlta
            ? "Los datos que cargaste se van a perder."
            : "Los cambios que hiciste en el perfil se van a perder."
        }
        textoConfirmar="Salir sin guardar"
        textoCancelar="Seguir editando"
        alConfirmar={salida.salir}
        alCancelar={salida.quedarse}
      />
    </>
  );
}
