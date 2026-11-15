import "@testing-library/jest-dom/vitest";

if (typeof window !== "undefined") window.scrollTo = () => {};

function cerrarConEscape(evento) {
  if (evento.key !== "Escape") return;
  const cancelar = new Event("cancel", { cancelable: true });
  if (this.dispatchEvent(cancelar)) this.close();
}

if (typeof HTMLDialogElement !== "undefined" && !HTMLDialogElement.prototype.showModal) {
  const prototipo = HTMLDialogElement.prototype;
  if (!("open" in prototipo)) {
    Object.defineProperty(prototipo, "open", {
      get() {
        return this.hasAttribute("open");
      },
      set(valor) {
        this.toggleAttribute("open", Boolean(valor));
      },
    });
  }
  prototipo.showModal = function showModal() {
    this.setAttribute("open", "");
    this.addEventListener("keydown", cerrarConEscape);
  };
  prototipo.show = prototipo.showModal;
  prototipo.close = function close() {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    this.removeEventListener("keydown", cerrarConEscape);
    this.dispatchEvent(new Event("close"));
  };
}
