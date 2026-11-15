import { crearListarColectivos } from "@/Application/UseCases/Colectivo/ListarColectivos.js";
import { crearObtenerColectivo } from "@/Application/UseCases/Colectivo/ObtenerColectivo.js";
import { crearCrearColectivo } from "@/Application/UseCases/Colectivo/CrearColectivo.js";
import { crearActualizarColectivo } from "@/Application/UseCases/Colectivo/ActualizarColectivo.js";
import { crearDarDeBajaColectivo } from "@/Application/UseCases/Colectivo/DarDeBajaColectivo.js";
import { crearListarMediosDeContacto } from "@/Application/UseCases/Colectivo/ListarMediosDeContacto.js";
import { crearAgregarMedioDeContacto } from "@/Application/UseCases/Colectivo/AgregarMedioDeContacto.js";
import { crearQuitarMedioDeContacto } from "@/Application/UseCases/Colectivo/QuitarMedioDeContacto.js";
import { crearColectivoHttpClient } from "@/Infrastructure/HttpClients/ColectivoHttpClient.js";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";

export function crearColectivoDependencies(http = axiosClient) {
  const httpClient = crearColectivoHttpClient(http);
  return {
    listarColectivos: crearListarColectivos(httpClient),
    obtenerColectivo: crearObtenerColectivo(httpClient),
    crearColectivo: crearCrearColectivo(httpClient),
    actualizarColectivo: crearActualizarColectivo(httpClient),
    darDeBajaColectivo: crearDarDeBajaColectivo(httpClient),
    listarMediosDeContacto: crearListarMediosDeContacto(httpClient),
    agregarMedioDeContacto: crearAgregarMedioDeContacto(httpClient),
    quitarMedioDeContacto: crearQuitarMedioDeContacto(httpClient),
  };
}

export const colectivoDependencies = crearColectivoDependencies();
