import {
  avisoDeCopiado,
  esContribucionAnonimaAceptada,
  etiquetaDeMedio,
  puedeVerContacto,
  textoDeCopiar,
  tituloDeContacto,
} from "./contacto.js";

test("etiqueta cada tipo y deja el desconocido tal cual", () => {
  expect(etiquetaDeMedio("EMAIL")).toBe("Email");
  expect(etiquetaDeMedio("WHATSAPP")).toBe("WhatsApp");
  expect(etiquetaDeMedio("SMS")).toBe("SMS");
  expect(etiquetaDeMedio("TELEGRAM")).toBe("TELEGRAM");
});

test("arma los textos de copiar según el tipo", () => {
  expect(textoDeCopiar("EMAIL")).toBe("Copiar email");
  expect(textoDeCopiar("WHATSAPP")).toBe("Copiar WhatsApp");
  expect(avisoDeCopiado("EMAIL")).toBe("Copiaste el email");
  expect(avisoDeCopiado("SMS")).toBe("Copiaste el SMS");
  expect(avisoDeCopiado("TELEGRAM")).toBe("Copiaste el TELEGRAM");
});

test("el título lleva el nombre solo si se conoce", () => {
  expect(tituloDeContacto("Ada")).toBe("Datos de contacto de Ada");
  expect(tituloDeContacto("")).toBe("Datos de contacto");
});

test("el acceso al contacto pide aceptada, pública y con id", () => {
  const base = { estado: "ACEPTADA", esPublica: true, colaborador: { id: "a" } };
  expect(puedeVerContacto(base)).toBe(true);
  expect(puedeVerContacto({ ...base, esPublica: undefined })).toBe(true);
  expect(puedeVerContacto({ ...base, esPublica: false })).toBe(false);
  expect(puedeVerContacto({ ...base, estado: "PENDIENTE" })).toBe(false);
  expect(puedeVerContacto({ ...base, colaborador: {} })).toBe(false);
  expect(puedeVerContacto(null)).toBe(false);
});

test("la contribución anónima aceptada se distingue de las demás", () => {
  expect(esContribucionAnonimaAceptada({ estado: "ACEPTADA", esPublica: false })).toBe(
    true,
  );
  expect(esContribucionAnonimaAceptada({ estado: "ACEPTADA", esPublica: true })).toBe(
    false,
  );
  expect(esContribucionAnonimaAceptada({ estado: "PENDIENTE", esPublica: false })).toBe(
    false,
  );
});
