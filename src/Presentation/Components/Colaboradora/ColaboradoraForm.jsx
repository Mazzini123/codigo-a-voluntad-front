import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Boton } from "../App/Boton.jsx";
import { Campo } from "../App/Campo.jsx";
import { Casilla } from "../App/Casilla.jsx";
import { ConfirmDialog } from "../App/ConfirmDialog.jsx";
import { GrupoDeOpciones } from "../App/GrupoDeOpciones.jsx";
import { Icono } from "../App/Icono.jsx";
import {
  ListaDeTextos,
  MediosDeContacto,
  RedesSociales,
} from "../Formulario/EditoresDeListas.jsx";
import { idDeCampo } from "../Formulario/formulario.js";
import estilos from "../Formulario/Formulario.module.css";
import { ResumenDeErrores } from "../Formulario/ResumenDeErrores.jsx";
import { itemsDelResumen } from "../Formulario/resumenDeErrores.js";
import { SelectorDeHabilidades } from "../Formulario/SelectorDeHabilidades.jsx";
import { nombreVisible } from "../../Formatos/colaboradora.js";
import { useAvisoCambiosSinGuardar } from "../../Hooks/useAvisoCambiosSinGuardar.js";
import {
  aRequestAlta,
  cambios,
  erroresDesdeIssues,
  estadoInicial,
  IDENTIFICACION,
} from "./formularioColaboradora.js";
import {
  MAXIMO_PRONOMBRES,
  validarColaboradora,
  validarPronombre,
} from "./validarColaboradora.js";

const OPCIONES_DE_IDENTIFICACION = [
  { valor: IDENTIFICACION.FANTASIA, texto: "Con un nombre de fantasía" },
  { valor: IDENTIFICACION.NOMBRE, texto: "Con mi nombre y apellido" },
];

export function ColaboradoraForm({
  colaboradora = null,
  esAlta,
  catalogo,
  textoEnviar,
  textoEnviando,
  enviando,
  errorEnvio,
  alEnviar,
}) {
  const [original] = useState(() => estadoInicial(colaboradora));
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
    const locales = Object.entries(validarColaboradora(estado, { esAlta })).filter(
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

  function enviar(evento) {
    evento.preventDefault();
    if (enviando) return;
    const encontrados = validarColaboradora(estado, { esAlta });
    if (Object.keys(encontrados).length > 0) {
      setVisibles(new Set(Object.keys(encontrados)));
      setPedidoDeFoco((pedido) => pedido + 1);
      return;
    }
    alEnviar(esAlta ? aRequestAlta(estado) : pendientes);
  }

  const sinCatalogo = esAlta && catalogo.habilidades?.length === 0;

  return (
    <form ref={refFormulario} noValidate onSubmit={enviar} className={estilos.formulario}>
      <fieldset disabled={enviando} className={estilos.campos}>
        <fieldset className={estilos.seccion}>
          <legend>Cómo te presentás</legend>
          {esAlta ? (
            <>
              <GrupoDeOpciones
                id={idDe("identificacion")}
                leyenda="¿Cómo querés que te vean?"
                obligatorio
                opciones={OPCIONES_DE_IDENTIFICACION}
                valor={estado.identificacion}
                error={errores.identificacion}
                ayuda="No se puede cambiar después."
                alCambiar={(identificacion) => actualizar({ identificacion })}
              />
              {estado.identificacion === IDENTIFICACION.FANTASIA && (
                <Campo
                  id={idDe("nombreFantasia")}
                  etiqueta="Nombre de fantasía"
                  obligatorio
                  autoComplete="nickname"
                  value={estado.nombreFantasia}
                  error={errores.nombreFantasia}
                  onChange={(e) => actualizar({ nombreFantasia: e.target.value })}
                />
              )}
              {estado.identificacion === IDENTIFICACION.NOMBRE && (
                <>
                  <Campo
                    id={idDe("nombre")}
                    etiqueta="Nombre"
                    obligatorio
                    autoComplete="given-name"
                    value={estado.nombre}
                    error={errores.nombre}
                    onChange={(e) => actualizar({ nombre: e.target.value })}
                  />
                  <Campo
                    id={idDe("apellido")}
                    etiqueta="Apellido"
                    obligatorio
                    autoComplete="family-name"
                    value={estado.apellido}
                    error={errores.apellido}
                    onChange={(e) => actualizar({ apellido: e.target.value })}
                  />
                </>
              )}
              <Campo
                id={idDe("cuentaGit")}
                etiqueta="Cuenta de GitHub o GitLab"
                ayuda="Tu usuario o la dirección de tu perfil."
                autoComplete="off"
                value={estado.cuentaGit}
                error={errores.cuentaGit}
                onChange={(e) => actualizar({ cuentaGit: e.target.value })}
              />
            </>
          ) : (
            <div className={estilos.tipoFijo}>
              <p>
                Te ven como: {nombreVisible(colaboradora)}
                {colaboradora?.cuentaGit && ` · ${colaboradora.cuentaGit}`}
              </p>
              <p className={estilos.texto}>No se puede cambiar.</p>
            </div>
          )}
          <ListaDeTextos
            textos={estado.pronombres}
            etiqueta="Pronombres"
            ayuda="Por ejemplo: ella, elle."
            maximo={MAXIMO_PRONOMBRES}
            nombreDeLista="Pronombres agregados"
            textoQuitar="Quitar pronombre"
            validar={validarPronombre}
            alCambiar={(pronombres) => actualizar({ pronombres })}
          />
          <Campo
            id={idDe("presentacion")}
            etiqueta="Presentación"
            multilinea
            rows={4}
            ayuda="Contá en pocas líneas qué te gusta hacer."
            value={estado.presentacion}
            error={errores.presentacion}
            onChange={(e) => actualizar({ presentacion: e.target.value })}
          />
        </fieldset>

        {esAlta && (
          <SelectorDeHabilidades
            id={idDe("habilidades")}
            catalogo={catalogo}
            elegidas={estado.habilidades}
            obligatorio
            error={errores.habilidades}
            alMarcar={(habilidad) =>
              actualizar({ habilidades: [...estado.habilidades, habilidad] })
            }
            alDesmarcar={(habilidad) =>
              actualizar({
                habilidades: estado.habilidades.filter(
                  (otra) => otra.codigo !== habilidad.codigo,
                ),
              })
            }
          />
        )}

        <fieldset className={estilos.seccion}>
          <legend>Mensajes</legend>
          <Casilla
            etiqueta="Acepto que me contacten por mensajería interna cuando haya proyectos para mis habilidades."
            checked={estado.recibeMensajeriaInterna}
            onChange={(e) => actualizar({ recibeMensajeriaInterna: e.target.checked })}
          />
        </fieldset>

        {esAlta && (
          <fieldset className={estilos.seccion}>
            <legend>Medios de contacto</legend>
            <p className={estilos.privacidad}>
              <Icono nombre="info" />
              Los medios de contacto no se muestran en tu perfil público. Los ve un
              colectivo solo si acepta tu postulación.
            </p>
            <MediosDeContacto
              prefijoDeIds={idBase}
              items={estado.mediosDeContacto}
              errores={errores}
              alCambiar={(mediosDeContacto) => actualizar({ mediosDeContacto })}
            />
          </fieldset>
        )}

        <fieldset className={estilos.seccion}>
          <legend>Redes sociales</legend>
          <RedesSociales
            prefijoDeIds={idBase}
            items={estado.redesSociales}
            errores={errores}
            alCambiar={(redesSociales) => actualizar({ redesSociales })}
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
          disabled={sinCatalogo || (!esAlta && !hayCambios)}
          motivoDeshabilitado={
            sinCatalogo
              ? "No se puede crear el perfil hasta que haya habilidades en el catálogo."
              : "No hay cambios para guardar."
          }
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
