const PROTOCOLOS_PERMITIDOS = new Set(["http:", "https:"]);

export function leerUrlExterna(valor) {
  const texto = valor?.trim();
  if (!texto || !URL.canParse(texto)) return null;
  const url = new URL(texto);
  const permitida =
    PROTOCOLOS_PERMITIDOS.has(url.protocol) && !url.username && !url.password;
  return permitida ? url : null;
}
