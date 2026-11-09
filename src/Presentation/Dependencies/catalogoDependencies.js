import { crearListarProvincias } from "@/Application/UseCases/Catalogo/ListarProvincias.js";
import { crearCatalogoHttpClient } from "@/Infrastructure/HttpClients/CatalogoHttpClient.js";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";

export function crearCatalogoDependencies(http = axiosClient) {
  const httpClient = crearCatalogoHttpClient(http);
  return {
    listarProvincias: crearListarProvincias(httpClient),
  };
}

export const catalogoDependencies = crearCatalogoDependencies();
