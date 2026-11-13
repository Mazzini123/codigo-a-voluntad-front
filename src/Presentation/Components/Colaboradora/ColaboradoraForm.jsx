import { Campo } from "@/Presentation/Components/App/ui/Campo.jsx";
import { Casilla } from "@/Presentation/Components/App/ui/Casilla.jsx";
import { GrupoDeOpciones } from "@/Presentation/Components/App/ui/GrupoDeOpciones.jsx";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import {
  ListaDeTextos,
  MediosDeContacto,
  RedesSociales,
} from "@/Presentation/Components/Formulario/EditoresDeListas.jsx";
import estilos from "@/Presentation/Components/Formulario/Formulario.module.css";
import { SelectorDeHabilidades } from "@/Presentation/Components/Formulario/SelectorDeHabilidades.jsx";
import { nombreVisible } from "@/Presentation/Formatos/colaboradora.js";
import {
  aRequestAlta,
  cambios,
  erroresDesdeIssues,
  estadoInicial,
  IDENTIFICACION,
} from "@/Presentation/Formularios/colaboradora/formularioColaboradora.js";
import {
  MAXIMO_PRONOMBRES,
  validarColaboradora,
  validarPronombre,
} from "@/Presentation/Formularios/colaboradora/validarColaboradora.js";
import { useFormularioDePerfil } from "@/Presentation/Hooks/perfil/useFormularioDePerfil.js";
import { PieDeFormularioDePerfil } from "@/Presentation/Components/Formulario/PieDeFormularioDePerfil.jsx";
import { MediosPrivadosDeLaColaboradora } from "@/Presentation/Components/Colaboradora/MediosPrivadosDeLaColaboradora.jsx";

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
  const formulario = useFormularioDePerfil({
    crearEstadoInicial: () => estadoInicial(colaboradora),
    validar: validarColaboradora,
    cambios,
    aRequest: aRequestAlta,
    erroresDesdeIssues,
    esAlta,
    enviando,
    errorEnvio,
    alEnviar,
  });
  const { estado, actualizar, idBase, idDe, refFormulario, errores } = formulario;

  const sinCatalogo = esAlta && catalogo.habilidades?.length === 0;

  return (
    <form
      ref={refFormulario}
      noValidate
      onSubmit={formulario.enviar}
      className={estilos.formulario}
    >
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
                etiqueta="Usuario de GitHub o GitLab"
                ayuda="Solo tu usuario, sin la dirección. Por ejemplo: mi-usuario."
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
            etiqueta="Acepto recibir notificaciones por mensajería interna y copias por los medios de contacto que registré (email, SMS o WhatsApp)."
            checked={estado.recibeMensajeriaInterna}
            onChange={(e) => actualizar({ recibeMensajeriaInterna: e.target.checked })}
          />
        </fieldset>

        <fieldset className={estilos.seccion}>
          <legend>Medios de contacto</legend>
          <p className={estilos.privacidad}>
            <Icono nombre="info" />
            Los medios de contacto no se muestran en tu perfil público. Los ve un
            colectivo solo si acepta tu postulación.
          </p>
          {esAlta ? (
            <MediosDeContacto
              prefijoDeIds={idBase}
              items={estado.mediosDeContacto}
              errores={errores}
              alCambiar={(mediosDeContacto) => actualizar({ mediosDeContacto })}
            />
          ) : (
            colaboradora?.id && (
              <MediosPrivadosDeLaColaboradora colaboradoraId={colaboradora.id} />
            )
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
      </fieldset>

      <PieDeFormularioDePerfil
        formulario={formulario}
        esAlta={esAlta}
        enviando={enviando}
        textoEnviar={textoEnviar}
        textoEnviando={textoEnviando}
        deshabilitado={sinCatalogo || (!esAlta && !formulario.hayCambios)}
        motivoDeshabilitado={
          sinCatalogo
            ? "No se puede crear el perfil hasta que haya habilidades en el catálogo."
            : "No hay cambios para guardar."
        }
      />
    </form>
  );
}
