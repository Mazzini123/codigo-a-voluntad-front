import { unColectivo, unProyecto, unaColaboradora } from "./datosDemo.js";

export function prepararDatosDemo(estado) {
  estado.colectivos.set(
    "colectivo-simulado",
    unColectivo("colectivo-simulado", {
      nombre: "Huerta Comunitaria Sur",
      descripcion: "Datos de ejemplo. Organizamos huertas y talleres para el barrio.",
      mediosDeContacto: [{ tipo: "EMAIL", valor: "huerta@example.com" }],
    }),
  );
  estado.colaboradores.set(
    "colaboradora-simulada",
    unaColaboradora("colaboradora-simulada", {
      recibeMensajeriaInterna: true,
      mediosDeContacto: [{ tipo: "EMAIL", valor: "ada@example.com" }],
    }),
  );
  estado.colaboradores.set(
    "col-beto",
    unaColaboradora("col-beto", {
      nombreFantasia: "Beto",
      nombre: "Beto",
      apellido: "Gomez",
      recibeMensajeriaInterna: true,
    }),
  );
  estado.colaboradores.set(
    "col-luz",
    unaColaboradora("col-luz", {
      nombreFantasia: "Luz",
      nombre: "Luz",
      apellido: "Perez",
      recibeMensajeriaInterna: false,
    }),
  );
  const colaboracion = (id, estado, colaboradorId, perfil) => ({
    id,
    perfil,
    estado,
    colaborador: structuredClone(estadoDemoPersona(colaboradorId)),
    esPublica: true,
    fecha: "2026-11-01T12:00:00Z",
    fechaResolucion: estado === "PENDIENTE" ? null : "2026-11-02T12:00:00Z",
    fechaFin: estado === "FINALIZADA" ? "2026-11-08T12:00:00Z" : null,
    valoracionDelColectivo: null,
    valoracionDelColaborador: null,
  });
  function estadoDemoPersona(id) {
    return estado.colaboradores.get(id);
  }
  const activo = unProyecto("demo-huerta", {
    titulo: "Mapa de huertas del barrio",
    descripcion:
      "Un mapa para **coordinar las huertas comunitarias**.\n\nBuscamos sumar turnos y un calendario de talleres.",
    colectivoId: "colectivo-simulado",
    colectivo: {
      id: "colectivo-simulado",
      nombre: "Huerta Comunitaria Sur",
      ubicacion: { tipoUbicacion: "LOCALIDAD", nombre: "Buenos Aires" },
    },
    porcentajeConcrecion: 45,
    logros: [
      {
        id: "logro-demo",
        titulo: "Primer prototipo",
        descripcion: "El equipo ya puede cargar una huerta.",
        fecha: "2026-11-05T12:00:00Z",
      },
    ],
    avances: [
      {
        id: "avance-demo",
        porcentajeConcrecion: 45,
        fecha: "2026-11-06T12:00:00Z",
        urlRepositorio: "https://example.com/repositorio-demo",
        urlSistema: null,
      },
    ],
    etiquetas: ["ambiente", "comunidad"],
  });
  activo.perfiles[0].titulo = "Desarrollo de interfaces";
  activo.colaboraciones = [
    colaboracion("demo-pendiente", "PENDIENTE", "col-beto", "demo-huerta-pe1"),
    colaboracion("demo-aceptada", "ACEPTADA", "colaboradora-simulada", "demo-huerta-pe1"),
  ];
  estado.proyectos.set(activo.id, activo);
  const finalizado = unProyecto("demo-finalizado", {
    titulo: "Biblioteca del barrio",
    estado: "FINALIZADO",
    colectivoId: "colectivo-simulado",
    porcentajeConcrecion: 100,
    fechaFinalizacion: "2026-11-08T12:00:00Z",
    colaboraciones: [
      colaboracion(
        "demo-finalizada",
        "FINALIZADA",
        "colaboradora-simulada",
        "demo-finalizado-pe1",
      ),
      colaboracion("demo-valorada", "FINALIZADA", "col-beto", "demo-finalizado-pe1"),
    ],
  });
  finalizado.colaboraciones[1].valoracionDelColectivo = {
    puntaje: 5,
    comentario: "Excelente trabajo en equipo. Valoracion de ejemplo.",
    fecha: "2026-11-08T15:00:00Z",
  };
  finalizado.colaboraciones[1].valoracionDelColaborador = {
    puntaje: 5,
    comentario: "Un colectivo muy organizado. Valoracion de ejemplo.",
    fecha: "2026-11-08T16:00:00Z",
  };
  estado.proyectos.set(finalizado.id, finalizado);
  estado.proyectos.get("p1").colectivo = {
    id: "cl-fiorito",
    nombre: "Asamblea de Fiorito",
    ubicacion: { tipoUbicacion: "LOCALIDAD", nombre: "Villa Fiorito" },
  };
  estado.mensajes = [
    {
      id: "mensaje-demo",
      tipo: "INVITACION",
      asunto: "Te invitamos a sumarte a la huerta",
      contenido: "Este es un mensaje de ejemplo para recorrer la bandeja.",
      fecha: "2026-11-08T12:00:00Z",
      esLeida: false,
      referencias: { proyectoId: "demo-huerta" },
    },
  ];
}
