import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AvisosContext } from "../../Context/AvisosContext.js";
import { Icono } from "./Icono.jsx";
import estilos from "./AvisosProvider.module.css";

export const DURACION_AVISO_MS = 6000;
const MAXIMO_VISIBLES = 3;
const ICONOS = { exito: "exito", error: "alerta", info: "info" };

export function AvisosProvider({ children }) {
  const [avisos, setAvisos] = useState([]);
  const ultimoId = useRef(0);

  const cerrar = useCallback((id) => {
    setAvisos((lista) => lista.filter((aviso) => aviso.id !== id));
  }, []);

  const agregar = useCallback((tipo, texto) => {
    ultimoId.current += 1;
    const id = ultimoId.current;
    setAvisos((lista) => [...lista, { id, tipo, texto }].slice(-MAXIMO_VISIBLES));
    return id;
  }, []);

  const avisar = useMemo(
    () => ({
      exito: (texto) => agregar("exito", texto),
      error: (texto) => agregar("error", texto),
      info: (texto) => agregar("info", texto),
      cerrar,
    }),
    [agregar, cerrar],
  );

  const errores = avisos.filter((aviso) => aviso.tipo === "error");
  const otros = avisos.filter((aviso) => aviso.tipo !== "error");

  return (
    <AvisosContext.Provider value={avisar}>
      {children}
      <div className={estilos.zona}>
        <div role="status" className={estilos.region}>
          {otros.map((aviso) => (
            <Aviso key={aviso.id} aviso={aviso} alCerrar={cerrar} />
          ))}
        </div>
        <div role="alert" className={estilos.region}>
          {errores.map((aviso) => (
            <Aviso key={aviso.id} aviso={aviso} alCerrar={cerrar} />
          ))}
        </div>
      </div>
    </AvisosContext.Provider>
  );
}

function Aviso({ aviso, alCerrar }) {
  const [pausado, setPausado] = useState(false);
  const restante = useRef(DURACION_AVISO_MS);
  const seCierraSolo = aviso.tipo !== "error";

  useEffect(() => {
    if (!seCierraSolo || pausado) return undefined;
    const inicio = Date.now();
    const temporizador = setTimeout(() => alCerrar(aviso.id), restante.current);
    return () => {
      clearTimeout(temporizador);
      restante.current -= Date.now() - inicio;
    };
  }, [seCierraSolo, pausado, aviso.id, alCerrar]);

  function alSalirElFoco(evento) {
    if (!evento.currentTarget.contains(evento.relatedTarget)) setPausado(false);
  }

  return (
    <div
      className={`${estilos.aviso} ${estilos[aviso.tipo]}`}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={alSalirElFoco}
    >
      <Icono nombre={ICONOS[aviso.tipo]} className={estilos.icono} />
      <p className={estilos.texto}>{aviso.texto}</p>
      <button
        type="button"
        className={estilos.cerrar}
        aria-label="Cerrar aviso"
        onClick={() => alCerrar(aviso.id)}
      >
        <Icono nombre="cruz" />
      </button>
    </div>
  );
}
