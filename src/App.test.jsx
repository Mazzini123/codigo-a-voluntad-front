import { render } from "@testing-library/react";
import App from "./App";

test("renderiza la aplicación sin errores", () => {
  const { container } = render(<App />);
  expect(container).toBeInTheDocument();
});
