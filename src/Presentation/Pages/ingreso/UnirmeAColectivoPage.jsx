import { useEffect, useRef } from "react";
import {
  esperandoIngreso,
  PASO_DE_REGISTRO,
  pasoDeRegistro,
} from "@/Application/Domain/Reglas/registro.js";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { Esqueleto } from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { EstadoVacio } from "@/Presentation/Components/App/estados/EstadoVacio.jsx";
import { EnlaceVolver } from "@/Presentation/Components/App/navegacion/EnlaceVolver.jsx";
import { Paginacion } from "@/Presentation/Components/App/navegacion/Paginacion.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { Campo } from "@/Presentation/Components/App/ui/Campo.jsx";
import { clases } from "@/Presentation/Components/App/ui/clases.js";
import { EnlaceBoton } from "@/Presentation/Components/App/ui/EnlaceBoton.jsx";
import { TextoOculto } from "@/Presentation/Components/App/ui/TextoOculto.jsx";
import {
  TarjetaParaUnirse,
  TarjetaParaUnirseEsqueleto,
} from "@/Presentation/Components/Colectivo/TarjetaParaUnirse.jsx";
import { useBusquedaDeColectivos } from "@/Presentation/Hooks/colectivo/useBusquedaDeColectivos.js";
import {
  LARGO_MAXIMO_DE_BUSQUEDA,
  useParametrosDeColectivos,
} from "@/Presentation/Hooks/colectivo/useParametrosDeColectivos.js";
import { usePedidosPendientes } from "@/Presentation/Hooks/membresia/usePedidosPendientes.js";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import {
  inicioPorRol,
  RUTA_ALTA_COLECTIVO,
  RUTA_BIENVENIDA,
  RUTA_MIS_SOLICITUDES,
} from "@/Presentation/Routes/rutas.js";
import estilos from "./UnirmeAColectivoPage.module.css";

function textoDeAnuncio({ error, resultado, desactualizado, busqueda }) {
  if (error || !resultado || desactualizado) return "";
  if (resultado.items.length === 0) {
    return busqueda
      ? "No encontramos colectivos con ese nombre"
      : "Todavía no hay colectivos en Código a Voluntad";
  }
  const { total, pagina, totalPaginas } = resultado;
  const conteo = `${total} ${total === 1 ? "colectivo" : "colectivos"}`;
  const conPagina = totalPaginas > 1 ? `, página ${pagina} de ${totalPaginas}` : "";
  return `${conteo}${conPagina}`;
}

export function UnirmeAColectivoPage() {
  const { usuario } = useAuth();
  const enEspera = esperandoIngreso(usuario);
  const parametros = useParametrosDeColectivos();
  const colectivos = useBusquedaDeColectivos({
    busqueda: parametros.busqueda,
    pagina: parametros.pagina,
    clave: parametros.clave,
  });
  const pedidos = usePedidosPendientes();

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-unirme">
      <TituloDePagina>Unirme a un colectivo</TituloDePagina>
      {enEspera ? (
        <EnlaceVolver to={RUTA_MIS_SOLICITUDES}>Volver a mis solicitudes</EnlaceVolver>
      ) : pasoDeRegistro(usuario) === PASO_DE_REGISTRO.COMPLETO ? (
        <EnlaceVolver to={inicioPorRol(usuario.rol)}>Volver</EnlaceVolver>
      ) : (
        <EnlaceVolver to={RUTA_BIENVENIDA}>Elegir otro tipo de cuenta</EnlaceVolver>
      )}
      <div className={estilos.titulos}>
        <h1 id="titulo-unirme" tabIndex={-1}>
          Unirme a un colectivo
        </h1>
        <p className={estilos.bajada}>
          Pedí sumarte al colectivo que quieras. Vas a entrar cuando quienes lo coordinan
          te acepten.
        </p>
      </div>
      <form
        role="search"
        aria-label="Buscar colectivos"
        className={estilos.buscador}
        onSubmit={(evento) => {
          evento.preventDefault();
          parametros.buscar();
        }}
      >
        <Campo
          etiqueta="Buscar por nombre"
          type="search"
          autoComplete="off"
          maxLength={LARGO_MAXIMO_DE_BUSQUEDA}
          value={parametros.texto}
          onChange={(evento) => parametros.escribir(evento.target.value)}
        />
        <Boton type="submit" variante="secundario">
          Buscar
        </Boton>
      </form>
      <Resultados
        parametros={parametros}
        colectivos={colectivos}
        pedidos={pedidos}
        enEspera={enEspera}
      />
    </section>
  );
}

function Resultados({ parametros, colectivos, pedidos, enEspera }) {
  const { resultado, error } = colectivos;
  const desactualizado = !resultado || resultado.consulta !== parametros.clave;
  const anuncio = textoDeAnuncio({
    error,
    resultado,
    desactualizado,
    busqueda: parametros.busqueda,
  });
  return (
    <>
      <TextoOculto role="status">{anuncio}</TextoOculto>
      <ListaDeColectivos
        parametros={parametros}
        colectivos={colectivos}
        pedidos={pedidos}
        enEspera={enEspera}
      />
    </>
  );
}

function ListaDeColectivos({ parametros, colectivos, pedidos, enEspera }) {
  const refConteo = useRef(null);
  const { resultado, error, cargando, reintentar } = colectivos;
  const desactualizado = !resultado || resultado.consulta !== parametros.clave;
  const fueraDeRango =
    resultado &&
    !cargando &&
    !desactualizado &&
    resultado.items.length === 0 &&
    resultado.totalPaginas >= 1 &&
    parametros.pagina > resultado.totalPaginas;

  const { irAPagina } = parametros;
  useEffect(() => {
    if (fueraDeRango) irAPagina(resultado.totalPaginas, { reemplazar: true });
  }, [fueraDeRango, irAPagina, resultado]);

  function cambiarPagina(numero) {
    irAPagina(numero);
    refConteo.current?.focus();
  }

  const titulo = <h2 className={estilos.oculto}>Colectivos</h2>;

  if (error) {
    return (
      <section className={estilos.resultados}>
        {titulo}
        <EstadoDeError
          titulo="No pudimos cargar los colectivos"
          error={error}
          alReintentar={reintentar}
        />
      </section>
    );
  }

  if ((cargando && desactualizado) || fueraDeRango || !resultado) {
    return (
      <section className={estilos.resultados}>
        {titulo}
        <Esqueleto etiqueta="Cargando colectivos…">
          <ul className={estilos.grilla}>
            {[1, 2, 3, 4].map((numero) => (
              <li key={numero}>
                <TarjetaParaUnirseEsqueleto />
              </li>
            ))}
          </ul>
        </Esqueleto>
      </section>
    );
  }

  if (resultado.items.length === 0) {
    return (
      <section className={estilos.resultados}>
        {titulo}
        {parametros.busqueda ? (
          <EstadoVacio
            nivel={3}
            titulo="No encontramos colectivos con ese nombre"
            descripcion={`No hay colectivos que contengan «${parametros.busqueda}».`}
          >
            <Boton onClick={parametros.limpiar}>Limpiar búsqueda</Boton>
          </EstadoVacio>
        ) : (
          <EstadoVacio
            nivel={3}
            titulo="Todavía no hay colectivos en Código a Voluntad"
            descripcion="Podés ser la primera persona en crear uno."
          >
            <EnlaceBoton to={RUTA_ALTA_COLECTIVO} variante="primario">
              Crear mi propio colectivo
            </EnlaceBoton>
          </EstadoVacio>
        )}
      </section>
    );
  }

  const { pagina, porPagina, total, totalPaginas } = resultado;
  const desde = (pagina - 1) * porPagina + 1;
  const hasta = desde + resultado.items.length - 1;

  return (
    <section className={estilos.resultados} aria-busy={cargando}>
      {titulo}
      <div>
        <p ref={refConteo} tabIndex={-1} className={estilos.conteo}>
          {totalPaginas > 1
            ? `Mostrando ${desde}–${hasta} de ${total} colectivos`
            : total === 1
              ? "1 colectivo encontrado"
              : `${total} colectivos encontrados`}
        </p>
        {cargando && (
          <p className={estilos.cargandoPagina}>Cargando página {parametros.pagina}…</p>
        )}
      </div>
      <ul
        className={clases(estilos.grilla, cargando && estilos.atenuada)}
        inert={cargando}
        aria-hidden={cargando || undefined}
        aria-label={enEspera ? "Colectivos para pedir otro ingreso" : undefined}
      >
        {resultado.items.map((colectivo) => (
          <li key={colectivo.id}>
            <TarjetaParaUnirse
              colectivo={colectivo}
              pedido={pedidos.colectivos.has(String(colectivo.id))}
              alYaPedido={pedidos.actualizar}
            />
          </li>
        ))}
      </ul>
      <Paginacion
        etiqueta="Paginación de colectivos"
        pagina={pagina}
        totalPaginas={totalPaginas}
        alCambiar={cambiarPagina}
      />
    </section>
  );
}
