import { useMemo } from "react";
import { MODALIDAD_COLABORACION } from "../../../Application/Domain/Enums/MODALIDAD_COLABORACION.js";
import { MODO_ACEPTACION } from "../../../Application/Domain/Enums/MODO_ACEPTACION.js";
import { PERIODO_COMPROMISO } from "../../../Application/Domain/Enums/PERIODO_COMPROMISO.js";
import { textoModalidad } from "../../Formatos/proyecto.js";
import { Boton } from "../App/Boton.jsx";
import { Campo } from "../App/Campo.jsx";
import { GrupoDeOpciones } from "../App/GrupoDeOpciones.jsx";
import { idDeCampo } from "../Formulario/formulario.js";
import estilos from "../Formulario/Formulario.module.css";
import { ResumenDeErrores } from "../Formulario/ResumenDeErrores.jsx";
import { SelectorDeHabilidades } from "../Formulario/SelectorDeHabilidades.jsx";
import { itemsDelResumenDelAlta } from "./formularioProyecto.js";

const OPCIONES_DE_PERIODO = [
  { valor: PERIODO_COMPROMISO.HS_SEMANALES, texto: "por semana" },
  { valor: PERIODO_COMPROMISO.HS_MENSUALES, texto: "por mes" },
  { valor: PERIODO_COMPROMISO.HS_TOTALES, texto: "en total" },
];

const OPCIONES_DE_MODALIDAD = Object.values(MODALIDAD_COLABORACION).map((valor) => ({
  valor,
  texto: textoModalidad(valor),
}));

const OPCIONES_DE_ACEPTACION = [
  { valor: MODO_ACEPTACION.REVISION_MANUAL, texto: "Reviso cada postulación" },
  { valor: MODO_ACEPTACION.TODO_SUMA, texto: "Acepto a todas las que se postulen" },
  {
    valor: MODO_ACEPTACION.HASTA_LLENAR_VACANTES,
    texto: "Acepto hasta completar un número de lugares",
  },
];

export function PerfilForm({
  idBase,
  borrador,
  errores,
  catalogo,
  esEdicion,
  puedeDescartar,
  alCambiar,
  alGuardar,
  alDescartar,
  refFormulario,
  enviando = false,
  textoGuardar = "Guardar perfil",
}) {
  const idDe = (clave) => idDeCampo(idBase, clave);
  const codigosRequeridas = useMemo(
    () => new Set(borrador.requeridas.map((habilidad) => habilidad.codigo)),
    [borrador.requeridas],
  );
  const codigosOpcionales = useMemo(
    () => new Set(borrador.opcionales.map((habilidad) => habilidad.codigo)),
    [borrador.opcionales],
  );
  const catalogoParaRequeridas = useMemo(
    () => ({
      ...catalogo,
      habilidades: catalogo.habilidades?.filter(
        (habilidad) => !codigosOpcionales.has(habilidad.codigo),
      ),
    }),
    [catalogo, codigosOpcionales],
  );
  const catalogoParaOpcionales = useMemo(
    () => ({
      ...catalogo,
      habilidades: catalogo.habilidades?.filter(
        (habilidad) => !codigosRequeridas.has(habilidad.codigo),
      ),
    }),
    [catalogo, codigosRequeridas],
  );
  const resumen = itemsDelResumenDelAlta(errores, idBase);
  const modo = borrador.modoAceptacion;

  function marcar(lista, habilidad) {
    alCambiar({
      [lista]: [
        ...borrador[lista],
        { codigo: habilidad.codigo, titulo: habilidad.titulo },
      ],
    });
  }

  function desmarcar(lista, habilidad) {
    alCambiar({
      [lista]: borrador[lista].filter((otra) => otra.codigo !== habilidad.codigo),
    });
  }

  function enviar(evento) {
    evento.preventDefault();
    if (!enviando) alGuardar();
  }

  return (
    <form ref={refFormulario} noValidate onSubmit={enviar} className={estilos.formulario}>
      <fieldset className={estilos.campos} disabled={enviando}>
        <legend className={estilos.leyendaDeFormulario}>
          {esEdicion ? "Editar perfil" : "Nuevo perfil"}
        </legend>

        <Campo
          id={idDe("perfil.descripcion")}
          etiqueta="Qué necesitan"
          obligatorio
          multilinea
          rows={4}
          ayuda="Contá qué tendría que hacer esta persona."
          value={borrador.descripcion}
          error={errores["perfil.descripcion"]}
          onChange={(e) => alCambiar({ descripcion: e.target.value })}
        />

        <SelectorDeHabilidades
          id={idDe("perfil.requeridas")}
          leyenda="Habilidades requeridas"
          etiquetaDeBusqueda="Buscar habilidad requerida"
          obligatorio
          catalogo={catalogoParaRequeridas}
          elegidas={borrador.requeridas}
          error={errores["perfil.requeridas"]}
          alMarcar={(habilidad) => marcar("requeridas", habilidad)}
          alDesmarcar={(habilidad) => desmarcar("requeridas", habilidad)}
        />

        <SelectorDeHabilidades
          id={idDe("perfil.opcionales")}
          leyenda="Habilidades opcionales"
          etiquetaDeBusqueda="Buscar habilidad opcional"
          catalogo={catalogoParaOpcionales}
          elegidas={borrador.opcionales}
          error={errores["perfil.opcionales"]}
          alMarcar={(habilidad) => marcar("opcionales", habilidad)}
          alDesmarcar={(habilidad) => desmarcar("opcionales", habilidad)}
        />

        <fieldset className={estilos.seccion}>
          <legend>Compromiso</legend>
          <Campo
            id={idDe("perfil.horas")}
            etiqueta="¿Cuántas horas?"
            obligatorio
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={borrador.horas}
            error={errores["perfil.horas"]}
            onChange={(e) => alCambiar({ horas: e.target.value })}
          />
          <GrupoDeOpciones
            id={idDe("perfil.periodo")}
            leyenda="Esas horas son"
            opciones={OPCIONES_DE_PERIODO}
            valor={borrador.periodo}
            alCambiar={(periodo) => alCambiar({ periodo })}
          />
        </fieldset>

        <GrupoDeOpciones
          id={idDe("perfil.modalidad")}
          leyenda="Modalidad"
          opciones={OPCIONES_DE_MODALIDAD}
          valor={borrador.modalidad}
          alCambiar={(modalidad) => alCambiar({ modalidad })}
        />

        <GrupoDeOpciones
          id={idDe("perfil.modoAceptacion")}
          leyenda="¿Cómo querés sumar colaboradoras?"
          opciones={OPCIONES_DE_ACEPTACION}
          valor={modo}
          alCambiar={(modoAceptacion) => alCambiar({ modoAceptacion })}
        />
        {modo === MODO_ACEPTACION.HASTA_LLENAR_VACANTES && (
          <Campo
            id={idDe("perfil.limite")}
            etiqueta="¿Cuántos lugares hay?"
            obligatorio
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={borrador.limite}
            error={errores["perfil.limite"]}
            onChange={(e) => alCambiar({ limite: e.target.value })}
          />
        )}
        {modo === MODO_ACEPTACION.REVISION_MANUAL && (
          <Campo
            id={idDe("perfil.limite")}
            etiqueta="¿Cuántas personas como máximo? (opcional)"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            ayuda="Si lo dejás vacío, no hay límite."
            value={borrador.limite}
            error={errores["perfil.limite"]}
            onChange={(e) => alCambiar({ limite: e.target.value })}
          />
        )}

        <Campo
          id={idDe("perfil.fechaCierreBusqueda")}
          etiqueta="Fecha de cierre de la búsqueda (opcional)"
          type="date"
          ayuda="Si la ponés, la búsqueda de este perfil se cierra ese día."
          value={borrador.fechaCierreBusqueda}
          error={errores["perfil.fechaCierreBusqueda"]}
          onChange={(e) => alCambiar({ fechaCierreBusqueda: e.target.value })}
        />
      </fieldset>

      <ResumenDeErrores items={resumen} />

      <div className={estilos.accionesDeFila}>
        <Boton
          variante="primario"
          type="submit"
          enviando={enviando}
          textoEnviando="Guardando…"
        >
          {textoGuardar}
        </Boton>
        {puedeDescartar && (
          <Boton onClick={alDescartar} disabled={enviando}>
            Descartar perfil
          </Boton>
        )}
      </div>
    </form>
  );
}
