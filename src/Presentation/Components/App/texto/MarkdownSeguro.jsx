import Markdown from "react-markdown";
import { EnlaceExterno } from "@/Presentation/Components/App/ui/EnlaceExterno.jsx";

const PERMITIDOS = [
  "p",
  "br",
  "strong",
  "em",
  "a",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "hr",
  "img",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
];

function encabezado(nivelBase, profundidad) {
  const Etiqueta = `h${Math.min(6, nivelBase + profundidad - 1)}`;
  return function Encabezado({ children }) {
    return <Etiqueta>{children}</Etiqueta>;
  };
}

function componentes(nivel) {
  return {
    a: ({ href, children }) => <EnlaceExterno url={href}>{children}</EnlaceExterno>,
    img: ({ alt }) => alt || null,
    h1: encabezado(nivel, 1),
    h2: encabezado(nivel, 2),
    h3: encabezado(nivel, 3),
    h4: encabezado(nivel, 4),
    h5: encabezado(nivel, 5),
    h6: encabezado(nivel, 6),
  };
}

const POR_NIVEL = new Map([2, 3, 4, 5, 6].map((nivel) => [nivel, componentes(nivel)]));

export default function MarkdownSeguro({ texto, nivel }) {
  return (
    <Markdown
      allowedElements={PERMITIDOS}
      unwrapDisallowed
      skipHtml
      components={POR_NIVEL.get(nivel) ?? POR_NIVEL.get(3)}
    >
      {texto}
    </Markdown>
  );
}
