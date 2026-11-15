import { useCallback, useState } from "react";
import {
  esperandoIngreso,
  PASO_DE_REGISTRO,
  pasoDeRegistro,
} from "@/Application/Domain/Reglas/registro.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { inicioPorRol, RUTA_BIENVENIDA } from "@/Presentation/Routes/rutas.js";

const INTENCION = Object.freeze({ ENTRAR: "ENTRAR", ELEGIR: "ELEGIR" });

export function useEsperaDeIngreso() {
  const { usuario, recargarCuenta } = useAuth();
  const [intencion, setIntencion] = useState(null);
  const [revisadoA, setRevisadoA] = useState(null);

  const sincronizar = useCallback(
    async (signal) => (signal.aborted ? false : recargarCuenta()),
    [recargarCuenta],
  );
  const sincronizacion = useMutacion(sincronizar);
  const { ejecutar } = sincronizacion;

  const actualizar = useCallback(async () => {
    setIntencion(INTENCION.ENTRAR);
    setRevisadoA(null);
    const resultado = await ejecutar();
    if (resultado.ok && resultado.datos) setRevisadoA(new Date());
  }, [ejecutar]);

  const volverAElegir = useCallback(async () => {
    setIntencion(INTENCION.ELEGIR);
    await ejecutar();
  }, [ejecutar]);

  const paso = pasoDeRegistro(usuario);
  let destino = null;
  if (intencion === INTENCION.ENTRAR && usuario?.rol) destino = inicioPorRol(usuario.rol);
  if (intencion === INTENCION.ELEGIR && paso === PASO_DE_REGISTRO.MODALIDAD)
    destino = RUTA_BIENVENIDA;

  const enEspera = esperandoIngreso(usuario);

  return {
    enEspera,
    revisadoA: enEspera ? revisadoA : null,
    actualizar,
    volverAElegir,
    actualizando: sincronizacion.enviando,
    destino,
  };
}
