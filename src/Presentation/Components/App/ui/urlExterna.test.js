import { leerUrlExterna } from "./urlExterna.js";

test.each([
  "https://github.com/comedor/turnos",
  "http://turnos.example.org",
  "  https://instagram.com/fiorito  ",
])("acepta %s", (valor) => {
  expect(leerUrlExterna(valor)).toBeInstanceOf(URL);
});

test.each([
  "javascript:alert(1)",
  "data:text/html,<script>alert(1)</script>",
  "https://usuario:clave@ejemplo.org",
  "instagram.com/fiorito",
  "/proyectos",
  "",
  null,
  undefined,
])("rechaza %s", (valor) => {
  expect(leerUrlExterna(valor)).toBeNull();
});
