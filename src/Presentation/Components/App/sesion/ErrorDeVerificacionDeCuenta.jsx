import { useSesion } from "@/Presentation/Hooks/sesion/useSesion.js";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import estilos from "./ErrorDeVerificacionDeCuenta.module.css";

const TITULO = "No pudimos verificar tu sesión";

export function ErrorDeVerificacionDeCuenta() {
  const { errorDeCuenta, reintentarCuenta } = useSesion();

  return (
    <div className={estilos.contenedor}>
      <TituloDePagina>{TITULO}</TituloDePagina>
      <EstadoDeError
        nivel={1}
        titulo={TITULO}
        error={errorDeCuenta}
        alReintentar={reintentarCuenta}
      />
    </div>
  );
}
