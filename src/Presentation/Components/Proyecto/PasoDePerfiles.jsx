import { useEffect, useRef, useState } from "react";
import { Boton } from "../App/Boton.jsx";
import { idDeCampo } from "../Formulario/formulario.js";
import { PerfilCargado } from "./PerfilCargado.jsx";
import { PerfilForm } from "./PerfilForm.jsx";
import { validarPerfil } from "./validarProyecto.js";
import estilos from "./PasoDePerfiles.module.css";

const DESTINO = Object.freeze({ FORMULARIO: "formulario", AGREGAR: "agregar" });

function motivoParaNoAvanzar({ cantidad, formularioAbierto }) {
  if (cantidad === 0) return "Sumá al menos un perfil para seguir.";
  if (formularioAbierto) return "Guardá o descartá el perfil que estás editando.";
  return undefined;
}

export function PasoDePerfiles({
  idBase,
  refTitulo,
  catalogo,
  estadoDePerfiles,
  alAtras,
  alSiguiente,
}) {
  const {
    perfiles,
    borrador,
    formularioAbierto,
    editandoClave,
    cambiarBorrador,
    guardar,
    editar,
    agregarOtro,
    quitar,
    descartar,
  } = estadoDePerfiles;
  const [intento, setIntento] = useState(0);
  const refFormulario = useRef(null);
  const refAgregar = useRef(null);
  const destinoDeFoco = useRef(null);
  const formularioVisible = formularioAbierto || perfiles.length === 0;
  const errores = intento > 0 ? validarPerfil(borrador) : {};
  const motivo = motivoParaNoAvanzar({
    cantidad: perfiles.length,
    formularioAbierto,
  });

  useEffect(() => {
    if (intento === 0) return;
    refFormulario.current?.querySelector('[aria-invalid="true"]')?.focus();
  }, [intento]);

  useEffect(() => {
    const destino = destinoDeFoco.current;
    if (!destino) return;
    destinoDeFoco.current = null;
    if (destino === DESTINO.FORMULARIO)
      document.getElementById(idDeCampo(idBase, "perfil.descripcion"))?.focus();
    else refAgregar.current?.focus();
  });

  function intentarGuardar() {
    if (Object.keys(validarPerfil(borrador)).length > 0) {
      setIntento((actual) => actual + 1);
      return;
    }
    guardar();
    setIntento(0);
    destinoDeFoco.current = DESTINO.AGREGAR;
  }

  function descartarBorrador() {
    descartar();
    setIntento(0);
    destinoDeFoco.current = DESTINO.AGREGAR;
  }

  function editarPerfil(clave) {
    editar(clave);
    setIntento(0);
    destinoDeFoco.current = DESTINO.FORMULARIO;
  }

  function sumarOtro() {
    agregarOtro();
    setIntento(0);
    destinoDeFoco.current = DESTINO.FORMULARIO;
  }

  function quitarPerfil(clave) {
    quitar(clave);
    setIntento(0);
    destinoDeFoco.current = perfiles.length > 1 ? DESTINO.AGREGAR : DESTINO.FORMULARIO;
  }

  return (
    <div className={estilos.paso}>
      <div className={estilos.encabezado}>
        <h2 ref={refTitulo} tabIndex={-1}>
          Los perfiles
        </h2>
        <p className={estilos.bajada}>
          Cada perfil describe a una persona que necesitan. Podés sumar los que haga
          falta.
        </p>
      </div>

      {perfiles.length > 0 && (
        <ul className={estilos.lista} aria-label="Perfiles cargados">
          {perfiles.map((perfil, indice) => (
            <li key={perfil.clave}>
              <PerfilCargado
                perfil={perfil}
                numero={indice + 1}
                enEdicion={editandoClave === perfil.clave}
                alEditar={editarPerfil}
                alQuitar={quitarPerfil}
              />
            </li>
          ))}
        </ul>
      )}

      {formularioVisible ? (
        <PerfilForm
          idBase={idBase}
          refFormulario={refFormulario}
          borrador={borrador}
          errores={errores}
          catalogo={catalogo}
          esEdicion={editandoClave !== null}
          puedeDescartar={perfiles.length > 0}
          alCambiar={cambiarBorrador}
          alGuardar={intentarGuardar}
          alDescartar={descartarBorrador}
        />
      ) : (
        <Boton ref={refAgregar} className={estilos.sumar} onClick={sumarOtro}>
          Sumar otro perfil
        </Boton>
      )}

      <div className={estilos.navegacion}>
        <Boton onClick={alAtras}>Atrás</Boton>
        <Boton
          variante={formularioAbierto ? "secundario" : "primario"}
          disabled={Boolean(motivo)}
          motivoDeshabilitado={motivo}
          onClick={alSiguiente}
        >
          Siguiente
        </Boton>
      </div>
    </div>
  );
}
