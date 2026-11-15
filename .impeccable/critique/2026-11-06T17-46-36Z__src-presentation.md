---
target: pantallas hechas (src/Presentation)
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\lucio\\Desktop\\codigo-a-voluntad-front\\src\\Presentation"
timestamp: 2026-11-06T17-46-36Z
slug: src-presentation
---
Method: dual-agent (A: revisión de diseño sobre el código · B: detector)

## Design Health Score

| # | Heurística | Nota | Problema principal |
|---|---|---|---|
| 1 | Visibilidad del estado | 3 | Sin "Mis postulaciones"; "Ya te postulaste" en la tarjeta incluye rechazadas. |
| 2 | Lenguaje del mundo real | 3 | El perfil no tiene nombre: su título es la descripción entera. |
| 3 | Control y libertad | 3 | No se pueden editar medios de contacto ni retirar una postulación. |
| 4 | Consistencia | 3 | "Pendiente" usa el sello de "Límite alcanzado"; "Ya te postulaste" en la franja coral del encaje. |
| 5 | Prevención de errores | 3 | El diálogo promete privacidad que la aceptación automática no cumple. |
| 6 | Reconocer antes que recordar | 3 | En celular, el único enlace queda detrás de un menú. |
| 7 | Flexibilidad y eficiencia | 2 | Solo búsqueda por etiqueta; las etiquetas no son enlaces. |
| 8 | Estética y minimalismo | 3 | Perfil del detalle denso (hasta 8 bloques). |
| 9 | Recuperación de errores | 3 | En celular el aviso de error se corta a 3 líneas. |
| 10 | Ayuda y documentación | 2 | Nada explica qué pasa después de postularse ni qué sigue para un colectivo. |
| **Total** | | **28/40** | **Good** (antes 27/40) |

## Design Specificity Verdict

Voz y señales propias (sellos, franja de encaje, "La tenés", privacidad dicha, voseo); composición de bolsa de trabajo. La "cartelera" no llega al layout y la tarjeta no dice qué colectivo pide ayuda (pendiente del back). Detector: 0 hallazgos en src/Presentation y src/Styles, también con --no-config. Overlay en navegador no disponible (panel oculto).

## Priority Issues

- [P1] El recorrido del colectivo termina en su propio formulario (rutas.js:4; AltaColectivoPage.jsx:25-26 promete publicar). En navegador: en su propio proyecto ve tres veces "Las postulaciones son para colaboradoras." Fix: pantalla de inicio honesta hasta la spec 04. /impeccable onboard.
- [P1] El diálogo promete "Tus datos de contacto se comparten solo si el colectivo acepta" (DialogoDePostulacion.jsx:50-53) aun con aceptación automática (usePostularse.js:7). Fix: texto según modoAceptacion. /impeccable clarify.
- [P2] "Ya te postulaste" en la tarjeta: por proyecto, incluye rechazadas, oculta el encaje de otros perfiles y usa coral (TarjetaProyecto.jsx:33-34, 58-60). /impeccable clarify + polish.
- [P2] Menú hamburguesa para un solo enlace en celular (Cabecera.jsx:43-53, navegacion.js:1-3). /impeccable adapt.
- [P2] La edición de colaboradora menciona medios de contacto que no muestra (PerfilColaboradoraPage.jsx:34). /impeccable clarify.

## Persona Red Flags

- Jordan (colectivo, primera vez): tres "no se puede cambiar" sin salida, 5 opciones de ubicación, termina en su formulario.
- Sam (lector de pantalla): h3 de perfil son párrafos; el buscador de habilidades anuncia en cada tecla; "Pendiente" con ícono de alerta.
- Casey (celular): menú con un enlace, lista de habilidades larga en el alta, avisos cortados.
- Marta (coordinadora en PC compartida): sesión en localStorage, medios de contacto a la vista, nada para hacer en la plataforma.

## Minor Observations

R45 contradicho en docs/decisiones.md:40; R12 parcial (cuenta sin perfil sin explicación); "Todavía no cargó avances." sin sujeto; chip "requerida" en el perfil público de colaboradora; .oculto duplicado de TextoOculto; 320px suelto en la grilla; sin primera/última página.

## Questions to Consider

1. ¿La spec 04 va antes que cualquier otro pulido?
2. ¿El back puede exponer un título corto por perfil?
3. ¿La cartelera es metáfora visual o solo un nombre?
