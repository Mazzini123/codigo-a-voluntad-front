import { MENSAJES_DE_SESION } from "./mensajesDeError.js";

export class ApiError extends Error {
  constructor({
    status = null,
    codigo = null,
    mensaje,
    esReintentable = false,
    issues = [],
    detalle = null,
    cause,
  }) {
    super(mensaje, { cause });
    this.name = "ApiError";
    this.status = status;
    this.codigo = codigo;
    this.esReintentable = esReintentable;
    this.issues = issues;
    this.detalle = detalle;
  }

  get mensaje() {
    return this.message;
  }

  get esDeSesion() {
    return Boolean(this.codigo && MENSAJES_DE_SESION.has(this.codigo));
  }

  conMensaje(mensaje) {
    return new ApiError({
      status: this.status,
      codigo: this.codigo,
      mensaje,
      esReintentable: this.esReintentable,
      issues: this.issues,
      detalle: this.detalle,
      cause: this.cause,
    });
  }
}
