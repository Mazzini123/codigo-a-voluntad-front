import { useCallback, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { EnlaceVolver } from "@/Presentation/Components/App/navegacion/EnlaceVolver.jsx";
import { Paginacion } from "@/Presentation/Components/App/navegacion/Paginacion.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { EstadoVacio } from "@/Presentation/Components/App/estados/EstadoVacio.jsx";
import { MensajeDePantalla } from "@/Presentation/Components/App/estados/MensajeDePantalla.jsx";
import { clases } from "@/Presentation/Components/App/ui/clases.js";
import { DialogoDeInvitacion } from "@/Presentation/Components/Reclutamiento/DialogoDeInvitacion.jsx";
import { idDeInvitacion } from "@/Presentation/Components/Reclutamiento/idsDeInvitacion.js";
import { TarjetaDeColaboradora } from "@/Presentation/Components/Reclutamiento/TarjetaDeColaboradora.jsx";
import { TITULO_SIN_CANDIDATAS } from "@/Presentation/Formatos/reclutamiento.js";
import { useColaboradorasPotenciales } from "@/Presentation/Hooks/reclutamiento/useColaboradorasPotenciales.js";
import { useInvitarColaborador } from "@/Presentation/Hooks/reclutamiento/useInvitarColaborador.js";
import { rutaProyecto } from "@/Presentation/Routes/rutas.js";
import estilos from "./ColaboradorasPotencialesPage.module.css";

function leerPagina(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 1 ? numero : 1;
}

export default function ColaboradorasPotencialesPage() {
  const { id, perfilId } = useParams();
  return <Colaboradoras key={`${id}/${perfilId}`} id={id} perfilId={perfilId} />;
}

function Cargando() {
  return (
    <Esqueleto etiqueta="Cargando colaboradoras…">
      <div className={estilos.lista}>
        {[1, 2, 3].map((numero) => (
          <div key={numero} className={estilos.esqueletoDeTarjeta}>
            <BloqueEsqueleto ancho="50%" alto="1.4em" />
            <BloqueEsqueleto ancho="70%" />
            <BloqueEsqueleto ancho="40%" />
          </div>
        ))}
      </div>
    </Esqueleto>
  );
}

function Colaboradoras({ id, perfilId }) {
  const [parametros, setParametros] = useSearchParams();
  const pagina = leerPagina(parametros.get("pagina"));
  const { proyecto, perfil, resultado, error, cargando, cargandoPagina, reintentar } =
    useColaboradorasPotenciales(id, perfilId, pagina);
  const invitacion = useInvitarColaborador(id, perfilId);
  const { ultimaInvitada } = invitacion;

  const irAPagina = useCallback(
    (numero, { reemplazar = false } = {}) => {
      setParametros(
        (actuales) => {
          const nuevos = new URLSearchParams(actuales);
          if (numero > 1) nuevos.set("pagina", String(numero));
          else nuevos.delete("pagina");
          return nuevos;
        },
        { replace: reemplazar },
      );
    },
    [setParametros],
  );

  const fueraDeRango =
    resultado &&
    !cargandoPagina &&
    resultado.items.length === 0 &&
    resultado.totalPaginas >= 1 &&
    pagina > resultado.totalPaginas;

  useEffect(() => {
    if (fueraDeRango) irAPagina(resultado.totalPaginas, { reemplazar: true });
  }, [fueraDeRango, irAPagina, resultado]);

  const destinoDeFoco = useCallback(
    () =>
      ultimaInvitada ? document.getElementById(idDeInvitacion(ultimaInvitada)) : null,
    [ultimaInvitada],
  );

  if (error?.status === 404 || error?.status === 403) {
    return (
      <MensajeDePantalla
        titulo="No pudimos abrir esta búsqueda"
        tituloDePestana="Colaboradoras para este perfil"
        volverA={rutaProyecto(id)}
        textoVolver="Volver al proyecto"
      >
        Puede que el proyecto o el perfil ya no existan, o que no tengas permiso para
        verlos.
      </MensajeDePantalla>
    );
  }
  if (proyecto && !perfil) {
    return (
      <MensajeDePantalla
        titulo="Este perfil ya no existe"
        tituloDePestana="Colaboradoras para este perfil"
        volverA={rutaProyecto(id)}
        textoVolver="Volver al proyecto"
      >
        El perfil fue eliminado del proyecto, así que no hay colaboradoras para mostrar.
      </MensajeDePantalla>
    );
  }

  const totalOpcionales = perfil?.habilidadesOpcionales?.length ?? 0;
  const enviando = invitacion.enviando;

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-colaboradoras">
      <TituloDePagina>Colaboradoras para este perfil</TituloDePagina>
      <EnlaceVolver to={rutaProyecto(id)}>Volver al proyecto</EnlaceVolver>
      <header className={estilos.cabecera}>
        <h1 id="titulo-colaboradoras" tabIndex={-1}>
          Colaboradoras para este perfil
        </h1>
        {proyecto && <p className={estilos.proyecto}>{proyecto.titulo}</p>}
        {perfil && <p className={estilos.descripcion}>{perfil.descripcion}</p>}
      </header>
      {error && !resultado ? (
        <EstadoDeError
          titulo="No pudimos cargar las colaboradoras"
          error={error}
          alReintentar={reintentar}
        />
      ) : cargando || !resultado ? (
        <Cargando />
      ) : resultado.items.length === 0 && !fueraDeRango ? (
        <EstadoVacio titulo={TITULO_SIN_CANDIDATAS}>
          <EnlaceVolver to={rutaProyecto(id)}>Volver al proyecto</EnlaceVolver>
        </EstadoVacio>
      ) : (
        <>
          {error && (
            <EstadoDeError
              titulo="No pudimos cargar las colaboradoras"
              error={error}
              alReintentar={reintentar}
            />
          )}
          <ul
            className={clases(estilos.lista, cargandoPagina && estilos.atenuada)}
            inert={cargandoPagina}
            aria-busy={cargandoPagina}
          >
            {resultado.items.map((candidata) => (
              <TarjetaDeColaboradora
                key={candidata.colaborador.id}
                candidata={candidata}
                totalOpcionales={totalOpcionales}
                invitada={invitacion.invitadas.has(candidata.colaborador.id)}
                ocupado={enviando}
                alContactar={invitacion.abrir}
              />
            ))}
          </ul>
          <div inert={enviando}>
            <Paginacion
              etiqueta="Paginación de colaboradoras"
              pagina={resultado.pagina}
              totalPaginas={resultado.totalPaginas}
              alCambiar={irAPagina}
            />
          </div>
        </>
      )}
      <DialogoDeInvitacion
        colaborador={invitacion.aInvitar}
        perfil={perfil}
        proyecto={proyecto}
        mensaje={invitacion.mensaje}
        errorDelMensaje={invitacion.errorDelMensaje}
        errorDeEnvio={invitacion.errorDeEnvio}
        enviando={enviando}
        alCambiarMensaje={invitacion.cambiarMensaje}
        alEnviar={invitacion.enviar}
        alCancelar={invitacion.cancelar}
        destinoDeFoco={destinoDeFoco}
      />
    </section>
  );
}
