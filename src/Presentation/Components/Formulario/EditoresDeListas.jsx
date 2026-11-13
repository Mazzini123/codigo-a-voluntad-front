import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { Campo } from "@/Presentation/Components/App/ui/Campo.jsx";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import { Selector } from "@/Presentation/Components/App/ui/Selector.jsx";
import { TEXTO_MEDIO_DE_CONTACTO } from "@/Presentation/Formatos/colectivo.js";
import {
  crearClave,
  idDeCampo,
  MAXIMO_POR_LISTA,
} from "@/Presentation/Formularios/comunes/formulario.js";
import estilos from "./Editores.module.css";
import { TIPOS_MEDIOS_CONTACTO } from "@/Application/Domain/Enums/TIPOS_MEDIOS_CONTACTO.js";

const OPCIONES_DE_MEDIO = Object.entries(TEXTO_MEDIO_DE_CONTACTO).map(
  ([valor, texto]) => ({
    valor,
    texto,
  }),
);

function useFocoEnNuevaFila(idDeFila) {
  const [nueva, setNueva] = useState(null);
  useEffect(() => {
    if (nueva) document.getElementById(idDeFila(nueva))?.focus();
  }, [nueva, idDeFila]);
  return setNueva;
}

export function MediosDeContacto({ items, errores, alCambiar, prefijoDeIds }) {
  const base = useId();
  const refAgregar = useRef(null);
  const idDeFila = useCallback((clave) => `${base}-${clave}`, [base]);
  const enfocarFila = useFocoEnNuevaFila(idDeFila);
  const lleno = items.length >= MAXIMO_POR_LISTA;

  function cambiar(clave, cambio) {
    alCambiar(
      items.map((item) => (item.clave === clave ? { ...item, ...cambio } : item)),
    );
  }

  function agregar() {
    const clave = crearClave();
    alCambiar([...items, { clave, tipo: TIPOS_MEDIOS_CONTACTO.EMAIL, valor: "" }]);
    enfocarFila(clave);
  }

  function quitar(clave) {
    alCambiar(items.filter((item) => item.clave !== clave));
    refAgregar.current?.focus();
  }

  return (
    <>
      {items.map((item, indice) => (
        <fieldset key={item.clave} className={estilos.fila}>
          <legend>Medio de contacto {indice + 1}</legend>
          <Selector
            id={idDeFila(item.clave)}
            etiqueta="Tipo"
            opciones={OPCIONES_DE_MEDIO}
            value={item.tipo}
            onChange={(e) => cambiar(item.clave, { tipo: e.target.value })}
          />
          <Campo
            id={
              prefijoDeIds &&
              idDeCampo(prefijoDeIds, `mediosDeContacto.${item.clave}.valor`)
            }
            etiqueta={item.tipo === TIPOS_MEDIOS_CONTACTO.EMAIL ? "Email" : "Número"}
            type={item.tipo === TIPOS_MEDIOS_CONTACTO.EMAIL ? "email" : "tel"}
            ayuda={
              item.tipo === TIPOS_MEDIOS_CONTACTO.SMS
                ? "Incluí + y el código de país. Ejemplo: +5491155551234."
                : undefined
            }
            autoComplete={item.tipo === TIPOS_MEDIOS_CONTACTO.EMAIL ? "email" : "tel"}
            value={item.valor}
            error={errores[`mediosDeContacto.${item.clave}.valor`]}
            onChange={(e) => cambiar(item.clave, { valor: e.target.value })}
          />
          <Boton
            icono="cruz"
            className={estilos.quitar}
            aria-label={`Quitar medio de contacto ${indice + 1}`}
            onClick={() => quitar(item.clave)}
          >
            Quitar
          </Boton>
        </fieldset>
      ))}
      <Boton
        ref={refAgregar}
        className={estilos.agregar}
        disabled={lleno}
        motivoDeshabilitado={`Podés cargar hasta ${MAXIMO_POR_LISTA} medios de contacto.`}
        onClick={agregar}
      >
        Agregar medio de contacto
      </Boton>
    </>
  );
}

export function RedesSociales({ items, errores, alCambiar, prefijoDeIds }) {
  const base = useId();
  const refAgregar = useRef(null);
  const idDelNombre = useCallback(
    (clave) =>
      prefijoDeIds
        ? idDeCampo(prefijoDeIds, `redesSociales.${clave}.nombre`)
        : `${base}-${clave}`,
    [base, prefijoDeIds],
  );
  const enfocarFila = useFocoEnNuevaFila(idDelNombre);
  const lleno = items.length >= MAXIMO_POR_LISTA;

  function cambiar(clave, cambio) {
    alCambiar(
      items.map((item) => (item.clave === clave ? { ...item, ...cambio } : item)),
    );
  }

  function agregar() {
    const clave = crearClave();
    alCambiar([...items, { clave, nombre: "", url: "" }]);
    enfocarFila(clave);
  }

  function quitar(clave) {
    alCambiar(items.filter((item) => item.clave !== clave));
    refAgregar.current?.focus();
  }

  return (
    <>
      {items.map((item, indice) => (
        <fieldset key={item.clave} className={estilos.fila}>
          <legend>Red social {indice + 1}</legend>
          <Campo
            id={idDelNombre(item.clave)}
            etiqueta="Nombre"
            placeholder="Instagram"
            value={item.nombre}
            error={errores[`redesSociales.${item.clave}.nombre`]}
            onChange={(e) => cambiar(item.clave, { nombre: e.target.value })}
          />
          <Campo
            id={
              prefijoDeIds && idDeCampo(prefijoDeIds, `redesSociales.${item.clave}.url`)
            }
            etiqueta="Dirección web"
            type="url"
            inputMode="url"
            value={item.url}
            error={errores[`redesSociales.${item.clave}.url`]}
            onChange={(e) => cambiar(item.clave, { url: e.target.value })}
          />
          <Boton
            icono="cruz"
            className={estilos.quitar}
            aria-label={`Quitar red social ${indice + 1}`}
            onClick={() => quitar(item.clave)}
          >
            Quitar
          </Boton>
        </fieldset>
      ))}
      <Boton
        ref={refAgregar}
        className={estilos.agregar}
        disabled={lleno}
        motivoDeshabilitado={`Podés cargar hasta ${MAXIMO_POR_LISTA} redes sociales.`}
        onClick={agregar}
      >
        Agregar red social
      </Boton>
    </>
  );
}

export function ListaDeTextos({
  textos,
  alCambiar,
  etiqueta,
  ayuda,
  maximo = MAXIMO_POR_LISTA,
  validar,
  textoQuitar,
  nombreDeLista,
}) {
  const [texto, setTexto] = useState("");
  const [error, setError] = useState(null);
  const refCampo = useRef(null);
  const lleno = textos.length >= maximo;

  function agregar() {
    const problema = validar(texto, textos);
    if (problema) {
      setError(problema);
      refCampo.current?.focus();
      return;
    }
    alCambiar([...textos, texto.trim()]);
    setTexto("");
    setError(null);
    refCampo.current?.focus();
  }

  function alPresionarTecla(evento) {
    if (evento.key !== "Enter") return;
    evento.preventDefault();
    if (!lleno) agregar();
  }

  function quitar(valor) {
    alCambiar(textos.filter((otro) => otro !== valor));
    refCampo.current?.focus();
  }

  return (
    <>
      <div className={estilos.nuevaEtiqueta}>
        <Campo
          ref={refCampo}
          etiqueta={etiqueta}
          ayuda={lleno ? `Llegaste al máximo de ${maximo}.` : ayuda}
          value={texto}
          error={error}
          disabled={lleno}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={alPresionarTecla}
        />
        <Boton disabled={lleno} onClick={agregar}>
          Agregar
        </Boton>
      </div>
      {textos.length > 0 && (
        <ul className={estilos.etiquetas} aria-label={nombreDeLista}>
          {textos.map((valor) => (
            <li key={valor} className={estilos.etiqueta}>
              {valor}
              <button
                type="button"
                className={estilos.quitarEtiqueta}
                aria-label={`${textoQuitar} ${valor}`}
                onClick={() => quitar(valor)}
              >
                <Icono nombre="cruz" tamano={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
