export function idsDeCampo(id) {
  return { ayuda: `${id}-ayuda`, error: `${id}-error` };
}

export function describir(id, { ayuda, error }) {
  const ids = idsDeCampo(id);
  return [ayuda && ids.ayuda, error && ids.error].filter(Boolean).join(" ") || undefined;
}
