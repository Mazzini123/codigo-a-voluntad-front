import { useEffect, useId, useMemo, useRef, useState } from "react";
import { PROVINCIAS } from "../../../Application/Domain/Enums/PROVINCIAS.js";
import { Boton } from "../App/Boton.jsx";
import { Campo } from "../App/Campo.jsx";
import { ConfirmDialog } from "../App/ConfirmDialog.jsx";
import { GrupoDeOpciones } from "../App/GrupoDeOpciones.jsx";
import { Icono } from "../App/Icono.jsx";
import { Selector } from "../App/Selector.jsx";
import { TEXTO_TIPO_COLECTIVO, textoTipoColectivo } from "../../Formatos/colectivo.js";
import { useAvisoCambiosSinGuardar } from "../../Hooks/useAvisoCambiosSinGuardar.js";
import {
  aRequest,
  cambios,
  erroresDesdeIssues,
  estadoInicial,
  OPCION_UBICACION,
} from "./formularioColectivo.js";
import {
  ListaDeTextos,
  MediosDeContacto,
  RedesSociales,
} from "../Formulario/EditoresDeListas.jsx";
import { idDeCampo } from "../Formulario/formulario.js";
import estilos from "../Formulario/Formulario.module.css";
import { ResumenDeErrores } from "../Formulario/ResumenDeErrores.jsx";
import { itemsDelResumen } from "../Formulario/resumenDeErrores.js";
import { validarColectivo, validarEtiqueta } from "./validarColectivo.js";

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
  const [original] = useState(() => estadoInicial(colectivo));
  const [estado, setEstado] = useState(original);
  const [visibles, setVisibles] = useState(() => new Set());
  const [pedidoDeFoco, setPedidoDeFoco] = useState(0);
  const refFormulario = useRef(null);
  const idBase = useId();
  const idDe = (clave) => idDeCampo(idBase, clave);

  const pendientes = useMemo(() => cambios(original, estado), [original, estado]);
  const hayCambios = Object.keys(pendientes).length > 0;
  const haySinGuardar = esAlta
    ? JSON.stringify(original) !== JSON.stringify(estado)
    : hayCambios;
  const salida = useAvisoCambiosSinGuardar(haySinGuardar && !enviando);

  const deServidor = useMemo(
    () => erroresDesdeIssues(errorEnvio?.issues, estado).errores,
    [errorEnvio, estado],
  );
  const errores = useMemo(() => {
    const locales = Object.entries(validarColectivo(estado, { esAlta })).filter(
      ([clave]) => visibles.has(clave),
    );
    return { ...deServidor, ...Object.fromEntries(locales) };
  }, [deServidor, estado, esAlta, visibles]);

  const sinCampo =
    errorEnvio && Object.keys(deServidor).length === 0 ? errorEnvio.mensaje : null;
  const resumen = useMemo(
    () => itemsDelResumen(errores, estado, idBase),
    [errores, estado, idBase],
  );

  useEffect(() => {
    if (pedidoDeFoco === 0 && !errorEnvio) return;
    refFormulario.current?.querySelector('[aria-invalid="true"]')?.focus();
  }, [pedidoDeFoco, errorEnvio]);

  function actualizar(cambio) {
    setEstado((previo) => ({ ...previo, ...cambio }));
  }

  function actualizarUbicacion(cambio) {
    setEstado((previo) => ({ ...previo, ubicacion: { ...previo.ubicacion, ...cambio } }));
  }

  function enviar(evento) {
    evento.preventDefault();
    if (enviando) return;
    const encontrados = validarColectivo(estado, { esAlta });
    if (Object.keys(encontrados).length > 0) {
      setVisibles(new Set(Object.keys(encontrados)));
      setPedidoDeFoco((pedido) => pedido + 1);
      return;
    }
    alEnviar(esAlta ? aRequest(estado) : pendientes);
  }

  return (
    <form ref={refFormulario} noValidate onSubmit={enviar} className={estilos.formulario}>
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
            ayuda="Contá a qué se dedican y con quiénes trabajan."
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
            Los medios de contacto no se muestran en tu perfil público.
          </p>
          <MediosDeContacto
            prefijoDeIds={idBase}
            items={estado.mediosDeContacto}
            errores={errores}
            alCambiar={(mediosDeContacto) => actualizar({ mediosDeContacto })}
          />
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
          disabled={!esAlta && !hayCambios}
          motivoDeshabilitado="No hay cambios para guardar."
        >
          {textoEnviar}
        </Boton>
      </div>

      <ConfirmDialog
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
    </form>
  );
}
