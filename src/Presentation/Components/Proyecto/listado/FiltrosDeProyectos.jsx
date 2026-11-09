import { MODALIDAD_COLABORACION } from "@/Application/Domain/Enums/MODALIDAD_COLABORACION.js";
import { PROYECTO_ESTADO } from "@/Application/Domain/Enums/PROYECTO_ESTADO.js";
import { TIPO_COLECTIVO } from "@/Application/Domain/Enums/TIPO_COLECTIVO.js";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { Selector } from "@/Presentation/Components/App/ui/Selector.jsx";
import { TEXTO_TIPO_COLECTIVO } from "@/Presentation/Formatos/colectivo.js";
import { TEXTO_MODALIDAD } from "@/Presentation/Formatos/proyecto.js";
import { useProvincias } from "@/Presentation/Hooks/colectivo/useProvincias.js";
import { useCatalogoDeHabilidades } from "@/Presentation/Hooks/habilidad/useCatalogoDeHabilidades.js";
import estilos from "./FiltrosDeProyectos.module.css";

const ESTADOS = [
  { valor: PROYECTO_ESTADO.ABIERTO, texto: "Abiertos" },
  { valor: PROYECTO_ESTADO.FINALIZADO, texto: "Finalizados" },
];

const TIPOS = Object.values(TIPO_COLECTIVO).map((valor) => ({
  valor,
  texto: TEXTO_TIPO_COLECTIVO[valor],
}));

const MODALIDADES = Object.values(MODALIDAD_COLABORACION).map((valor) => ({
  valor,
  texto: TEXTO_MODALIDAD[valor],
}));

export function FiltrosDeProyectos({ filtros, alCambiar, alLimpiar, hayFiltros }) {
  const { habilidades } = useCatalogoDeHabilidades();
  const provincias = useProvincias();
  const opcionesDeHabilidades = (habilidades ?? []).map(({ codigo, titulo }) => ({
    valor: codigo,
    texto: titulo,
  }));

  function selector(nombre, etiqueta, opciones) {
    return (
      <Selector
        etiqueta={etiqueta}
        textoVacio="Todos"
        opciones={opciones}
        value={filtros[nombre]}
        onChange={(evento) => alCambiar(nombre, evento.target.value)}
      />
    );
  }

  return (
    <form
      role="group"
      aria-label="Filtrar proyectos"
      className={estilos.filtros}
      onSubmit={(evento) => evento.preventDefault()}
    >
      {selector("estado", "Estado", ESTADOS)}
      {selector("habilidad", "Habilidad", opcionesDeHabilidades)}
      {selector("tipoColectivo", "Tipo de colectivo", TIPOS)}
      {selector("ubicacion", "Provincia", provincias)}
      {selector("modalidad", "Modalidad", MODALIDADES)}
      {hayFiltros && (
        <div className={estilos.limpiar}>
          <Boton onClick={alLimpiar}>Limpiar filtros</Boton>
        </div>
      )}
    </form>
  );
}
