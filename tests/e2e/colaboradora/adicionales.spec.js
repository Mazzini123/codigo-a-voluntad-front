import { test } from "@playwright/test";
import { finalizarYValorar } from "../apoyo/valorar.js";

test("la colaboradora finaliza y valora al colectivo", async ({ page }) => {
  await finalizarYValorar(page, "COLABORADORA");
});
