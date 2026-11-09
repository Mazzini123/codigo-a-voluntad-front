import { Outlet, useParams } from "react-router-dom";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { useEsDuenoDelProyecto } from "@/Presentation/Hooks/proyecto/useEsDuenoDelProyecto.js";
import { SinPermisoPage } from "@/Presentation/Pages/sistema/SinPermisoPage.jsx";

export function RutaDelDueno({ sinPermiso }) {
  const { id } = useParams();
  const { esDueno, error, reintentar } = useEsDuenoDelProyecto(id);

  if (error) {
    return (
      <EstadoDeError
        nivel={1}
        titulo="No pudimos verificar el acceso"
        error={error}
        alReintentar={reintentar}
      />
    );
  }
  if (esDueno === null) {
    return (
      <Esqueleto etiqueta="Verificando el acceso al proyecto…">
        <BloqueEsqueleto alto="2rem" />
        <BloqueEsqueleto />
        <BloqueEsqueleto />
      </Esqueleto>
    );
  }
  if (!esDueno) return <SinPermisoPage>{sinPermiso}</SinPermisoPage>;
  return <Outlet />;
}
