export class ApiError extends Error {
  constructor({ status = null, mensaje, esReintentable = false, issues = [], cause }) {
    super(mensaje, { cause });
    this.name = "ApiError";
    this.status = status;
    this.esReintentable = esReintentable;
    this.issues = issues;
  }

  get mensaje() {
    return this.message;
  }

  conMensaje(mensaje) {
    return new ApiError({
      status: this.status,
      mensaje,
      esReintentable: this.esReintentable,
      issues: this.issues,
      cause: this.cause,
    });
  }
}
