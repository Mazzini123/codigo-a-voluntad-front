import { CATALOGO, unaColaboradora, unPerfil } from "./datosDemo.js";

function pagina(lista, params = {}) {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Number(params.limit) || 12);
  return {
    data: lista.slice((page - 1) * limit, page * limit),
    meta: {
      page,
      per_page: limit,
      total: lista.length,
      total_pages: Math.ceil(lista.length / limit),
    },
  };
}

export function rutasDeEdicionDemo(estado) {
  const proyecto = (id) => estado.proyectos.get(id);
  const perfil = (id, perfilId) => proyecto(id)?.perfiles.find((p) => p.id === perfilId);
  const idNuevo = () => `demo-${++estado.secuencia}-${Date.now()}`;
  const convertirHabilidades = (datos) => {
    const copia = { ...datos };
    for (const [campo, destino] of [
      ["codigosHabilidadesRequeridas", "habilidadesRequeridas"],
      ["codigosHabilidadesOpcionales", "habilidadesOpcionales"],
      ["codigosHabilidades", "habilidades"],
    ])
      if (copia[campo]) {
        copia[destino] = copia[campo]
          .map((codigo) => CATALOGO.find((h) => h.codigo === codigo))
          .filter(Boolean);
        delete copia[campo];
      }
    return copia;
  };
  const listaProyectos = (params) =>
    [...estado.proyectos.values()].filter(
      (p) =>
        (!params.estado || p.estado === params.estado) &&
        (!params.etiqueta || p.etiquetas.includes(params.etiqueta)) &&
        (!params.habilidad ||
          p.perfiles.some((perfil) =>
            perfil.habilidadesRequeridas.some((h) => h.codigo === params.habilidad),
          )),
    );
  return [
    [
      "GET",
      /^\/colectivos\/([^/]+)\/timeline$/,
      ([id]) => {
        const colectivo = estado.colectivos.get(id);
        if (!colectivo) return null;
        const eventos = [{ tipo: "ALTA_DEL_COLECTIVO", fecha: colectivo.fechaAlta }];
        if (colectivo.fechaBaja)
          eventos.push({ tipo: "BAJA_DEL_COLECTIVO", fecha: colectivo.fechaBaja });
        for (const p of estado.proyectos.values()) {
          if (p.colectivoId !== id) continue;
          const referencia = { proyecto: { id: p.id, titulo: p.titulo } };
          eventos.push({
            tipo: "PROYECTO_CREADO",
            fecha: p.fechaCreacion,
            ...referencia,
          });
          if (p.fechaFinalizacion)
            eventos.push({
              tipo: "PROYECTO_FINALIZADO",
              fecha: p.fechaFinalizacion,
              ...referencia,
            });
          for (const logro of p.logros)
            eventos.push({ tipo: "LOGRO", fecha: logro.fecha, logro, ...referencia });
          for (const avance of p.avances)
            eventos.push({ tipo: "AVANCE", fecha: avance.fecha, avance, ...referencia });
          for (const c of p.colaboraciones)
            if (c.estado === "FINALIZADA")
              eventos.push({
                tipo: "COLABORACION_CERRADA",
                fecha: c.fechaFin,
                colaborador: c.esPublica
                  ? {
                      id: c.colaborador.id,
                      nombre: c.colaborador.nombreFantasia || c.colaborador.nombre,
                    }
                  : null,
                ...referencia,
              });
        }
        return eventos
          .filter((e) => e.fecha)
          .sort((a, b) => Date.parse(a.fecha) - Date.parse(b.fecha));
      },
    ],
    ["GET", /^\/habilidades$/, (_, cuerpo, params) => pagina(CATALOGO, params)],
    [
      "GET",
      /^\/proyectos$/,
      (_, cuerpo, params) => pagina(listaProyectos(params), params),
    ],
    [
      "GET",
      /^\/colaboradores\/([^/]+)\/proyectos-potenciales$/,
      (_, cuerpo, params) =>
        pagina(
          listaProyectos(params).filter((p) => p.estado === "ABIERTO"),
          params,
        ),
    ],
    [
      "GET",
      /^\/colectivos$/,
      (_, cuerpo, params) => pagina([...estado.colectivos.values()], params),
    ],
    [
      "GET",
      /^\/colaboradores$/,
      (_, cuerpo, params) => pagina([...estado.colaboradores.values()], params),
    ],
    [
      "POST",
      /^\/colaboradores$/,
      (_, cuerpo) => {
        const persona = unaColaboradora(idNuevo(), convertirHabilidades(cuerpo));
        estado.colaboradores.set(persona.id, persona);
        return persona;
      },
    ],
    ...[
      ["colectivos", estado.colectivos],
      ["colaboradores", estado.colaboradores],
    ].flatMap(([nombre, mapa]) => [
      [
        "PUT",
        new RegExp(`^/${nombre}/([^/]+)$`),
        ([id], cuerpo) => {
          const entidad = mapa.get(id);
          return entidad ? Object.assign(entidad, convertirHabilidades(cuerpo)) : null;
        },
      ],
      [
        "GET",
        new RegExp(`^/${nombre}/([^/]+)/medios-de-contacto$`),
        ([id]) => mapa.get(id)?.mediosDeContacto ?? [],
      ],
      [
        "POST",
        new RegExp(`^/${nombre}/([^/]+)/medios-de-contacto$`),
        ([id], cuerpo) => {
          const entidad = mapa.get(id);
          if (!entidad) return null;
          (entidad.mediosDeContacto ??= []).push(cuerpo);
          return cuerpo;
        },
      ],
      [
        "DELETE",
        new RegExp(`^/${nombre}/([^/]+)/medios-de-contacto/([^/]+)/([^/]+)$`),
        ([id, tipo, valor]) => {
          const entidad = mapa.get(id);
          if (!entidad) return null;
          entidad.mediosDeContacto = (entidad.mediosDeContacto ?? []).filter(
            (m) => m.tipo !== tipo || m.valor !== valor,
          );
          return {};
        },
      ],
    ]),
    [
      "PUT",
      /^\/proyectos\/([^/]+)$/,
      ([id], cuerpo) => (proyecto(id) ? Object.assign(proyecto(id), cuerpo) : null),
    ],
    [
      "POST",
      /^\/proyectos\/([^/]+)\/finalizacion$/,
      ([id]) => {
        const p = proyecto(id);
        if (!p) return null;
        p.estado = "FINALIZADO";
        p.fechaFinalizacion = new Date().toISOString();
        for (const c of p.colaboraciones) {
          if (c.estado === "PENDIENTE") c.estado = "RECHAZADA";
          if (c.estado === "ACEPTADA") {
            c.estado = "FINALIZADA";
            c.fechaFin = p.fechaFinalizacion;
          }
        }
        return p;
      },
    ],
    ["GET", /^\/proyectos\/([^/]+)\/perfiles$/, ([id]) => proyecto(id)?.perfiles],
    [
      "GET",
      /^\/proyectos\/([^/]+)\/perfiles\/([^/]+)$/,
      ([id, perfilId]) => perfil(id, perfilId),
    ],
    [
      "POST",
      /^\/proyectos\/([^/]+)\/perfiles$/,
      ([id], cuerpo) => {
        const nuevo = unPerfil(idNuevo(), convertirHabilidades(cuerpo));
        proyecto(id)?.perfiles.push(nuevo);
        return nuevo;
      },
    ],
    [
      "PUT",
      /^\/proyectos\/([^/]+)\/perfiles\/([^/]+)$/,
      ([id, perfilId], cuerpo) => {
        const p = perfil(id, perfilId);
        return p
          ? Object.assign(p, convertirHabilidades(cuerpo), {
              versionEdicion: String(Number(p.versionEdicion) + 1),
            })
          : null;
      },
    ],
    [
      "DELETE",
      /^\/proyectos\/([^/]+)\/perfiles\/([^/]+)$/,
      ([id, perfilId]) => {
        const p = proyecto(id);
        if (!p) return null;
        p.perfiles = p.perfiles.filter((p) => p.id !== perfilId);
        return {};
      },
    ],
    [
      "GET",
      /^\/proyectos\/([^/]+)\/perfiles\/([^/]+)\/colaboradoras-potenciales$/,
      (_, cuerpo, params) =>
        pagina(
          [...estado.colaboradores.values()].map((colaborador) => ({
            colaborador,
            habilidadesOpcionalesQueTiene: [],
          })),
          params,
        ),
    ],
    [
      "POST",
      /^\/proyectos\/([^/]+)\/perfiles\/([^/]+)\/invitaciones$/,
      ([id], cuerpo) => {
        const mensaje = {
          id: idNuevo(),
          tipo: "INVITACION",
          asunto: "Invitacion de ejemplo",
          contenido: cuerpo.mensaje,
          fecha: new Date().toISOString(),
          esLeida: false,
          referencias: { proyectoId: id },
        };
        estado.mensajes.push(mensaje);
        return mensaje;
      },
    ],
    [
      "GET",
      /^\/proyectos\/([^/]+)\/colaboradores\/([^/]+)\/contacto$/,
      ([id, personaId]) =>
        proyecto(id)?.colaboraciones.some(
          (c) =>
            c.colaborador?.id === personaId && c.esPublica && c.estado === "ACEPTADA",
        )
          ? (estado.colaboradores.get(personaId)?.mediosDeContacto ?? [])
          : null,
    ],
    [
      "POST",
      /^\/proyectos\/([^/]+)\/colaboraciones\/([^/]+)\/retiro$/,
      ([id, colaboracionId]) => {
        const c = proyecto(id)?.colaboraciones.find((c) => c.id === colaboracionId);
        return c ? Object.assign(c, { estado: "RETIRADA" }) : null;
      },
    ],
    ...["logros", "avances"].flatMap((coleccion) => [
      [
        "GET",
        new RegExp(`^/proyectos/([^/]+)/${coleccion}$`),
        ([id]) => proyecto(id)?.[coleccion],
      ],
      [
        "POST",
        new RegExp(`^/proyectos/([^/]+)/${coleccion}$`),
        ([id], cuerpo) => {
          const p = proyecto(id);
          if (!p) return null;
          const nuevo = { ...cuerpo, id: idNuevo(), fecha: new Date().toISOString() };
          p[coleccion].push(nuevo);
          if (coleccion === "avances") Object.assign(p, cuerpo);
          return nuevo;
        },
      ],
      [
        "PUT",
        new RegExp(`^/proyectos/([^/]+)/${coleccion}/([^/]+)$`),
        ([id, elementoId], cuerpo) => {
          const dato = proyecto(id)?.[coleccion].find((dato) => dato.id === elementoId);
          return dato ? Object.assign(dato, cuerpo) : null;
        },
      ],
      [
        "DELETE",
        new RegExp(`^/proyectos/([^/]+)/${coleccion}/([^/]+)$`),
        ([id, elementoId]) => {
          const p = proyecto(id);
          if (!p) return null;
          p[coleccion] = p[coleccion].filter((dato) => dato.id !== elementoId);
          return {};
        },
      ],
    ]),
    [
      "GET",
      /^\/colaboradores\/([^/]+)\/notificaciones$/,
      (_, cuerpo, params) => ({
        ...pagina(
          estado.mensajes.filter(
            (m) =>
              params.leida === undefined ||
              m.esLeida === (String(params.leida) === "true"),
          ),
          params,
        ),
        meta: {
          ...pagina(estado.mensajes, params).meta,
          unread: estado.mensajes.filter((m) => !m.esLeida).length,
        },
      }),
    ],
    [
      "POST",
      /^\/colaboradores\/([^/]+)\/notificaciones\/([^/]+)\/lectura$/,
      ([, mensajeId]) => {
        const mensaje = estado.mensajes.find((m) => m.id === mensajeId);
        return mensaje ? Object.assign(mensaje, { esLeida: true }) : null;
      },
    ],
  ];
}
