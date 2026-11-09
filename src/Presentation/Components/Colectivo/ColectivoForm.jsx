import { PROVINCIAS } from "@/Application/Domain/Enums/PROVINCIAS.js";
import { Campo } from "@/Presentation/Components/App/ui/Campo.jsx";
import { GrupoDeOpciones } from "@/Presentation/Components/App/ui/GrupoDeOpciones.jsx";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import { Selector } from "@/Presentation/Components/App/ui/Selector.jsx";
import {
  TEXTO_TIPO_COLECTIVO,
  textoTipoColectivo,
} from "@/Presentation/Formatos/colectivo.js";
import {
  aRequest,
  cambios,
  erroresDesdeIssues,
  estadoInicial,
  OPCION_UBICACION,
} from "@/Presentation/Formularios/colectivo/formularioColectivo.js";
import {
  ListaDeTextos,
  MediosDeContacto,
  RedesSociales,
} from "@/Presentation/Components/Formulario/EditoresDeListas.jsx";
import estilos from "@/Presentation/Components/Formulario/Formulario.module.css";
import {
  validarColectivo,
  validarEtiqueta,
} from "@/Presentation/Formularios/colectivo/validarColectivo.js";
import { useFormularioDePerfil } from "@/Presentation/Hooks/perfil/useFormularioDePerfil.js";
import { PieDeFormularioDePerfil } from "@/Presentation/Components/Formulario/PieDeFormularioDePerfil.jsx";
import { AYUDA_MARKDOWN } from "@/Presentation/Formatos/markdown.js";

const OPCIONES_DE_TIPO = Object.entries(TEXTO_TIPO_COLECTIVO).map(([valor, texto]) => ({
  valor,
  texto,
}));

const OPCIONES_DE_UBICACION = [
  { valor: OPCION_UBICACION.PROVINCIA, texto: "Una provincia" },
  { valor: OPCION_UBICACION.LOCALIDAD, texto: "Una ciudad o barrio" },
  { valor: OPCION_UBICACION.CABA, texto: "Ciudad de Buenos Aires" },
  { valor: OPCION_UBICACION.ARGENTINA, texto: "Todo el país" },
  { valor: OPCION_UBICACION.NINGUNA, texto: "Prefiero no indicarla" },
];

const OPCIONES_DE_PROVINCIA = PROVINCIAS.map((provincia) => ({
  valor: provincia,
  texto: provincia,
}));

export function ColectivoForm({
  colectivo = null,
  esAlta,
  textoEnviar,
  textoEnviando,
  enviando,
  errorEnvio,
  alEnviar,
}) {
  const formulario = useFormularioDePerfil({
    crearEstadoInicial: () => estadoInicial(colectivo),
    validar: validarColectivo,
    cambios,
    aRequest,
    erroresDesdeIssues,
    esAlta,
    enviando,
    errorEnvio,
    alEnviar,
  });
  const { estado, setEstado, actualizar, idBase, idDe, refFormulario, errores } =
    formulario;

  function actualizarUbicacion(cambio) {
    setEstado((previo) => ({ ...previo, ubicacion: { ...previo.ubicacion, ...cambio } }));
  }

  return (
    <form
      ref={refFormulario}
      noValidate
      onSubmit={formulario.enviar}
      className={estilos.formulario}
    >
      <fieldset disabled={enviando} className={estilos.campos}>
        <fieldset className={estilos.seccion}>
          <legend>Datos del colectivo</legend>
          <Campo
            id={idDe("nombre")}
            etiqueta="Nombre"
            obligatorio
            autoComplete="organization"
            value={estado.nombre}
            error={errores.nombre}
            onChange={(e) => actualizar({ nombre: e.target.value })}
          />
          {esAlta ? (
            <GrupoDeOpciones
              id={idDe("tipoColectivo")}
              leyenda="Tipo de colectivo"
              obligatorio
              opciones={OPCIONES_DE_TIPO}
              valor={estado.tipoColectivo}
              error={errores.tipoColectivo}
              ayuda="No se puede cambiar después."
              alCambiar={(tipoColectivo) => actualizar({ tipoColectivo })}
            />
          ) : (
            <div className={estilos.tipoFijo}>
              <p>Tipo: {textoTipoColectivo(estado.tipoColectivo)}</p>
              <p className={estilos.texto}>El tipo no se puede cambiar.</p>
            </div>
          )}
          <Campo
            id={idDe("descripcion")}
            etiqueta="Descripción"
            obligatorio
            multilinea
            rows={4}
            ayuda={`Contá a qué se dedican y con quiénes trabajan. ${AYUDA_MARKDOWN}`}
            value={estado.descripcion}
            error={errores.descripcion}
            onChange={(e) => actualizar({ descripcion: e.target.value })}
          />
        </fieldset>

        <fieldset className={estilos.seccion}>
          <legend>Ubicación</legend>
          <GrupoDeOpciones
            id={idDe("ubicacion")}
            leyenda="¿Dónde trabajan?"
            opciones={OPCIONES_DE_UBICACION}
            valor={estado.ubicacion.opcion}
            error={errores.ubicacion}
            alCambiar={(opcion) => actualizarUbicacion({ opcion })}
          />
          {estado.ubicacion.opcion === OPCION_UBICACION.PROVINCIA && (
            <Selector
              id={idDe("ubicacion.provincia")}
              etiqueta="Provincia"
              obligatorio
              textoVacio="Elegí una provincia"
              opciones={OPCIONES_DE_PROVINCIA}
              value={estado.ubicacion.provincia}
              error={errores["ubicacion.provincia"]}
              onChange={(e) => actualizarUbicacion({ provincia: e.target.value })}
            />
          )}
          {estado.ubicacion.opcion === OPCION_UBICACION.LOCALIDAD && (
            <Campo
              id={idDe("ubicacion.localidad")}
              etiqueta="Ciudad o barrio"
              obligatorio
              ayuda="Por ejemplo: Villa Fiorito, Lomas de Zamora."
              value={estado.ubicacion.localidad}
              error={errores["ubicacion.localidad"]}
              onChange={(e) => actualizarUbicacion({ localidad: e.target.value })}
            />
          )}
        </fieldset>

        <fieldset className={estilos.seccion}>
          <legend>Medios de contacto</legend>
          <p className={estilos.privacidad}>
            <Icono nombre="info" />
            {esAlta
              ? "Los medios de contacto no se muestran en tu perfil público."
              : "Por ahora no podés editar los medios de contacto desde acá."}
          </p>
          {esAlta && (
            <MediosDeContacto
              prefijoDeIds={idBase}
              items={estado.mediosDeContacto}
              errores={errores}
              alCambiar={(mediosDeContacto) => actualizar({ mediosDeContacto })}
            />
          )}
        </fieldset>

        <fieldset className={estilos.seccion}>
          <legend>Redes sociales</legend>
          <RedesSociales
            prefijoDeIds={idBase}
            items={estado.redesSociales}
            errores={errores}
            alCambiar={(redesSociales) => actualizar({ redesSociales })}
          />
        </fieldset>

        <fieldset className={estilos.seccion}>
          <legend>Etiquetas</legend>
          <ListaDeTextos
            textos={estado.etiquetas}
            etiqueta="Nueva etiqueta"
            ayuda="Sirven para que te encuentren en la búsqueda."
            nombreDeLista="Etiquetas agregadas"
            textoQuitar="Quitar etiqueta"
            validar={validarEtiqueta}
            alCambiar={(etiquetas) => actualizar({ etiquetas })}
          />
        </fieldset>
      </fieldset>

      <PieDeFormularioDePerfil
        formulario={formulario}
        esAlta={esAlta}
        enviando={enviando}
        textoEnviar={textoEnviar}
        textoEnviando={textoEnviando}
        deshabilitado={!esAlta && !formulario.hayCambios}
        motivoDeshabilitado="No hay cambios para guardar."
      />
    </form>
  );
}
