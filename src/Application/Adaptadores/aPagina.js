export function aPagina(dto) {
  const meta = dto?.meta ?? {};
  return {
    items: dto?.data ?? [],
    pagina: meta.page,
    porPagina: meta.per_page,
    total: meta.total,
    totalPaginas: meta.total_pages,
    ...(Number.isInteger(meta.unread) && { noLeidas: meta.unread }),
  };
}
