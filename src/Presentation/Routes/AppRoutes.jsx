import { PantallaDiferida } from "./PantallaDiferida.jsx";
import { createRoutesFromElements, Route } from "react-router-dom";
import { AppLayout } from "../Components/App/AppLayout.jsx";
import { Raiz } from "../Components/App/Raiz.jsx";
import { BienvenidaPage } from "../Pages/BienvenidaPage.jsx";
import { CallbackPage } from "../Pages/CallbackPage.jsx";
import { ColaboradoraPage } from "../Pages/ColaboradoraPage.jsx";
import { ColectivoPage } from "../Pages/ColectivoPage.jsx";
import { HabilidadesPage } from "../Pages/HabilidadesPage.jsx";
import { LoginPage } from "../Pages/LoginPage.jsx";
import { InicioPage } from "../Pages/InicioPage.jsx";
import { MisProyectosPage } from "../Pages/MisProyectosPage.jsx";
import { NoEncontradaPage } from "../Pages/NoEncontradaPage.jsx";
import { ProyectoPage } from "../Pages/ProyectoPage.jsx";
import { ProyectosPage } from "../Pages/ProyectosPage.jsx";
import { SinPermisoPage } from "../Pages/SinPermisoPage.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { ROL_CUENTA } from "../../Application/Domain/Enums/ROL_CUENTA.js";
import { RUTA_BIENVENIDA, RUTA_MIS_PROYECTOS, RUTA_NUEVO_PROYECTO } from "./rutas.js";

const cargarAltaColaboradoraPage = () =>
  import("../Pages/AltaColaboradoraPage.jsx").then((modulo) => ({
    default: modulo.AltaColaboradoraPage,
  }));
const cargarAltaColectivoPage = () =>
  import("../Pages/AltaColectivoPage.jsx").then((modulo) => ({
    default: modulo.AltaColectivoPage,
  }));
const cargarNuevoProyectoPage = () =>
  import("../Pages/NuevoProyectoPage.jsx").then((modulo) => ({
    default: modulo.NuevoProyectoPage,
  }));
const cargarPerfilColaboradoraPage = () =>
  import("../Pages/PerfilColaboradoraPage.jsx").then((modulo) => ({
    default: modulo.PerfilColaboradoraPage,
  }));
const cargarPerfilColectivoPage = () =>
  import("../Pages/PerfilColectivoPage.jsx").then((modulo) => ({
    default: modulo.PerfilColectivoPage,
  }));

export const rutas = createRoutesFromElements(
  <Route element={<Raiz />}>
    <Route element={<AppLayout />}>
      <Route path="/" element={<InicioPage />} />
      <Route path="/proyectos" element={<ProyectosPage />} />
      <Route path="/proyectos/:id" element={<ProyectoPage />} />
      {import.meta.env.DEV && <Route path="/habilidades" element={<HabilidadesPage />} />}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<LoginPage registro />} />
      <Route path="/callback" element={<CallbackPage />} />
      <Route element={<ProtectedRoute permitirSinPerfil />}>
        <Route path={RUTA_BIENVENIDA} element={<BienvenidaPage />} />
        <Route
          path={`${RUTA_BIENVENIDA}/colectivo`}
          element={<PantallaDiferida cargar={cargarAltaColectivoPage} />}
        />
        <Route
          path={`${RUTA_BIENVENIDA}/colaboradora`}
          element={<PantallaDiferida cargar={cargarAltaColaboradoraPage} />}
        />
      </Route>
      <Route element={<ProtectedRoute roles={[ROL_CUENTA.COLECTIVO]} />}>
        <Route
          path="/colectivo/perfil"
          element={<PantallaDiferida cargar={cargarPerfilColectivoPage} />}
        />
        <Route path={RUTA_MIS_PROYECTOS} element={<MisProyectosPage />} />
        <Route
          path={RUTA_NUEVO_PROYECTO}
          element={<PantallaDiferida cargar={cargarNuevoProyectoPage} />}
        />
      </Route>
      <Route element={<ProtectedRoute roles={[ROL_CUENTA.COLABORADORA]} />}>
        <Route
          path="/colaboradora/perfil"
          element={<PantallaDiferida cargar={cargarPerfilColaboradoraPage} />}
        />
      </Route>
      <Route path="/colectivos/:id" element={<ColectivoPage />} />
      <Route path="/colaboradoras/:id" element={<ColaboradoraPage />} />
      <Route path="/sin-permiso" element={<SinPermisoPage />} />
      <Route path="*" element={<NoEncontradaPage />} />
    </Route>
  </Route>,
);
