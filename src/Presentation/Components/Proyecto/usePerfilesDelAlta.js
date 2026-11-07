import { useCallback, useState } from "react";
import { perfilEstaVacio, perfilVacio } from "./formularioProyecto.js";

export function usePerfilesDelAlta() {
  const [perfiles, setPerfiles] = useState([]);
  const [borrador, setBorrador] = useState(perfilVacio);
  const [abierto, setAbierto] = useState(false);
  const [editandoClave, setEditandoClave] = useState(null);

  const cerrarFormulario = useCallback(() => {
    setBorrador(perfilVacio());
    setAbierto(false);
    setEditandoClave(null);
  }, []);

  const cambiarBorrador = useCallback(
    (cambio) => setBorrador((actual) => ({ ...actual, ...cambio })),
    [],
  );

  const guardar = useCallback(() => {
    setPerfiles((actuales) =>
      editandoClave
        ? actuales.map((perfil) => (perfil.clave === editandoClave ? borrador : perfil))
        : [...actuales, borrador],
    );
    cerrarFormulario();
  }, [editandoClave, borrador, cerrarFormulario]);

  const editar = useCallback(
    (clave) => {
      const perfil = perfiles.find((candidato) => candidato.clave === clave);
      if (!perfil) return;
      setBorrador({ ...perfil });
      setEditandoClave(clave);
      setAbierto(true);
    },
    [perfiles],
  );

  const agregarOtro = useCallback(() => {
    setBorrador(perfilVacio());
    setEditandoClave(null);
    setAbierto(true);
  }, []);

  const quitar = useCallback(
    (clave) => {
      setPerfiles((actuales) => actuales.filter((perfil) => perfil.clave !== clave));
      if (editandoClave === clave) cerrarFormulario();
    },
    [editandoClave, cerrarFormulario],
  );

  return {
    perfiles,
    borrador,
    formularioAbierto: abierto,
    editandoClave,
    hayBorrador: !perfilEstaVacio(borrador),
    cambiarBorrador,
    guardar,
    editar,
    agregarOtro,
    quitar,
    descartar: cerrarFormulario,
  };
}
