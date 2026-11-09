import { PantallaDiferida } from "./PantallaDiferida.jsx";
import { createRoutesFromElements, Route } from "react-router-dom";
import { MarcoDeLaApp } from "@/Presentation/Components/App/layout/MarcoDeLaApp.jsx";
import { MarcoDelPanelDelColectivo } from "@/Presentation/Components/Colectivo/MarcoDelPanelDelColectivo.jsx";
import { Raiz } from "@/Presentation/Components/App/layout/Raiz.jsx";
import { BienvenidaPage } from "@/Presentation/Pages/ingreso/BienvenidaPage.jsx";
import { CallbackPage } from "@/Presentation/Pages/ingreso/CallbackPage.jsx";
import { ColaboradoraPage } from "@/Presentation/Pages/publicas/ColaboradoraPage.jsx";
import { ColectivoPage } from "@/Presentation/Pages/publicas/ColectivoPage.jsx";
import { HabilidadesPage } from "@/Presentation/Pages/publicas/HabilidadesPage.jsx";
import { LoginPage } from "@/Presentation/Pages/ingreso/LoginPage.jsx";
import { InicioPage } from "@/Presentation/Pages/publicas/InicioPage.jsx";
import { MisProyectosPage } from "@/Presentation/Pages/colectivo/MisProyectosPage.jsx";
import { ErrorInesperadoPage } from "@/Presentation/Pages/sistema/ErrorInesperadoPage.jsx";
import { NoEncontradaPage } from "@/Presentation/Pages/sistema/NoEncontradaPage.jsx";
import { PostulacionesPendientesPage } from "@/Presentation/Pages/colectivo/PostulacionesPendientesPage.jsx";
import { ProyectoPage } from "@/Presentation/Pages/publicas/ProyectoPage.jsx";
import { ProyectosPage } from "@/Presentation/Pages/publicas/ProyectosPage.jsx";
import { ResumenColectivoPage } from "@/Presentation/Pages/colectivo/ResumenColectivoPage.jsx";
import { SinPermisoPage } from "@/Presentation/Pages/sistema/SinPermisoPage.jsx";
import { RutaProtegida } from "./RutaProtegida.jsx";
import { RutaDelDueno } from "./RutaDelDueno.jsx";
import { ROL_CUENTA } from "@/Application/Domain/Enums/ROL_CUENTA.js";
import {
  RUTA_ADMINISTRAR_PROYECTO,
  RUTA_ALTA_COLABORADORA,
  RUTA_ALTA_COLECTIVO,
  RUTA_AVANCE_DEL_PROYECTO,
  RUTA_BIENVENIDA,
  RUTA_CALLBACK,
  RUTA_COLABORADORA,
  RUTA_COLABORADORAS_POTENCIALES,
  RUTA_CONTACTO_DE_COLABORADORA,
  RUTA_COLECTIVO,
  RUTA_HABILIDADES,
  RUTA_INICIO,
  RUTA_LOGIN,
  RUTA_MENSAJES,
  RUTA_MIS_PROYECTOS,
  RUTA_NUEVO_PROYECTO,
  RUTA_PERFIL_COLABORADORA,
  RUTA_PERFIL_COLECTIVO,
  RUTA_POSTULACIONES_COLABORADORA,
  RUTA_POSTULACIONES_COLECTIVO,
  RUTA_POSTULACIONES_RECIBIDAS,
  RUTA_PROYECTO,
  RUTA_PROYECTOS,
  RUTA_REGISTRO,
  RUTA_RESUMEN_COLECTIVO,
  RUTA_SIN_PERMISO,
  TIPO_DE_PANTALLA,
} from "./rutas.js";

const cargarAvanceDelProyecto = () =>
  import("@/Presentation/Pages/publicas/AvancePage.jsx");
const cargarAdministrarProyecto = () =>
  import("@/Presentation/Pages/colectivo/AdministrarProyectoPage.jsx");
const cargarPostulacionesRecibidas = () =>
  import("@/Presentation/Pages/colectivo/PostulacionesRecibidasPage.jsx");
const cargarColaboradorasPotenciales = () =>
  import("@/Presentation/Pages/colectivo/ColaboradorasPotencialesPage.jsx");
const cargarContactoDeColaboradora = () =>
  import("@/Presentation/Pages/colectivo/ContactoDeColaboradoraPage.jsx");

const cargarAltaColaboradoraPage = () =>
  import("@/Presentation/Pages/ingreso/AltaColaboradoraPage.jsx").then((modulo) => ({
    default: modulo.AltaColaboradoraPage,
  }));
const cargarAltaColectivoPage = () =>
  import("@/Presentation/Pages/ingreso/AltaColectivoPage.jsx").then((modulo) => ({
    default: modulo.AltaColectivoPage,
  }));
const cargarNuevoProyectoPage = () =>
  import("@/Presentation/Pages/colectivo/NuevoProyectoPage.jsx").then((modulo) => ({
    default: modulo.NuevoProyectoPage,
  }));
const cargarPerfilColaboradoraPage = () =>
  import("@/Presentation/Pages/colaboradora/PerfilColaboradoraPage.jsx").then(
    (modulo) => ({
      default: modulo.PerfilColaboradoraPage,
    }),
  );
const cargarMisPostulacionesPage = () =>
  import("@/Presentation/Pages/colaboradora/MisPostulacionesPage.jsx").then((modulo) => ({
    default: modulo.MisPostulacionesPage,
  }));
const cargarMensajesPage = () =>
  import("@/Presentation/Pages/colaboradora/MensajesPage.jsx").then((modulo) => ({
    default: modulo.MensajesPage,
  }));
const cargarPerfilColectivoPage = () =>
  import("@/Presentation/Pages/colectivo/PerfilColectivoPage.jsx").then((modulo) => ({
    default: modulo.PerfilColectivoPage,
  }));

export const rutas = createRoutesFromElements(
  <Route element={<Raiz />} errorElement={<ErrorInesperadoPage />}>
    <Route element={<MarcoDeLaApp />}>
      <Route errorElement={<ErrorInesperadoPage />}>
        <Route
          path={RUTA_INICIO}
          element={<InicioPage />}
          handle={{ tipoDePantalla: TIPO_DE_PANTALLA.INICIO }}
        />
        <Route
          path={RUTA_PROYECTOS}
          element={<ProyectosPage />}
          handle={{ tipoDePantalla: TIPO_DE_PANTALLA.EXPLORACION }}
        />
        <Route
          path={RUTA_PROYECTO}
          element={<ProyectoPage />}
          handle={{ tipoDePantalla: TIPO_DE_PANTALLA.EXPLORACION }}
        />
        <Route
          path={RUTA_AVANCE_DEL_PROYECTO}
          element={<PantallaDiferida cargar={cargarAvanceDelProyecto} />}
          handle={{ tipoDePantalla: TIPO_DE_PANTALLA.EXPLORACION }}
        />
        {import.meta.env.DEV && (
          <Route path={RUTA_HABILIDADES} element={<HabilidadesPage />} />
        )}
        <Route
          path={RUTA_LOGIN}
          element={<LoginPage />}
          handle={{ tipoDePantalla: TIPO_DE_PANTALLA.ACCESO }}
        />
        <Route
          path={RUTA_REGISTRO}
          element={<LoginPage registro />}
          handle={{ tipoDePantalla: TIPO_DE_PANTALLA.ACCESO }}
        />
        <Route path={RUTA_CALLBACK} element={<CallbackPage />} />
        <Route element={<RutaProtegida permitirSinPerfil />}>
          <Route path={RUTA_BIENVENIDA} element={<BienvenidaPage />} />
          <Route
            path={RUTA_ALTA_COLECTIVO}
            element={<PantallaDiferida cargar={cargarAltaColectivoPage} />}
          />
          <Route
            path={RUTA_ALTA_COLABORADORA}
            element={<PantallaDiferida cargar={cargarAltaColaboradoraPage} />}
          />
        </Route>
        <Route element={<RutaProtegida roles={[ROL_CUENTA.COLECTIVO]} />}>
          <Route
            path={RUTA_PERFIL_COLECTIVO}
            element={<PantallaDiferida cargar={cargarPerfilColectivoPage} />}
          />
          <Route
            element={<MarcoDelPanelDelColectivo />}
            handle={{ tipoDePantalla: TIPO_DE_PANTALLA.PANEL }}
          >
            <Route path={RUTA_RESUMEN_COLECTIVO} element={<ResumenColectivoPage />} />
            <Route path={RUTA_MIS_PROYECTOS} element={<MisProyectosPage />} />
            <Route
              path={RUTA_POSTULACIONES_COLECTIVO}
              element={<PostulacionesPendientesPage />}
            />
          </Route>
          <Route
            element={
              <RutaDelDueno sinPermiso="Solo el colectivo dueño puede administrar este proyecto." />
            }
          >
            <Route
              path={RUTA_ADMINISTRAR_PROYECTO}
              element={<PantallaDiferida cargar={cargarAdministrarProyecto} />}
            />
          </Route>
          <Route
            element={
              <RutaDelDueno sinPermiso="Solo el colectivo dueño puede gestionar estas postulaciones." />
            }
          >
            <Route
              path={RUTA_POSTULACIONES_RECIBIDAS}
              element={<PantallaDiferida cargar={cargarPostulacionesRecibidas} />}
            />
          </Route>
          <Route
            element={
              <RutaDelDueno sinPermiso="Solo el colectivo dueño puede buscar colaboradoras para este proyecto." />
            }
          >
            <Route
              path={RUTA_COLABORADORAS_POTENCIALES}
              element={<PantallaDiferida cargar={cargarColaboradorasPotenciales} />}
            />
          </Route>
          <Route
            element={
              <RutaDelDueno sinPermiso="Solo el colectivo dueño puede ver los datos de contacto de quienes colaboran en este proyecto." />
            }
          >
            <Route
              path={RUTA_CONTACTO_DE_COLABORADORA}
              element={<PantallaDiferida cargar={cargarContactoDeColaboradora} />}
            />
          </Route>
          <Route
            path={RUTA_NUEVO_PROYECTO}
            element={<PantallaDiferida cargar={cargarNuevoProyectoPage} />}
          />
        </Route>
        <Route element={<RutaProtegida roles={[ROL_CUENTA.COLABORADORA]} />}>
          <Route
            path={RUTA_PERFIL_COLABORADORA}
            element={<PantallaDiferida cargar={cargarPerfilColaboradoraPage} />}
          />
          <Route
            path={RUTA_POSTULACIONES_COLABORADORA}
            element={<PantallaDiferida cargar={cargarMisPostulacionesPage} />}
          />
          <Route
            path={RUTA_MENSAJES}
            element={<PantallaDiferida cargar={cargarMensajesPage} />}
          />
        </Route>
        <Route
          path={RUTA_COLECTIVO}
          element={<ColectivoPage />}
          handle={{ tipoDePantalla: TIPO_DE_PANTALLA.EXPLORACION }}
        />
        <Route
          path={RUTA_COLABORADORA}
          element={<ColaboradoraPage />}
          handle={{ tipoDePantalla: TIPO_DE_PANTALLA.EXPLORACION }}
        />
        <Route path={RUTA_SIN_PERMISO} element={<SinPermisoPage />} />
        <Route path="*" element={<NoEncontradaPage />} />
      </Route>
    </Route>
  </Route>,
);
