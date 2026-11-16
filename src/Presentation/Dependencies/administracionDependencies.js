import { crearDarDeBajaColectivo } from "@/Application/UseCases/Administracion/DarDeBajaColectivo.js";
import { crearDarDeBajaProyecto } from "@/Application/UseCases/Administracion/DarDeBajaProyecto.js";
import { crearDestacarProyecto } from "@/Application/UseCases/Administracion/DestacarProyecto.js";
import { crearListarAuditoria } from "@/Application/UseCases/Administracion/ListarAuditoria.js";
import { crearListarDestacadosDeAdministracion } from "@/Application/UseCases/Administracion/ListarDestacadosDeAdministracion.js";
import { crearListarProyectosParaBaja } from "@/Application/UseCases/Administracion/ListarProyectosParaBaja.js";
import { crearListarRevisiones } from "@/Application/UseCases/Administracion/ListarRevisiones.js";
import { crearPublicarTerminos } from "@/Application/UseCases/Administracion/PublicarTerminos.js";
import { crearQuitarDestacado } from "@/Application/UseCases/Administracion/QuitarDestacado.js";
import { crearResolverRevision } from "@/Application/UseCases/Administracion/ResolverRevision.js";
import { crearAdministracionHttpClient } from "@/Infrastructure/HttpClients/AdministracionHttpClient.js";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";

export function crearAdministracionDependencies(http = axiosClient) {
  const httpClient = crearAdministracionHttpClient(http);
  return {
    listarProyectosParaBaja: crearListarProyectosParaBaja(httpClient),
    listarDestacados: crearListarDestacadosDeAdministracion(httpClient),
    destacarProyecto: crearDestacarProyecto(httpClient),
    quitarDestacado: crearQuitarDestacado(httpClient),
    listarAuditoria: crearListarAuditoria(httpClient),
    listarRevisiones: crearListarRevisiones(httpClient),
    resolverRevision: crearResolverRevision(httpClient),
    publicarTerminos: crearPublicarTerminos(httpClient),
    darDeBajaProyecto: crearDarDeBajaProyecto(httpClient),
    darDeBajaColectivo: crearDarDeBajaColectivo(httpClient),
  };
}

export const administracionDependencies = crearAdministracionDependencies();
