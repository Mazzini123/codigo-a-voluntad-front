import { useId, useState } from "react";
import { TIPOS_MEDIOS_CONTACTO } from "@/Application/Domain/Enums/TIPOS_MEDIOS_CONTACTO.js";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { Campo } from "@/Presentation/Components/App/ui/Campo.jsx";
import { Selector } from "@/Presentation/Components/App/ui/Selector.jsx";
import { TEXTO_MEDIO_DE_CONTACTO } from "@/Presentation/Formatos/colectivo.js";
import {
  MAXIMO_POR_LISTA,
  mediosARequest,
  validarMedio,
} from "@/Presentation/Formularios/comunes/formulario.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import estilos from "./MediosDeContactoPrivados.module.css";

const OPCIONES_DE_MEDIO = Object.entries(TEXTO_MEDIO_DE_CONTACTO).map(
  ([valor, texto]) => ({ valor, texto }),
);

const ERROR_AL_AGREGAR = "No pudimos agregar el medio de contacto. Probá de nuevo.";
const ERROR_AL_QUITAR = "No pudimos quitar el medio de contacto. Probá de nuevo.";

export function MediosDeContactoPrivados({ medios }) {
  const idDelCampo = useId();
  const avisar = useAvisos();
  const [tipo, setTipo] = useState(TIPOS_MEDIOS_CONTACTO.EMAIL);
  const [valor, setValor] = useState("");
  const [error, setError] = useState(null);
  const lleno = (medios.medios?.length ?? 0) >= MAXIMO_POR_LISTA;

  async function agregar() {
    const invalido = validarMedio({ tipo, valor });
    if (invalido) {
      setError(invalido);
      return;
    }
    setError(null);
    const [pedido] = mediosARequest([{ tipo, valor }]);
    const resultado = await medios.agregar(pedido);
    if (!resultado) return;
    if (resultado.ok) {
      setValor("");
      avisar.exito("Medio de contacto agregado.");
    } else {
      setError(resultado.error?.mensaje ?? ERROR_AL_AGREGAR);
    }
  }

  async function quitar(medio) {
    const resultado = await medios.quitar(medio);
    if (!resultado) return;
    if (resultado.ok) avisar.exito("Quitaste el medio de contacto.");
    else avisar.error(resultado.error?.mensaje ?? ERROR_AL_QUITAR);
  }

  if (medios.error && !medios.medios) {
    return (
      <EstadoDeError
        titulo="No pudimos cargar tus medios de contacto"
        error={medios.error}
        alReintentar={medios.reintentar}
      />
    );
  }

  if (medios.cargando || !medios.medios) {
    return (
      <Esqueleto etiqueta="Cargando tus medios de contacto…">
        <BloqueEsqueleto alto="2.5rem" />
        <BloqueEsqueleto alto="2.5rem" />
      </Esqueleto>
    );
  }

  return (
    <div className={estilos.medios}>
      {medios.medios.length === 0 ? (
        <p className={estilos.vacio}>Todavía no cargaste medios de contacto.</p>
      ) : (
        <ul className={estilos.lista} aria-label="Medios de contacto cargados">
          {medios.medios.map((medio) => (
            <li key={`${medio.tipo}-${medio.valor}`} className={estilos.item}>
              <span>
                <strong>{TEXTO_MEDIO_DE_CONTACTO[medio.tipo] ?? medio.tipo}</strong>
                {" · "}
                <span>{medio.valor}</span>
              </span>
              <Boton
                icono="cruz"
                disabled={medios.procesando}
                aria-label={`Quitar ${TEXTO_MEDIO_DE_CONTACTO[medio.tipo] ?? medio.tipo} ${medio.valor}`}
                onClick={() => quitar(medio)}
              >
                Quitar
              </Boton>
            </li>
          ))}
        </ul>
      )}
      <div
        className={estilos.agregar}
        role="group"
        aria-label="Agregar un medio de contacto"
      >
        <Selector
          etiqueta="Tipo"
          opciones={OPCIONES_DE_MEDIO}
          value={tipo}
          onChange={(evento) => setTipo(evento.target.value)}
        />
        <Campo
          id={idDelCampo}
          etiqueta={tipo === TIPOS_MEDIOS_CONTACTO.EMAIL ? "Email" : "Número"}
          type={tipo === TIPOS_MEDIOS_CONTACTO.EMAIL ? "email" : "tel"}
          autoComplete="off"
          value={valor}
          error={error}
          onChange={(evento) => setValor(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key !== "Enter") return;
            evento.preventDefault();
            agregar();
          }}
        />
        <Boton
          aria-label="Agregar medio de contacto"
          disabled={lleno || medios.procesando}
          motivoDeshabilitado={
            lleno
              ? `Podés cargar hasta ${MAXIMO_POR_LISTA} medios de contacto.`
              : undefined
          }
          onClick={agregar}
        >
          Agregar
        </Boton>
      </div>
    </div>
  );
}
