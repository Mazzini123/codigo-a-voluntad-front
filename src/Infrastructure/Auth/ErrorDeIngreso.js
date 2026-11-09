export class ErrorDeIngreso extends Error {
  constructor(mensaje, { cause } = {}) {
    super(mensaje, { cause });
    this.name = "ErrorDeIngreso";
  }

  get mensaje() {
    return this.message;
  }
}
