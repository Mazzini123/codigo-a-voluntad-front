export const AYUDA_MARKDOWN =
  "Podés darle formato con Markdown: **negrita**, *cursiva*, listas con guiones y enlaces como [texto](https://…).";

const MARCAS = [
  [/!\[([^\]]*)\]\([^)]*\)/g, "$1"],
  [/\[([^\]]+)\]\([^)]*\)/g, "$1"],
  [/^[ \t]{0,3}#{1,6}[ \t]+/gm, ""],
  [/^[ \t]{0,3}>[ \t]?/gm, ""],
  [/^[ \t]*(?:[-*+]|\d+[.)])[ \t]+/gm, ""],
  [/^[ \t]*(?:[-*_][ \t]*){3,}$/gm, ""],
  [/```[^\n]*\n?/g, ""],
  [/\*\*(\S(?:.*?\S)?)\*\*/g, "$1"],
  [/(^|\W)__(\S(?:.*?\S)?)__(?=\W|$)/g, "$1$2"],
  [/\*(\S(?:.*?\S)?)\*/g, "$1"],
  [/(^|\W)_(\S(?:.*?\S)?)_(?=\W|$)/g, "$1$2"],
  [/`([^`]+)`/g, "$1"],
];

export function sinMarcas(texto) {
  if (!texto) return "";
  return MARCAS.reduce(
    (resultado, [patron, reemplazo]) => resultado.replace(patron, reemplazo),
    texto,
  )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
