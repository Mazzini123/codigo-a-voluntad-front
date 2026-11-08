import { finDelDia, hoyEnArgentina, perfilARequest } from "./formularioProyecto.js";

function fechaParaCampo(valor) {
  if (!valor) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? "" : hoyEnArgentina(fecha);
}

export function datosEditablesDelProyecto(proyecto) {
  return {
    titulo: proyecto.titulo,
    descripcion: proyecto.descripcion,
    etiquetas: proyecto.etiquetas ?? [],
    fechaCierre: fechaParaCampo(proyecto.fechaCierre),
  };
}

export function datosEditablesDelPerfil(perfil) {
  return {
    descripcion: perfil.descripcion,
    requeridas: perfil.habilidadesRequeridas ?? [],
    opcionales: perfil.habilidadesOpcionales ?? [],
    horas: String(perfil.compromiso.cantidadHoras),
    periodo: perfil.compromiso.periodo,
    modalidad: perfil.modalidadColaboracion,
    modoAceptacion: perfil.modoAceptacion,
    limite: String(perfil.limiteColaboraciones ?? ""),
    fechaCierreBusqueda: fechaParaCampo(perfil.fechaCierreBusqueda),
  };
}

function diferencia(anterior, siguiente) {
  return Object.fromEntries(
    Object.entries(siguiente).filter(
      ([clave, valor]) => JSON.stringify(anterior[clave]) !== JSON.stringify(valor),
    ),
  );
}

export function cambiosDelProyecto(original, borrador) {
  const cambios = diferencia(original, {
    ...borrador,
    titulo: borrador.titulo.trim(),
    descripcion: borrador.descripcion.trim(),
  });
  if ("fechaCierre" in cambios) {
    cambios.fechaCierre = borrador.fechaCierre ? finDelDia(borrador.fechaCierre) : null;
  }
  return cambios;
}

function datosDelPerfil(borrador) {
  const datos = perfilARequest(borrador);
  delete datos.codigosHabilidadesRequeridas;
  delete datos.codigosHabilidadesOpcionales;
  return { ...datos, fechaCierreBusqueda: datos.fechaCierreBusqueda ?? null };
}

export function cambiosDelPerfil(original, borrador) {
  return diferencia(datosDelPerfil(original), datosDelPerfil(borrador));
}

const GRUPOS = [
  { clave: "requeridas", sufijo: "Requerida", nombre: "requerida" },
  { clave: "opcionales", sufijo: "Opcional", nombre: "opcional" },
];

export function planDeHabilidades(actual, objetivo) {
  const grupos = Object.fromEntries(
    GRUPOS.map(({ clave }) => [
      clave,
      new Set(actual[clave].map(({ codigo }) => codigo)),
    ]),
  );
  const pendientes = GRUPOS.flatMap(({ clave, sufijo, nombre }) => {
    const destino = new Set(objetivo[clave].map(({ codigo }) => codigo));
    const altas = objetivo[clave]
      .filter(({ codigo }) => !grupos[clave].has(codigo))
      .map(({ codigo, titulo }) => ({
        clave,
        codigo,
        agregar: true,
        metodo: `agregarHabilidad${sufijo}`,
        descripcion: `Se agregó ${titulo} como ${nombre}.`,
      }));
    const bajas = actual[clave]
      .filter(({ codigo }) => !destino.has(codigo))
      .map(({ codigo, titulo }) => ({
        clave,
        codigo,
        agregar: false,
        metodo: `quitarHabilidad${sufijo}`,
        descripcion: `Se quitó ${titulo} de las habilidades de tipo ${nombre}.`,
      }));
    return [...altas, ...bajas];
  });
  const plan = [];
  while (pendientes.length) {
    const indice = pendientes.findIndex(({ clave, codigo, agregar }) => {
      const otro = clave === "requeridas" ? "opcionales" : "requeridas";
      if (agregar) return !grupos[otro].has(codigo);
      return clave !== "requeridas" || grupos.requeridas.size > 1;
    });
    if (indice === -1) return null;
    const [paso] = pendientes.splice(indice, 1);
    if (paso.agregar) grupos[paso.clave].add(paso.codigo);
    else grupos[paso.clave].delete(paso.codigo);
    plan.push(paso);
  }
  return plan;
}
