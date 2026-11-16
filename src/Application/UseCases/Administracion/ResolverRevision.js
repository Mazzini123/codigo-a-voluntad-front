export function crearResolverRevision(httpClient) {
  return function resolverRevision(revisionId, { estado, nota }, options = {}) {
    const notaLimpia = nota?.trim();
    const request = { estado, ...(notaLimpia && { nota: notaLimpia }) };
    return httpClient.resolverRevision(revisionId, request, options);
  };
}
