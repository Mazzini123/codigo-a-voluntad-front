import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TarjetaProyecto } from "./TarjetaProyecto.jsx";

const HOY = new Date("2026-11-05T15:00:00Z");
const habilidad = (codigo) => ({ codigo, titulo: codigo.toUpperCase() });

const PROYECTO = {
  id: "p1",
  titulo: "Sistema de turnos del comedor",
  descripcion: "Una app para ordenar las entregas.",
  estado: "ABIERTO",
  colaboraciones: [],
  perfiles: [
    {
      id: "pe1",
      busquedaAbierta: true,
      fechaCierreBusqueda: "2026-11-30T23:00:00Z",
      limiteColaboraciones: null,
      compromiso: { cantidadHoras: 5, periodo: "HS_MENSUALES" },
      modalidadColaboracion: "GRATUITA",
      habilidadesRequeridas: ["react", "node", "css", "sql", "git", "figma"].map(
        habilidad,
      ),
    },
  ],
};

function montar(props) {
  render(
    <MemoryRouter>
      <TarjetaProyecto proyecto={PROYECTO} hoy={HOY} {...props} />
    </MemoryRouter>,
  );
}

test("muestra lo necesario para decidir y el título lleva al detalle", () => {
  montar();
  const tarjeta = screen.getByRole("article", { name: "Sistema de turnos del comedor" });
  expect(within(tarjeta).getByRole("link")).toHaveAttribute("href", "/proyectos/p1");
  expect(within(tarjeta).getByText("1 perfil abierto")).toBeInTheDocument();
  expect(
    within(tarjeta).getByText("5 h por mes · Colaboración sin remuneración"),
  ).toBeInTheDocument();
  expect(within(tarjeta).getByText("Abierta hasta el 30/11")).toBeInTheDocument();
  const chips = within(tarjeta).getByRole("list", { name: "Habilidades requeridas" });
  expect(within(chips).getAllByRole("listitem")).toHaveLength(5);
  expect(within(chips).getByText("+2 más")).toBeInTheDocument();
});

test("la descripción se muestra sin las marcas de Markdown", () => {
  montar({
    proyecto: {
      ...PROYECTO,
      descripcion: "## Turnos\n\nUna **app** para el [comedor](https://a.org).",
    },
  });
  expect(screen.getByText(/^Turnos\s+Una app para el comedor\.$/)).toBeInTheDocument();
});

test("con sesión de colaboradora muestra el encaje y las que tiene", () => {
  montar({ codigosPropios: new Set(["react", "node"]) });
  expect(screen.getByText("Tenés 2 de 6 habilidades requeridas")).toBeInTheDocument();
  expect(screen.getAllByText(". La tenés")).toHaveLength(2);
});

test("un proyecto finalizado lo dice en el sello y no muestra perfiles abiertos", () => {
  montar({ proyecto: { ...PROYECTO, estado: "FINALIZADO" } });
  expect(screen.getByText("Finalizado")).toBeInTheDocument();
  expect(screen.queryByText("1 perfil abierto")).not.toBeInTheDocument();
});

test.each([
  [["PENDIENTE"], "Postulación pendiente en 1 perfil"],
  [["PENDIENTE", "PENDIENTE"], "Postulación pendiente en 2 perfiles"],
  [["ACEPTADA"], "Postulación aceptada en 1 perfil"],
  [["ACEPTADA", "ACEPTADA"], "Postulación aceptada en 2 perfiles"],
  [["PENDIENTE", "ACEPTADA"], "Postulaciones en 2 perfiles"],
])("resume las postulaciones %j", (estados, texto) => {
  montar({
    codigosPropios: new Set(["react"]),
    postulaciones: estados.map((estado, i) => ({ perfilId: `pe${i + 1}`, estado })),
  });
  expect(screen.getByText(texto)).toBeInTheDocument();
  expect(screen.queryByText(/Tenés/)).not.toBeInTheDocument();
});

test("una rechazada conserva el encaje sin sello de postulación", () => {
  montar({
    codigosPropios: new Set(["react"]),
    postulaciones: [{ perfilId: "pe1", estado: "RECHAZADA" }],
  });
  expect(screen.queryByText(/Postulaci/)).not.toBeInTheDocument();
  expect(screen.getByText("Tenés 1 de 6 habilidades requeridas")).toBeInTheDocument();
});

test("la mejor coincidencia se busca solo entre los perfiles restantes", () => {
  const segundo = {
    ...PROYECTO.perfiles[0],
    id: "pe2",
    habilidadesRequeridas: [habilidad("react")],
  };
  montar({
    proyecto: { ...PROYECTO, perfiles: [...PROYECTO.perfiles, segundo] },
    codigosPropios: new Set(["react"]),
    postulaciones: [{ perfilId: "pe2", estado: "PENDIENTE" }],
  });
  expect(screen.getByText("Postulación pendiente en 1 perfil")).toBeInTheDocument();
  expect(screen.getByText("Tenés 1 de 6 habilidades requeridas")).toBeInTheDocument();
});

describe("como proyecto propio", () => {
  test("muestra el sello del proyecto, los perfiles que buscan y las postulaciones pendientes", () => {
    montar({ propia: true, pendientes: 3 });
    const tarjeta = screen.getByRole("article", {
      name: "Sistema de turnos del comedor",
    });
    expect(within(tarjeta).getByText("Abierto")).toBeInTheDocument();
    expect(within(tarjeta).getByText("1 perfil busca gente")).toBeInTheDocument();
    expect(within(tarjeta).getByText("3 postulaciones pendientes")).toBeInTheDocument();
    expect(within(tarjeta).getByRole("link")).toHaveAttribute("href", "/proyectos/p1");
  });

  test("sin postulaciones pendientes o sin dato no muestra el conteo ni la franja de encaje", () => {
    montar({ propia: true, pendientes: 0, codigosPropios: new Set(["react"]) });
    expect(screen.queryByText(/pendiente/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Tenés/)).not.toBeInTheDocument();
    expect(screen.queryByText("1 perfil abierto")).not.toBeInTheDocument();
  });

  test("un proyecto finalizado muestra solo su sello", () => {
    render(
      <MemoryRouter>
        <TarjetaProyecto
          proyecto={{ ...PROYECTO, estado: "FINALIZADO" }}
          hoy={HOY}
          propia
          pendientes={null}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText("Finalizado")).toBeInTheDocument();
    expect(screen.queryByText(/busca gente|buscan gente/)).not.toBeInTheDocument();
  });
});
