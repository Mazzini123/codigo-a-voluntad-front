import { crearListarColaboradores } from "@/Application/UseCases/Colaborador/ListarColaboradores.js";
import { crearObtenerColaborador } from "@/Application/UseCases/Colaborador/ObtenerColaborador.js";
import { crearCrearColaborador } from "@/Application/UseCases/Colaborador/CrearColaborador.js";
import { crearActualizarColaborador } from "@/Application/UseCases/Colaborador/ActualizarColaborador.js";
import { crearAgregarPronombre } from "@/Application/UseCases/Colaborador/AgregarPronombre.js";
import { crearQuitarPronombre } from "@/Application/UseCases/Colaborador/QuitarPronombre.js";
import { crearAgregarHabilidadAColaborador } from "@/Application/UseCases/Colaborador/AgregarHabilidadAColaborador.js";
import { crearQuitarHabilidadDeColaborador } from "@/Application/UseCases/Colaborador/QuitarHabilidadDeColaborador.js";
import { crearAgregarMedioDeContacto } from "@/Application/UseCases/Colaborador/AgregarMedioDeContacto.js";
import { crearQuitarMedioDeContacto } from "@/Application/UseCases/Colaborador/QuitarMedioDeContacto.js";
import { crearListarMediosDeContacto } from "@/Application/UseCases/Colaborador/ListarMediosDeContacto.js";
import { crearColaboradorHttpClient } from "@/Infrastructure/HttpClients/ColaboradorHttpClient.js";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";

export function crearColaboradorDependencies(http = axiosClient) {
  const httpClient = crearColaboradorHttpClient(http);
  return {
    listarColaboradores: crearListarColaboradores(httpClient),
    obtenerColaborador: crearObtenerColaborador(httpClient),
    crearColaborador: crearCrearColaborador(httpClient),
    actualizarColaborador: crearActualizarColaborador(httpClient),
    agregarPronombre: crearAgregarPronombre(httpClient),
    quitarPronombre: crearQuitarPronombre(httpClient),
    agregarHabilidadAColaborador: crearAgregarHabilidadAColaborador(httpClient),
    quitarHabilidadDeColaborador: crearQuitarHabilidadDeColaborador(httpClient),
    listarMediosDeContacto: crearListarMediosDeContacto(httpClient),
    agregarMedioDeContacto: crearAgregarMedioDeContacto(httpClient),
    quitarMedioDeContacto: crearQuitarMedioDeContacto(httpClient),
  };
}

export const colaboradorDependencies = crearColaboradorDependencies();
