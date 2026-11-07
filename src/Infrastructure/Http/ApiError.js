export class ApiError extends Error {
  constructor({ status = null, mensaje, esReintentable = false, issues = [], cause }) {
    super(mensaje, { cause });
    this.name = "ApiError";
    this.status = status;
    this.mensaje = mensaje;
    this.esReintentable = esReintentable;
    this.issues = issues;
  }
}
