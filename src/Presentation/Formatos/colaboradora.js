export function nombreVisible(colaboradora) {
  if (!colaboradora) return "";
  const nombreCompleto = [colaboradora.nombre, colaboradora.apellido]
    .filter(Boolean)
    .join(" ");
  return (
    colaboradora.nombreFantasia ||
    nombreCompleto ||
    colaboradora.cuentaGit ||
    "Colaboradora"
  );
}
