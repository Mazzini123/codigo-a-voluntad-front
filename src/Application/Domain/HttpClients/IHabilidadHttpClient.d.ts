import type { HabilidadDto } from "../Entities/HabilidadDto";
import type { PaginaDto } from "../Entities/PaginaDto";
import type { PaginacionRequest } from "../Requests/App/PaginacionRequest";
import type { CrearHabilidadRequest } from "../Requests/Habilidad/CrearHabilidadRequest";

export interface IHabilidadHttpClient {
  listar(
    query?: PaginacionRequest,
    options?: { signal?: AbortSignal },
  ): Promise<PaginaDto<HabilidadDto>>;
  crear(
    request: CrearHabilidadRequest,
    options?: { signal?: AbortSignal },
  ): Promise<HabilidadDto>;
}
