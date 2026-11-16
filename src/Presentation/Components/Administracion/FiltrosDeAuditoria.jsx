import { useState } from "react";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { Campo } from "@/Presentation/Components/App/ui/Campo.jsx";
import { Selector } from "@/Presentation/Components/App/ui/Selector.jsx";
import {
  errorDeRangoDeFechas,
  OPCIONES_DE_ACCION,
  OPCIONES_DE_ENTIDAD,
} from "@/Presentation/Formatos/auditoria.js";
import { LARGO_MAXIMO_DE_ID } from "@/Presentation/Hooks/administracion/useParametrosDeAuditoria.js";
import estilos from "./FiltrosDeAuditoria.module.css";

export function FiltrosDeAuditoria({ filtros, hayFiltros, alAplicar, alLimpiar }) {
  const [borrador, setBorrador] = useState(filtros);
  const [errorDeFechas, setErrorDeFechas] = useState(null);

  function cambiar(campo) {
    return (evento) => {
      setBorrador((actual) => ({ ...actual, [campo]: evento.target.value }));
      setErrorDeFechas(null);
    };
  }

  function enviar(evento) {
    evento.preventDefault();
    const error = errorDeRangoDeFechas(borrador.desde, borrador.hasta);
    if (error) {
      setErrorDeFechas(error);
      return;
    }
    alAplicar({ ...borrador, entidadId: borrador.entidadId.trim() });
  }

  return (
    <form
      role="search"
      aria-label="Filtrar la auditoría"
      className={estilos.filtros}
      onSubmit={enviar}
    >
      <Selector
        etiqueta="Acción"
        textoVacio="Todas"
        opciones={OPCIONES_DE_ACCION}
        value={borrador.accion}
        onChange={cambiar("accion")}
      />
      <Selector
        etiqueta="Tipo de elemento"
        textoVacio="Todos"
        opciones={OPCIONES_DE_ENTIDAD}
        value={borrador.entidadTipo}
        onChange={cambiar("entidadTipo")}
      />
      <Campo
        etiqueta="Id del elemento"
        autoComplete="off"
        maxLength={LARGO_MAXIMO_DE_ID}
        value={borrador.entidadId}
        onChange={cambiar("entidadId")}
      />
      <Campo
        etiqueta="Desde"
        type="date"
        value={borrador.desde}
        onChange={cambiar("desde")}
      />
      <Campo
        etiqueta="Hasta"
        type="date"
        value={borrador.hasta}
        error={errorDeFechas}
        onChange={cambiar("hasta")}
      />
      <div className={estilos.acciones}>
        <Boton type="submit" variante="primario">
          Aplicar filtros
        </Boton>
        {hayFiltros && <Boton onClick={alLimpiar}>Limpiar filtros</Boton>}
      </div>
    </form>
  );
}
