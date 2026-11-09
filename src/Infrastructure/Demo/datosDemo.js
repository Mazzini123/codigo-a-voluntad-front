const habilidad = (codigo, titulo) => ({ codigo, titulo });

export const CATALOGO = [
  habilidad("react", "React"),
  habilidad("css", "CSS"),
  habilidad("node", "Node.js"),
  habilidad("figma", "Figma"),
].map((resumen) => ({
  ...resumen,
  descripcion: "",
  fechaCreacion: "2026-10-01T12:00:00.000Z",
  usuario: "equipo",
  activo: true,
}));

export function unPerfil(id, campos = {}) {
  return {
    id,
    versionEdicion: "1",
    descripcion: "Desarrolladora frontend",
    busquedaAbierta: true,
    fechaCierreBusqueda: null,
    limiteColaboraciones: null,
    modoAceptacion: "REVISION_MANUAL",
    compromiso: { cantidadHoras: 5, periodo: "HS_MENSUALES" },
    modalidadColaboracion: "GRATUITA",
    habilidadesRequeridas: [habilidad("react", "React")],
    habilidadesOpcionales: [habilidad("figma", "Figma")],
    ...campos,
  };
}

export function unProyecto(id, campos = {}) {
  return {
    id,
    titulo: "Sistema de turnos del comedor",
    descripcion:
      "Queremos ordenar las entregas del comedor.\n\n- Turnos por familia\n- **Avisos** por WhatsApp",
    estado: "ABIERTO",
    porcentajeConcrecion: 20,
    urlSistema: null,
    urlRepositorio: "https://github.com/comedor/turnos",
    perfiles: [unPerfil(`${id}-pe1`)],
    colaboraciones: [],
    logros: [],
    avances: [],
    etiquetas: ["salud"],
    fechaCreacion: "2026-11-03T15:00:00.000Z",
    fechaFinalizacion: null,
    fechaCierre: null,
    visualizaciones: 12,
    ...campos,
  };
}

export function unColectivo(id, campos = {}) {
  return {
    id,
    nombre: "Asamblea de Fiorito",
    descripcion: "Comedor y **apoyo escolar** en Villa Fiorito.",
    tipoColectivo: "ASAMBLEA",
    ubicacion: { tipoUbicacion: "LOCALIDAD", nombre: "Villa Fiorito" },
    proyectos: [],
    redesSociales: [],
    etiquetas: ["educación"],
    fechaAlta: "2026-10-01T12:00:00.000Z",
    fechaBaja: null,
    ...campos,
  };
}

export function unaColaboradora(id, campos = {}) {
  return {
    id,
    nombreFantasia: "Ada",
    nombre: "Ada",
    apellido: "Lovelace",
    cuentaGit: null,
    presentacion: "Me gusta armar interfaces accesibles.",
    pronombres: [],
    recibeMensajeriaInterna: false,
    redesSociales: [],
    habilidades: [habilidad("react", "React")],
    ...campos,
  };
}
