import { idDeCampo } from "./formulario.js";

const CAMPOS_FIJOS = [
  ["identificacion", "Cómo querés que te vean"],
  ["nombreFantasia", "Nombre de fantasía"],
  ["nombre", "Nombre"],
  ["apellido", "Apellido"],
  ["tipoColectivo", "Tipo de colectivo"],
  ["cuentaGit", "Cuenta de GitHub o GitLab"],
  ["descripcion", "Descripción"],
  ["presentacion", "Presentación"],
  ["ubicacion", "Dónde trabajan"],
  ["ubicacion.provincia", "Provincia"],
  ["ubicacion.localidad", "Ciudad o barrio"],
  ["habilidades", "Habilidades"],
];

const CAMPOS_DE_REDES = [
  ["nombre", "Nombre de la red"],
  ["url", "Dirección web de la red"],
];

export function itemsDelResumen(errores, estado, prefijo) {
  const item = (clave, etiqueta) => ({ id: idDeCampo(prefijo, clave), etiqueta });
  const fijos = CAMPOS_FIJOS.filter(([clave]) => errores[clave]).map(
    ([clave, etiqueta]) => item(clave, etiqueta),
  );
  const medios = (estado.mediosDeContacto ?? []).flatMap((medio, indice) => {
    const clave = `mediosDeContacto.${medio.clave}.valor`;
    return errores[clave] ? [item(clave, `Medio de contacto ${indice + 1}`)] : [];
  });
  const redes = (estado.redesSociales ?? []).flatMap((red, indice) =>
    CAMPOS_DE_REDES.flatMap(([campo, etiqueta]) => {
      const clave = `redesSociales.${red.clave}.${campo}`;
      return errores[clave] ? [item(clave, `${etiqueta} ${indice + 1}`)] : [];
    }),
  );
  return [...fijos, ...medios, ...redes];
}
