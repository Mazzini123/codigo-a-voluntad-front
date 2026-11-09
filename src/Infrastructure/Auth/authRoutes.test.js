import { RUTA_CALLBACK as RUTA_DEL_ROUTER } from "@/Presentation/Routes/rutas.js";
import { RUTA_CALLBACK } from "./authRoutes.js";

test("la ruta de retorno del proveedor es la misma que atiende el router", () => {
  expect(RUTA_CALLBACK).toBe(RUTA_DEL_ROUTER);
  expect(RUTA_CALLBACK).toBe("/auth/callback");
});
