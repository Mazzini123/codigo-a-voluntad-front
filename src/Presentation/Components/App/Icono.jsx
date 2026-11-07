const TRAZOS = {
  alerta: ["M12 3.5 2.5 20h19z", "M12 10v4.5", "M12 17.5h.01"],
  aviso: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M12 7.5V13", "M12 16.5h.01"],
  exito: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "m8 12.5 2.8 2.8L16 10"],
  info: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M12 11v5.5", "M12 7.5h.01"],
  menu: ["M4 7h16", "M4 12h16", "M4 17h16"],
  reintentar: ["M20 12a8 8 0 1 1-2.35-5.65", "M20 4v5h-5"],
  tilde: ["m5 12.5 4.5 4.5L19 7.5"],
  cruz: ["M7 7l10 10", "M17 7 7 17"],
  guion: ["M6 12h12"],
  flechaIzquierda: ["m14.5 6-6 6 6 6"],
  flechaDerecha: ["m9.5 6 6 6-6 6"],
  vacio: ["M3 13h5l1.5 2.5h5L16 13h5", "M5.5 5h13L21 13v6H3v-6z"],
};

const TAMANOS = { 16: 16, 20: 20, 24: 24, 32: 32 };

export function Icono({ nombre, tamano = 20, className, etiqueta }) {
  const lado = TAMANOS[tamano] ?? 20;
  const accesibilidad = etiqueta
    ? { role: "img", "aria-label": etiqueta }
    : { "aria-hidden": "true", focusable: "false" };
  return (
    <svg
      width={lado}
      height={lado}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...accesibilidad}
    >
      {TRAZOS[nombre].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
