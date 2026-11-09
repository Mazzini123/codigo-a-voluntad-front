import { useLocation, useParams } from "react-router-dom";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { EstadoVacio } from "@/Presentation/Components/App/estados/EstadoVacio.jsx";
import { EnlaceVolver } from "@/Presentation/Components/App/navegacion/EnlaceVolver.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { nombreVisible } from "@/Presentation/Formatos/colaboradora.js";
import {
  AVISO_DE_PRIVACIDAD,
  avisoDeCopiado,
  etiquetaDeMedio,
  MENSAJE_NO_SE_PUDO_COPIAR,
  TITULO_DE_CONTACTO,
  TITULO_SIN_MEDIOS,
  textoDeCopiar,
  tituloDeContacto,
} from "@/Presentation/Formatos/contacto.js";
import { useCopiarAlPortapapeles } from "@/Presentation/Hooks/comunes/useCopiarAlPortapapeles.js";
import { useContactoDeColaborador } from "@/Presentation/Hooks/proyecto/useContactoDeColaborador.js";
import {
  destinoDeVuelta,
  rutaPostulacionesRecibidas,
} from "@/Presentation/Routes/rutas.js";
import estilos from "./ContactoDeColaboradoraPage.module.css";

export default function ContactoDeColaboradoraPage() {
  const { id, colaboradorId } = useParams();
  return (
    <Contacto key={`${id}/${colaboradorId}`} id={id} colaboradorId={colaboradorId} />
  );
}

function Cargando() {
  return (
    <Esqueleto etiqueta="Cargando datos de contacto…">
      <div className={estilos.lista}>
        {[1, 2].map((numero) => (
          <div key={numero} className={estilos.esqueletoDeMedio}>
            <BloqueEsqueleto ancho="30%" />
            <BloqueEsqueleto ancho="70%" alto="1.4em" />
          </div>
        ))}
      </div>
    </Esqueleto>
  );
}

function MedioDeContacto({ medio, alCopiar }) {
  return (
    <li className={estilos.medio}>
      <div className={estilos.dato}>
        <span className={estilos.etiqueta}>{etiquetaDeMedio(medio.tipo)}</span>
        <span className={estilos.valor}>{medio.valor}</span>
      </div>
      <Boton aria-label={textoDeCopiar(medio.tipo)} onClick={() => alCopiar(medio)}>
        Copiar
      </Boton>
    </li>
  );
}

function Contacto({ id, colaboradorId }) {
  const volver = destinoDeVuelta(useLocation(), {
    a: rutaPostulacionesRecibidas(id),
    texto: "Volver a las postulaciones",
  });
  const { medios, colaboradora, error, cargando, reintentar } = useContactoDeColaborador(
    id,
    colaboradorId,
  );
  const copiar = useCopiarAlPortapapeles(MENSAJE_NO_SE_PUDO_COPIAR);
  const nombre = colaboradora ? nombreVisible(colaboradora) : "";

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-contacto">
      <TituloDePagina>{TITULO_DE_CONTACTO}</TituloDePagina>
      <EnlaceVolver to={volver.a} state={volver.state}>
        {volver.texto}
      </EnlaceVolver>
      <header className={estilos.cabecera}>
        <h1 id="titulo-contacto" tabIndex={-1}>
          {tituloDeContacto(nombre)}
        </h1>
        <p className={estilos.privacidad}>{AVISO_DE_PRIVACIDAD}</p>
      </header>
      {error ? (
        <EstadoDeError
          titulo="No pudimos mostrar los datos de contacto"
          error={error}
          alReintentar={reintentar}
        />
      ) : cargando || !medios ? (
        <Cargando />
      ) : medios.length === 0 ? (
        <EstadoVacio titulo={TITULO_SIN_MEDIOS} />
      ) : (
        <ul className={estilos.lista}>
          {medios.map((medio, indice) => (
            <MedioDeContacto
              key={`${medio.tipo}/${medio.valor}/${indice}`}
              medio={medio}
              alCopiar={({ tipo, valor }) => copiar(valor, avisoDeCopiado(tipo))}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
