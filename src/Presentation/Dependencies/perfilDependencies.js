import { crearListarPerfiles } from "@/Application/UseCases/Perfil/ListarPerfiles.js";
import { crearObtenerPerfil } from "@/Application/UseCases/Perfil/ObtenerPerfil.js";
import { crearCrearPerfil } from "@/Application/UseCases/Perfil/CrearPerfil.js";
import { crearActualizarPerfil } from "@/Application/UseCases/Perfil/ActualizarPerfil.js";
import { crearEliminarPerfil } from "@/Application/UseCases/Perfil/EliminarPerfil.js";
import { crearAgregarHabilidadRequerida } from "@/Application/UseCases/Perfil/AgregarHabilidadRequerida.js";
import { crearQuitarHabilidadRequerida } from "@/Application/UseCases/Perfil/QuitarHabilidadRequerida.js";
import { crearAgregarHabilidadOpcional } from "@/Application/UseCases/Perfil/AgregarHabilidadOpcional.js";
import { crearQuitarHabilidadOpcional } from "@/Application/UseCases/Perfil/QuitarHabilidadOpcional.js";
import { crearPerfilHttpClient } from "@/Infrastructure/HttpClients/PerfilHttpClient.js";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";

export function crearPerfilDependencies(http = axiosClient) {
  const httpClient = crearPerfilHttpClient(http);
  return {
    listarPerfiles: crearListarPerfiles(httpClient),
    obtenerPerfil: crearObtenerPerfil(httpClient),
    crearPerfil: crearCrearPerfil(httpClient),
    actualizarPerfil: crearActualizarPerfil(httpClient),
    eliminarPerfil: crearEliminarPerfil(httpClient),
    agregarHabilidadRequerida: crearAgregarHabilidadRequerida(httpClient),
    quitarHabilidadRequerida: crearQuitarHabilidadRequerida(httpClient),
    agregarHabilidadOpcional: crearAgregarHabilidadOpcional(httpClient),
    quitarHabilidadOpcional: crearQuitarHabilidadOpcional(httpClient),
  };
}

export const perfilDependencies = crearPerfilDependencies();
