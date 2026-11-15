export function encajeDeHabilidades(perfil, codigosPropios) {
  const total = perfil?.habilidadesRequeridas?.length ?? 0;
  if (total === 0) return null;
  const tiene = perfil.habilidadesRequeridas.filter((h) =>
    codigosPropios.has(h.codigo),
  ).length;
  return { tiene, total };
}

export function requeridasCubiertas(perfil, codigosPropios) {
  return (perfil?.habilidadesRequeridas ?? []).map((habilidad) => ({
    habilidad,
    tiene: codigosPropios.has(habilidad.codigo),
  }));
}

export function habilidadesFueraDelPerfil(perfil, habilidades) {
  const requeridas = new Set(
    (perfil?.habilidadesRequeridas ?? []).map(({ codigo }) => codigo),
  );
  return (habilidades ?? []).filter(({ codigo }) => !requeridas.has(codigo));
}
