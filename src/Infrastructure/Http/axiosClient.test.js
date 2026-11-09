import axios from "axios";
import { crearAxiosClient } from "./axiosClient.js";
import { ApiError } from "./ApiError.js";
import { configurarAuth } from "./configurarAuth.js";

function respuesta(config, status, data = {}) {
  return { config, data, status, statusText: "", headers: {} };
}

function fallaConStatus(status, data = {}) {
  return async (config) => {
    throw new axios.AxiosError(
      "Request failed",
      "ERR_BAD_RESPONSE",
      config,
      null,
      respuesta(config, status, data),
    );
  };
}

function sinRespuesta(code = "ERR_NETWORK") {
  return async (config) => {
    throw new axios.AxiosError("Network Error", code, config);
  };
}

function crearCliente(transporte) {
  const cliente = crearAxiosClient({ esperaBaseMs: 1 });
  cliente.defaults.adapter = transporte;
  return cliente;
}

async function errorDe(promesa) {
  try {
    await promesa;
  } catch (error) {
    return error;
  }
  throw new Error("Se esperaba que la petición fallara");
}

afterEach(() => {
  configurarAuth();
  vi.useRealTimers();
});

describe("token", () => {
  test("agrega Authorization cuando hay token", async () => {
    configurarAuth({ obtenerToken: async () => "abc123" });
    const transporte = vi.fn(async (config) => respuesta(config, 200));
    await crearCliente(transporte).get("/proyectos");
    expect(transporte.mock.calls[0][0].headers.Authorization).toBe("Bearer abc123");
  });

  test("no agrega Authorization sin sesión", async () => {
    const transporte = vi.fn(async (config) => respuesta(config, 200));
    await crearCliente(transporte).get("/proyectos");
    expect(transporte.mock.calls[0][0].headers.Authorization).toBeUndefined();
  });

  test("sale sin token si obtenerToken falla", async () => {
    configurarAuth({
      obtenerToken: async () => {
        throw new Error("sin proveedor");
      },
    });
    const transporte = vi.fn(async (config) => respuesta(config, 200));
    await crearCliente(transporte).get("/proyectos");
    expect(transporte.mock.calls[0][0].headers.Authorization).toBeUndefined();
  });

  test.each([null, new Error("sin proveedor")])(
    "un pedido privado sin token da un error reintentable antes del envío (%s)",
    async (fallo) => {
      configurarAuth({
        obtenerToken: async () => {
          if (fallo) throw fallo;
          return null;
        },
      });
      const transporte = vi.fn();
      const error = await errorDe(
        crearCliente(transporte).post("/colectivos", {}, { requiereSesion: true }),
      );
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({
        status: null,
        mensaje:
          "No pudimos verificar tu sesión para completar esta acción. Probá de nuevo.",
        esReintentable: true,
      });
      expect(transporte).not.toHaveBeenCalled();
    },
  );

  test("sólo una sesión simulada activa puede enviar un pedido privado sin token", async () => {
    const transporte = vi.fn(async (config) => respuesta(config, 200));
    const cliente = crearCliente(transporte);
    const permiteSinToken = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    configurarAuth({ permiteSinToken });

    const error = await errorDe(cliente.get("/privado", { requiereSesion: true }));
    expect(error).toBeInstanceOf(ApiError);
    expect(transporte).not.toHaveBeenCalled();
    await cliente.get("/privado", { requiereSesion: true });
    expect(transporte.mock.calls[0][0].headers.Authorization).toBeUndefined();
  });
});

describe("ApiError", () => {
  test.each([
    [400, { message: "El título es obligatorio" }, "Revisá los datos ingresados.", false],
    [400, {}, "Revisá los datos ingresados.", false],
    [401, { message: "jwt expired" }, "No pudimos autorizar este pedido.", false],
    [403, { message: "Forbidden" }, "No tenés permiso para hacer esto.", false],
    [404, {}, "No encontramos lo que buscabas.", false],
    [
      409,
      { message: "Ya existe esa habilidad" },
      "Esto ya no se puede hacer porque algo cambió. Actualizá la página y probá de nuevo.",
      false,
    ],
    [422, {}, "Revisá los datos ingresados.", false],
    [
      429,
      { message: "Too many requests" },
      "Hiciste muchos pedidos seguidos. Esperá unos segundos y volvé a intentar.",
      false,
    ],
    [
      500,
      { message: "TypeError: cannot read x" },
      "Tuvimos un problema en el servidor. Probá de nuevo en unos minutos.",
      true,
    ],
    [418, {}, "No pudimos completar la operación.", false],
  ])(
    "status %i → mensaje y reintentable",
    async (status, data, mensaje, reintentable) => {
      const error = await errorDe(
        crearCliente(fallaConStatus(status, data)).post("/habilidades", {}),
      );
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ status, mensaje, esReintentable: reintentable });
    },
  );

  test.each([
    ["post", "/proyectos/p1/colaboraciones", 409],
    ["post", "/colectivos", 409],
    ["put", "/colectivos/c1", 409],
    ["post", "/proyectos/p1/colaboraciones", 400],
  ])(
    "%s %s con %i usa el texto por status, nunca el del back",
    async (metodo, ruta, status) => {
      const textoDelBack = 'No existe una habilidad con el código "diseno_ux_ui"';
      const error = await errorDe(
        crearCliente(fallaConStatus(status, { message: textoDelBack }))[metodo](ruta, {}),
      );
      expect(error.mensaje).toBe(
        status === 409
          ? "Esto ya no se puede hacer porque algo cambió. Actualizá la página y probá de nuevo."
          : "Revisá los datos ingresados.",
      );
      expect(error.mensaje).not.toContain(textoDelBack);
    },
  );

  test("conMensaje cambia solo el texto y conserva el resto", () => {
    const causa = new Error("original");
    const error = new ApiError({
      status: 409,
      mensaje: "Genérico",
      issues: [{ path: ["x"] }],
      cause: causa,
    });
    const propio = error.conMensaje("Ya te postulaste a este proyecto.");
    expect(propio).toBeInstanceOf(ApiError);
    expect(propio).toMatchObject({
      status: 409,
      mensaje: "Ya te postulaste a este proyecto.",
      esReintentable: false,
      issues: [{ path: ["x"] }],
    });
    expect(propio.cause).toBe(causa);
    expect(error.mensaje).toBe("Genérico");
  });

  test("sin respuesta → mensaje de conexión y reintentable", async () => {
    const error = await errorDe(crearCliente(sinRespuesta()).post("/habilidades", {}));
    expect(error).toMatchObject({
      status: null,
      mensaje: "No pudimos conectarnos con el servidor. Revisá tu conexión.",
      esReintentable: true,
    });
  });

  test("timeout → mensaje de demora", async () => {
    const error = await errorDe(
      crearCliente(sinRespuesta("ECONNABORTED")).post("/habilidades", {}),
    );
    expect(error.mensaje).toBe(
      "El servidor tardó demasiado en responder. Probá de nuevo.",
    );
  });

  test("conserva los issues del back", async () => {
    const issues = [{ code: "too_small", path: ["titulo"], message: "Muy corto" }];
    const error = await errorDe(
      crearCliente(fallaConStatus(400, { message: "Inválido", issues })).post("/x", {}),
    );
    expect(error.issues).toEqual(issues);
  });
});

describe("sesión", () => {
  test("un 401 sin Bearer no cierra la sesión", async () => {
    const alExpirar = vi.fn();
    configurarAuth({ alExpirar });
    await errorDe(crearCliente(fallaConStatus(401)).get("/mensajes"));
    expect(alExpirar).not.toHaveBeenCalled();
  });

  test("dos 401 de la misma sesión avisan una sola vez", async () => {
    const alExpirar = vi.fn();
    configurarAuth({ alExpirar, obtenerToken: async () => "token" });
    const { promise, resolve } = Promise.withResolvers();
    const transporte = vi.fn(async (config) => {
      await promise;
      return fallaConStatus(401)(config);
    });
    const cliente = crearCliente(transporte);
    const pedidos = [errorDe(cliente.get("/primero")), errorDe(cliente.get("/segundo"))];
    await vi.waitFor(() => expect(transporte).toHaveBeenCalledTimes(2));
    resolve();

    const [primero, segundo] = await Promise.all(pedidos);
    expect(primero).toMatchObject({
      status: 401,
      mensaje: "Tu sesión venció. Iniciá sesión de nuevo.",
    });
    expect(axios.isCancel(segundo)).toBe(true);
    expect(alExpirar).toHaveBeenCalledTimes(1);
  });

  test("un 401 tardío de otra cuenta se cancela y conserva la sesión actual", async () => {
    const alExpirarAnterior = vi.fn();
    const alExpirarActual = vi.fn();
    configurarAuth({
      alExpirar: alExpirarAnterior,
      obtenerToken: async () => "anterior",
    });
    const { promise, resolve } = Promise.withResolvers();
    const transporte = vi.fn(async (config) => {
      if (config.url === "/anterior") {
        await promise;
        return fallaConStatus(401)(config);
      }
      return respuesta(config, 200);
    });
    const cliente = crearCliente(transporte);
    const pedidoAnterior = errorDe(cliente.get("/anterior", { requiereSesion: true }));
    await vi.waitFor(() => expect(transporte).toHaveBeenCalledTimes(1));
    configurarAuth({ alExpirar: alExpirarActual, obtenerToken: async () => "actual" });
    resolve();

    expect(axios.isCancel(await pedidoAnterior)).toBe(true);
    expect(alExpirarAnterior).not.toHaveBeenCalled();
    expect(alExpirarActual).not.toHaveBeenCalled();
    const { config } = await cliente.get("/actual", { requiereSesion: true });
    expect(config.headers.Authorization).toBe("Bearer actual");
  });

  test("renovar el token mantiene vigentes los pedidos de la misma sesión", async () => {
    const clave = Symbol();
    configurarAuth({ clave, obtenerToken: async () => "original" });
    const { promise, resolve } = Promise.withResolvers();
    const transporte = vi.fn(async (config) => {
      await promise;
      return respuesta(config, 200);
    });
    const cliente = crearCliente(transporte);
    const pedido = cliente.get("/privado", { requiereSesion: true });
    await vi.waitFor(() => expect(transporte).toHaveBeenCalledTimes(1));
    configurarAuth({ clave, obtenerToken: async () => "renovado" });
    resolve();

    expect((await pedido).config.headers.Authorization).toBe("Bearer original");
    expect((await cliente.get("/privado")).config.headers.Authorization).toBe(
      "Bearer renovado",
    );
  });

  test("403 no cierra la sesión", async () => {
    const alExpirar = vi.fn();
    configurarAuth({ alExpirar, obtenerToken: async () => "token" });
    await errorDe(crearCliente(fallaConStatus(403)).get("/mensajes"));
    expect(alExpirar).not.toHaveBeenCalled();
  });
});

describe("reintentos", () => {
  test("un GET sin respuesta se reintenta 2 veces y después falla", async () => {
    const transporte = vi.fn(sinRespuesta());
    const error = await errorDe(crearCliente(transporte).get("/proyectos"));
    expect(transporte).toHaveBeenCalledTimes(3);
    expect(error).toBeInstanceOf(ApiError);
  });

  test("un GET que se recupera devuelve la respuesta", async () => {
    const transporte = vi
      .fn()
      .mockImplementationOnce(sinRespuesta("ECONNABORTED"))
      .mockImplementation(async (config) => respuesta(config, 200, { ok: true }));
    const { data } = await crearCliente(transporte).get("/proyectos");
    expect(data).toEqual({ ok: true });
    expect(transporte).toHaveBeenCalledTimes(2);
  });

  test("espera de forma creciente entre intentos", async () => {
    vi.useFakeTimers();
    const transporte = vi.fn(sinRespuesta());
    const cliente = crearAxiosClient({ esperaBaseMs: 300 });
    cliente.defaults.adapter = transporte;
    const resultado = errorDe(cliente.get("/proyectos"));
    await vi.advanceTimersByTimeAsync(299);
    expect(transporte).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(transporte).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(599);
    expect(transporte).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(transporte).toHaveBeenCalledTimes(3);
    await resultado;
  });

  test("un GET con Bearer queda cancelado si cambia la sesión antes del reintento", async () => {
    vi.useFakeTimers();
    configurarAuth({ obtenerToken: async () => "anterior" });
    const transporte = vi.fn(sinRespuesta());
    const cliente = crearAxiosClient({ esperaBaseMs: 300 });
    cliente.defaults.adapter = transporte;
    const resultado = errorDe(cliente.get("/proyectos"));
    await vi.advanceTimersByTimeAsync(100);
    configurarAuth({ obtenerToken: async () => "actual" });
    await vi.advanceTimersByTimeAsync(300);

    expect(axios.isCancel(await resultado)).toBe(true);
    expect(transporte).toHaveBeenCalledTimes(1);
  });

  test("un GET anónimo conserva el reintento anónimo si se inicia sesión", async () => {
    vi.useFakeTimers();
    const transporte = vi
      .fn(sinRespuesta())
      .mockImplementationOnce(sinRespuesta())
      .mockImplementationOnce(async (config) => respuesta(config, 200));
    const cliente = crearAxiosClient({ esperaBaseMs: 300 });
    cliente.defaults.adapter = transporte;
    const resultado = cliente.get("/proyectos");
    await vi.advanceTimersByTimeAsync(100);
    configurarAuth({ obtenerToken: async () => "actual" });
    await vi.advanceTimersByTimeAsync(300);

    expect((await resultado).config.headers.Authorization).toBeUndefined();
    expect(transporte).toHaveBeenCalledTimes(2);
  });

  test.each(["post", "put", "patch", "delete"])(
    "un %s sin respuesta no se reintenta",
    async (metodo) => {
      const transporte = vi.fn(sinRespuesta());
      await errorDe(crearCliente(transporte).request({ method: metodo, url: "/x" }));
      expect(transporte).toHaveBeenCalledTimes(1);
    },
  );

  test.each([429, 500, 503])("un GET con status %i no se reintenta", async (status) => {
    const transporte = vi.fn(fallaConStatus(status));
    await errorDe(crearCliente(transporte).get("/proyectos"));
    expect(transporte).toHaveBeenCalledTimes(1);
  });
});

describe("cancelación", () => {
  test("un pedido abortado no se convierte en ApiError ni se reintenta", async () => {
    const controller = new AbortController();
    const transporte = vi.fn(async (config) => {
      controller.abort();
      throw new axios.CanceledError(undefined, undefined, config);
    });
    const error = await errorDe(
      crearCliente(transporte).get("/proyectos", { signal: controller.signal }),
    );
    expect(axios.isCancel(error)).toBe(true);
    expect(error).not.toBeInstanceOf(ApiError);
    expect(transporte).toHaveBeenCalledTimes(1);
  });

  test("abortar durante la espera corta el reintento", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const transporte = vi.fn(sinRespuesta());
    const cliente = crearAxiosClient({ esperaBaseMs: 300 });
    cliente.defaults.adapter = transporte;
    const resultado = errorDe(cliente.get("/proyectos", { signal: controller.signal }));
    await vi.advanceTimersByTimeAsync(100);
    controller.abort();
    const error = await resultado;
    await vi.advanceTimersByTimeAsync(1000);
    expect(axios.isCancel(error)).toBe(true);
    expect(transporte).toHaveBeenCalledTimes(1);
  });
});
