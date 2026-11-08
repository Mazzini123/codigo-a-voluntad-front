import { useRef, useState } from "react";
import { perfilDependencies } from "../Dependencies/perfilDependencies.js";
import { proyectoDependencies } from "../Dependencies/proyectoDependencies.js";
import {
  cambiosDelPerfil,
  datosEditablesDelPerfil,
  planDeHabilidades,
} from "../Components/Proyecto/edicionProyecto.js";
import { perfilARequest } from "../Components/Proyecto/formularioProyecto.js";

export function useAdministrarProyecto(proyectoId, recargar) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [aplicados, setAplicados] = useState([]);
  const enCurso = useRef(false);

  async function ejecutar(operacion) {
    if (enCurso.current) return false;
    enCurso.current = true;
    setGuardando(true);
    setError(null);
    try {
      await operacion();
      return true;
    } catch (fallo) {
      setError(fallo);
      return false;
    } finally {
      await recargar();
      enCurso.current = false;
      setGuardando(false);
    }
  }

  function limpiar() {
    setError(null);
    setAplicados([]);
  }

  return {
    guardando,
    error,
    aplicados,
    ejecutar,
    limpiar,
    actualizar: (cambios) => proyectoDependencies.actualizarProyecto(proyectoId, cambios),
    finalizar: () => proyectoDependencies.finalizarProyecto(proyectoId),
    crearPerfil: (borrador) =>
      perfilDependencies.crearPerfil(proyectoId, perfilARequest(borrador)),
    cambiarBusqueda: (perfilId, busquedaAbierta) =>
      perfilDependencies.actualizarPerfil(proyectoId, perfilId, { busquedaAbierta }),
    guardarPerfil: (perfilId, original, borrador) =>
      guardarPerfil(proyectoId, perfilId, original, borrador, (paso) =>
        setAplicados((previos) => [...previos, paso]),
      ),
  };
}

async function guardarPerfil(proyectoId, perfilId, original, borrador, alAplicar) {
  const actual = datosEditablesDelPerfil(
    await perfilDependencies.obtenerPerfil(proyectoId, perfilId),
  );
  const plan = planDeHabilidades(actual, borrador);
  if (!plan) {
    throw {
      mensaje:
        "Para intercambiar estas habilidades, agregá primero otra habilidad requerida y guardá ese cambio.",
    };
  }

  for (const paso of plan) {
    const argumento = paso.agregar ? { codigoHabilidad: paso.codigo } : paso.codigo;
    await perfilDependencies[paso.metodo](proyectoId, perfilId, argumento);
    alAplicar(paso.descripcion);
  }

  const deseados = cambiosDelPerfil(original, borrador);
  const restantes = cambiosDelPerfil(actual, borrador);
  const cambios = Object.fromEntries(
    Object.entries(deseados).filter(([clave]) => clave in restantes),
  );
  if (Object.keys(cambios).length) {
    await perfilDependencies.actualizarPerfil(proyectoId, perfilId, cambios);
    alAplicar("Se guardaron los datos del perfil.");
  }
}
