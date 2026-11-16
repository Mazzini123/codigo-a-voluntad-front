import { Link } from "react-router-dom";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { SelloDeBusqueda } from "@/Presentation/Components/Proyecto/SelloDeBusqueda.jsx";
import estilos from "./FilaParaDarDeBaja.module.css";

export function FilaParaDarDeBaja({
  nombre,
  ruta,
  detalle,
  sello,
  motivoDeshabilitado,
  deshabilitado,
  alDarDeBaja,
}) {
  return (
    <li className={estilos.fila}>
      <div className={estilos.datos}>
        <h3>
          <Link to={ruta}>{nombre}</Link>
        </h3>
        {detalle && <p className={estilos.detalle}>{detalle}</p>}
        {sello && (
          <div className={estilos.sello}>
            <SelloDeBusqueda estado={sello} />
          </div>
        )}
      </div>
      <div className={estilos.acciones}>
        <Boton
          variante="peligroso"
          disabled={deshabilitado || Boolean(motivoDeshabilitado)}
          motivoDeshabilitado={motivoDeshabilitado}
          aria-label={`Dar de baja ${nombre}`}
          onClick={alDarDeBaja}
        >
          Dar de baja
        </Boton>
      </div>
    </li>
  );
}
