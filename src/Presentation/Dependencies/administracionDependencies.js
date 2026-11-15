import { crearDestacarProyecto } from "@/Application/UseCases/Administracion/DestacarProyecto.js";
import { crearListarAuditoria } from "@/Application/UseCases/Administracion/ListarAuditoria.js";
import { crearListarRevisiones } from "@/Application/UseCases/Administracion/ListarRevisiones.js";
import { crearQuitarDestacado } from "@/Application/UseCases/Administracion/QuitarDestacado.js";
import { crearResolverRevision } from "@/Application/UseCases/Administracion/ResolverRevision.js";
import { crearAdministracionHttpClient } from "@/Infrastructure/HttpClients/AdministracionHttpClient.js";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";

export function crearAdministracionDependencies(http = axiosClient) {
  const httpClient = crearAdministracionHttpClient(http);
  return {
    destacarProyecto: crearDestacarProyecto(httpClient),
    quitarDestacado: crearQuitarDestacado(httpClient),
    listarAuditoria: crearListarAuditoria(httpClient),
    listarRevisiones: crearListarRevisiones(httpClient),
    resolverRevision: crearResolverRevision(httpClient),
  };
}

export const administracionDependencies = crearAdministracionDependencies();
