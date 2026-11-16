import { PERMISO } from "@/Application/Domain/Enums/PERMISO.js";
import { ROL_CUENTA } from "@/Application/Domain/Enums/ROL_CUENTA.js";
import { TIPO_CONTEXTO } from "@/Application/Domain/Enums/TIPO_CONTEXTO.js";
import { enlacesPrincipalesPara, seccionesDeAdministracionPara } from "./navegacion.js";
import {
  inicioPorContexto,
  inicioPorRol,
  RUTA_ADMIN,
  RUTA_PROYECTOS,
  RUTA_RESUMEN_COLECTIVO,
} from "./rutas.js";

const SECCIONES = [
  { ruta: "/admin/a", texto: "A", icono: "lista", permiso: PERMISO.PROYECTO_DESTACAR },
  { ruta: "/admin/b", texto: "B", icono: "lista", permiso: PERMISO.REVISION_VER },
  { ruta: "/admin/c", texto: "C", icono: "lista", permiso: PERMISO.AUDITORIA_VER },
];

function cuentaConPermisos(permisos) {
  return {
    rol: ROL_CUENTA.ADMINISTRACION,
    contextoActual: { tipo: TIPO_CONTEXTO.ADMINISTRACION, rol: "ADMIN", permisos },
  };
}

test("los valores nuevos coinciden con los del back", () => {
  expect(ROL_CUENTA.ADMINISTRACION).toBe("ADMINISTRACION");
  expect(TIPO_CONTEXTO.ADMINISTRACION).toBe("ADMINISTRACION");
  expect(PERMISO.PROYECTO_DESTACAR).toBe("PROYECTO_DESTACAR");
  expect(PERMISO.REVISION_VER).toBe("REVISION_VER");
  expect(PERMISO.REVISION_RESOLVER).toBe("REVISION_RESOLVER");
  expect(PERMISO.AUDITORIA_VER).toBe("AUDITORIA_VER");
  expect(PERMISO.ADMIN_GESTIONAR).toBe("ADMIN_GESTIONAR");
});

test("la administración empieza en /admin y los demás roles conservan su inicio", () => {
  expect(RUTA_ADMIN).toBe("/admin");
  expect(inicioPorRol(ROL_CUENTA.ADMINISTRACION)).toBe(RUTA_ADMIN);
  expect(inicioPorContexto({ tipo: TIPO_CONTEXTO.ADMINISTRACION })).toBe(RUTA_ADMIN);
  expect(inicioPorContexto({ tipo: TIPO_CONTEXTO.COLECTIVO })).toBe(
    RUTA_RESUMEN_COLECTIVO,
  );
  expect(inicioPorContexto({ tipo: TIPO_CONTEXTO.COLABORADOR })).toBe(RUTA_PROYECTOS);
});

test("el menú principal de la administración ofrece Proyectos y Administración", () => {
  expect(enlacesPrincipalesPara(ROL_CUENTA.ADMINISTRACION)).toEqual([
    { ruta: RUTA_PROYECTOS, texto: "Proyectos" },
    { ruta: RUTA_ADMIN, texto: "Administración" },
  ]);
});

test("cada sección aparece solo si el contexto tiene su permiso", () => {
  const textos = (permisos) =>
    seccionesDeAdministracionPara(cuentaConPermisos(permisos), SECCIONES).map(
      ({ texto }) => texto,
    );
  expect(
    textos([PERMISO.PROYECTO_DESTACAR, PERMISO.REVISION_VER, PERMISO.AUDITORIA_VER]),
  ).toEqual(["A", "B", "C"]);
  expect(textos([PERMISO.REVISION_VER])).toEqual(["B"]);
  expect(textos([])).toEqual([]);
});
