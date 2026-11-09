import { useCallback, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { PROYECTO_ESTADO } from "@/Application/Domain/Enums/PROYECTO_ESTADO.js";
import { DialogoDeConfirmacion } from "@/Presentation/Components/App/dialogos/DialogoDeConfirmacion.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { MensajeDePantalla } from "@/Presentation/Components/App/estados/MensajeDePantalla.jsx";
import { EnlaceVolver } from "@/Presentation/Components/App/navegacion/EnlaceVolver.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { EnlaceExterno } from "@/Presentation/Components/App/ui/EnlaceExterno.jsx";
import { leerUrlExterna } from "@/Presentation/Components/App/ui/urlExterna.js";
import { BarraDeAvance } from "@/Presentation/Components/Proyecto/avance/BarraDeAvance.jsx";
import { DialogoDeLogro } from "@/Presentation/Components/Proyecto/avance/DialogoDeLogro.jsx";
import { ErrorDeAccion } from "@/Presentation/Components/Proyecto/avance/ErrorDeAccion.jsx";
import { FormularioDeAvance } from "@/Presentation/Components/Proyecto/avance/FormularioDeAvance.jsx";
import { HistorialDeAvances } from "@/Presentation/Components/Proyecto/avance/HistorialDeAvances.jsx";
import { TarjetaDeLogro } from "@/Presentation/Components/Proyecto/avance/TarjetaDeLogro.jsx";
import estilosDePerfil from "@/Presentation/Components/Perfil/Perfil.module.css";
import {
  NOTA_DE_PROYECTO_FINALIZADO,
  porcentajeActual as calcularPorcentajeActual,
  TEXTO_SIN_LOGROS,
  tituloDelAvance,
} from "@/Presentation/Formatos/avance.js";
import { useAvanceDelProyecto } from "@/Presentation/Hooks/proyecto/useAvanceDelProyecto.js";
import { useEsDuenoDelProyecto } from "@/Presentation/Hooks/proyecto/useEsDuenoDelProyecto.js";
import { useGestionarLogros } from "@/Presentation/Hooks/proyecto/useGestionarLogros.js";
import { useRegistrarAvance } from "@/Presentation/Hooks/proyecto/useRegistrarAvance.js";
import {
  destinoDeVuelta,
  RUTA_PROYECTOS,
  rutaProyecto,
} from "@/Presentation/Routes/rutas.js";
import estilos from "./AvancePage.module.css";

export default function AvancePage() {
  const { id } = useParams();
  return <AvancePorId key={id} id={id} />;
}

function AvancePorId({ id }) {
  const { proyecto, logros, avances, error, cargando, reintentar } =
    useAvanceDelProyecto(id);

  if (error?.status === 404) {
    return (
      <MensajeDePantalla
        titulo="No encontramos este proyecto"
        tituloDePestana="Proyecto no encontrado"
        volverA={RUTA_PROYECTOS}
        textoVolver="Volver a la búsqueda"
      >
        Puede que el enlace esté mal escrito o que el proyecto ya no esté en la
        plataforma.
      </MensajeDePantalla>
    );
  }
  if (error && !proyecto) {
    return (
      <section className={estilosDePerfil.pagina}>
        <TituloDePagina>Avance del proyecto</TituloDePagina>
        <EstadoDeError
          nivel={1}
          titulo="No pudimos cargar el avance del proyecto"
          error={error}
          alReintentar={reintentar}
        />
      </section>
    );
  }
  if (cargando || !proyecto) return <EsqueletoDelAvance />;

  return (
    <AvanceDelProyecto
      id={id}
      proyecto={proyecto}
      logros={logros}
      avances={avances}
      errorDeRecarga={error}
      reintentar={reintentar}
    />
  );
}

function AvanceDelProyecto({
  id,
  proyecto,
  logros,
  avances,
  errorDeRecarga,
  reintentar,
}) {
  const location = useLocation();
  const refTitulo = useRef(null);
  const refCargarLogro = useRef(null);
  const dueno = useEsDuenoDelProyecto(proyecto.id);
  const abierto = proyecto.estado === PROYECTO_ESTADO.ABIERTO;
  const puedeEditar = dueno.esDueno === true && abierto;
  const notaDeFinalizado = dueno.esDueno === true && !abierto;
  const porcentaje = calcularPorcentajeActual(proyecto, avances);
  const gestion = useGestionarLogros(id, reintentar);
  const registro = useRegistrarAvance(id, reintentar, {
    porcentajeActual: porcentaje,
    urlSistema: proyecto.urlSistema ?? avances[0]?.urlSistema,
    urlRepositorio: proyecto.urlRepositorio ?? avances[0]?.urlRepositorio,
  });
  const volver = destinoDeVuelta(location, {
    a: rutaProyecto(id),
    texto: "Volver al proyecto",
  });
  const enfocarTitulo = useCallback(() => refTitulo.current, []);
  const enfocarCargarLogro = useCallback(() => refCargarLogro.current, []);
  const titulo = tituloDelAvance(proyecto.titulo);
  const eliminacion = gestion.eliminacion;
  const tieneSistema = Boolean(leerUrlExterna(proyecto.urlSistema));
  const tieneRepositorio = Boolean(leerUrlExterna(proyecto.urlRepositorio));
  const ocupado = gestion.ocupado || registro.ocupado;

  return (
    <article className={estilos.pagina} aria-labelledby="titulo-avance-del-proyecto">
      <TituloDePagina>{titulo}</TituloDePagina>
      <EnlaceVolver to={volver.a} state={volver.state}>
        {volver.texto}
      </EnlaceVolver>
      <h1 id="titulo-avance-del-proyecto" ref={refTitulo} tabIndex={-1}>
        {titulo}
      </h1>

      {errorDeRecarga && (
        <EstadoDeError
          titulo="No pudimos actualizar el avance"
          error={errorDeRecarga}
          alReintentar={reintentar}
        />
      )}
      {notaDeFinalizado && <p className={estilos.nota}>{NOTA_DE_PROYECTO_FINALIZADO}</p>}

      {(porcentaje !== null || tieneSistema || tieneRepositorio) && (
        <div className={estilosDePerfil.panel}>
          {porcentaje !== null && <BarraDeAvance porcentaje={porcentaje} />}
          {(tieneSistema || tieneRepositorio) && (
            <ul className={estilos.enlaces}>
              {tieneSistema && (
                <li>
                  <EnlaceExterno url={proyecto.urlSistema}>Ver el sistema</EnlaceExterno>
                </li>
              )}
              {tieneRepositorio && (
                <li>
                  <EnlaceExterno url={proyecto.urlRepositorio}>
                    Ver el repositorio
                  </EnlaceExterno>
                </li>
              )}
            </ul>
          )}
        </div>
      )}

      {puedeEditar && (
        <div className={estilosDePerfil.panel}>
          <FormularioDeAvance registro={registro} porcentajeActual={porcentaje} />
        </div>
      )}

      <section className={estilos.seccion} aria-labelledby="logros-del-proyecto">
        <div className={estilos.filaDeTitulo}>
          <h2 id="logros-del-proyecto">Logros</h2>
          {puedeEditar && logros.length > 0 && (
            <Boton
              ref={refCargarLogro}
              disabled={ocupado}
              onClick={() => gestion.abrir()}
            >
              Cargar un logro
            </Boton>
          )}
        </div>
        {logros.length === 0 ? (
          <div className={estilos.vacio}>
            <p>{TEXTO_SIN_LOGROS}</p>
            {puedeEditar && (
              <Boton disabled={ocupado} onClick={() => gestion.abrir()}>
                Cargar el primer logro
              </Boton>
            )}
          </div>
        ) : (
          <ul className={estilos.logros}>
            {logros.map((logro) => (
              <li key={logro.id}>
                <TarjetaDeLogro logro={logro}>
                  {puedeEditar && (
                    <>
                      <Boton
                        disabled={ocupado}
                        aria-label={`Editar el logro «${logro.titulo}»`}
                        onClick={() => gestion.abrir(logro)}
                      >
                        Editar
                      </Boton>
                      <Boton
                        variante="peligroso"
                        disabled={ocupado}
                        aria-label={`Eliminar el logro «${logro.titulo}»`}
                        onClick={() => gestion.pedirEliminacion(logro)}
                      >
                        Eliminar
                      </Boton>
                    </>
                  )}
                </TarjetaDeLogro>
              </li>
            ))}
          </ul>
        )}
      </section>

      <HistorialDeAvances avances={avances} />

      <DialogoDeLogro
        dialogo={gestion.dialogo}
        formulario={gestion.formulario}
        errores={gestion.errores}
        intentos={gestion.intentos}
        errorDelServidor={gestion.errorDelServidor}
        ocupado={gestion.ocupado}
        alCambiar={gestion.cambiar}
        alGuardar={gestion.guardar}
        alCancelar={gestion.cerrar}
        destinoDeFoco={gestion.dialogo.logro ? undefined : enfocarCargarLogro}
      />
      <DialogoDeConfirmacion
        abierto={eliminacion.abierta}
        titulo="¿Eliminar el logro?"
        descripcion={
          eliminacion.logro
            ? `Se va a quitar «${eliminacion.logro.titulo}» de la página de avance.`
            : ""
        }
        textoConfirmar="Eliminar"
        textoEnviando="Eliminando…"
        enviando={gestion.ocupado}
        alConfirmar={gestion.confirmarEliminacion}
        alCancelar={gestion.cancelarEliminacion}
        destinoDeFoco={eliminacion.eliminada ? enfocarTitulo : undefined}
      >
        {gestion.errorDeEliminacion && (
          <ErrorDeAccion error={gestion.errorDeEliminacion} />
        )}
      </DialogoDeConfirmacion>
    </article>
  );
}

function EsqueletoDelAvance() {
  return (
    <section className={estilosDePerfil.pagina}>
      <Esqueleto etiqueta="Cargando el avance del proyecto…">
        <BloqueEsqueleto ancho="60%" alto="2rem" />
        <BloqueEsqueleto />
        <BloqueEsqueleto ancho="70%" />
        <BloqueEsqueleto ancho="50%" />
      </Esqueleto>
    </section>
  );
}
