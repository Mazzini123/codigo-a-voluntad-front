import { ROL_CUENTA } from "@/Application/Domain/Enums/ROL_CUENTA.js";
import { TIPO_CONTEXTO } from "@/Application/Domain/Enums/TIPO_CONTEXTO.js";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { RutaProtegida } from "./RutaProtegida.jsx";

const SOLO_ADMINISTRACION =
  "Esta sección es solo para la administración de la plataforma.";
const CAMBIAR_DE_CONTEXTO =
  "Estás operando con otro contexto. Cambiá a «Administración de la plataforma» desde «Mi cuenta» para entrar.";

export function RutaDeAdministracion() {
  const { usuario } = useAuth();
  const esAdministradora = (usuario?.contextos ?? []).some(
    ({ tipo }) => tipo === TIPO_CONTEXTO.ADMINISTRACION,
  );
  return (
    <RutaProtegida
      roles={[ROL_CUENTA.ADMINISTRACION]}
      sinPermiso={esAdministradora ? CAMBIAR_DE_CONTEXTO : SOLO_ADMINISTRACION}
    />
  );
}
