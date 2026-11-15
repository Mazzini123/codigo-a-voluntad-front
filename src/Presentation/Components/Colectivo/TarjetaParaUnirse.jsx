import { Link } from "react-router-dom";
import { BloqueEsqueleto } from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import { TextoOculto } from "@/Presentation/Components/App/ui/TextoOculto.jsx";
import { textoTipoColectivo } from "@/Presentation/Formatos/colectivo.js";
import { sinMarcas } from "@/Presentation/Formatos/markdown.js";
import { usePedirIngresoAlRegistrarse } from "@/Presentation/Hooks/membresia/usePedirIngresoAlRegistrarse.js";
import { rutaColectivo } from "@/Presentation/Routes/rutas.js";
import estilos from "./TarjetaParaUnirse.module.css";

export function TarjetaParaUnirse({ colectivo, pedido, alYaPedido }) {
  const { pedir, enviando } = usePedirIngresoAlRegistrarse(colectivo, { alYaPedido });
  const tipo = textoTipoColectivo(colectivo.tipoColectivo);
  const descripcion = sinMarcas(colectivo.descripcion ?? "").trim();

  return (
    <article className={estilos.tarjeta} aria-labelledby={`colectivo-${colectivo.id}`}>
      <div className={estilos.encabezado}>
        <h3 id={`colectivo-${colectivo.id}`} className={estilos.nombre}>
          {colectivo.nombre}
        </h3>
        {tipo && <p className={estilos.tipo}>{tipo}</p>}
      </div>
      {descripcion && <p className={estilos.descripcion}>{descripcion}</p>}
      <div className={estilos.acciones}>
        {pedido ? (
          <p className={estilos.enviado}>
            <Icono nombre="tilde" tamano={16} />
            Pedido enviado
          </p>
        ) : (
          <Boton
            variante="primario"
            enviando={enviando}
            textoEnviando="Enviando…"
            onClick={pedir}
            aria-label={`Pedir sumarme a ${colectivo.nombre}`}
          >
            Pedir sumarme
          </Boton>
        )}
        <Link
          to={rutaColectivo(colectivo.id)}
          target="_blank"
          rel="noopener noreferrer"
          className={estilos.perfil}
        >
          Ver perfil
          <TextoOculto> de {colectivo.nombre} (se abre en una pestaña nueva)</TextoOculto>
        </Link>
      </div>
    </article>
  );
}

export function TarjetaParaUnirseEsqueleto() {
  return (
    <div className={estilos.esqueleto}>
      <BloqueEsqueleto ancho="60%" alto="1.4em" />
      <BloqueEsqueleto ancho="30%" />
      <BloqueEsqueleto />
      <BloqueEsqueleto ancho="140px" alto="2.5rem" />
    </div>
  );
}
