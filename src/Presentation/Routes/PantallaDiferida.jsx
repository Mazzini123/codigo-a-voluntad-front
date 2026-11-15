import { Component, lazy, Suspense, useState } from "react";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import {
  Esqueleto,
  BloqueEsqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";

class ErrorDePantalla extends Component {
  state = { fallo: false };

  static getDerivedStateFromError() {
    return { fallo: true };
  }

  render() {
    if (this.state.fallo) {
      return (
        <EstadoDeError
          nivel={1}
          titulo="No pudimos abrir la pantalla"
          alReintentar={this.props.alReintentar}
        />
      );
    }
    return this.props.children;
  }
}

export function PantallaDiferida({ cargar }) {
  const [intento, setIntento] = useState(() => ({
    numero: 0,
    cargar,
    Pagina: lazy(cargar),
  }));
  const { Pagina } = intento;

  if (intento.cargar !== cargar) {
    setIntento({ numero: intento.numero + 1, cargar, Pagina: lazy(cargar) });
  }

  function reintentar() {
    setIntento((actual) => ({
      numero: actual.numero + 1,
      cargar: actual.cargar,
      Pagina: lazy(actual.cargar),
    }));
  }

  return (
    <ErrorDePantalla key={intento.numero} alReintentar={reintentar}>
      <Suspense
        fallback={
          <Esqueleto etiqueta="Cargando pantalla…">
            <BloqueEsqueleto alto="2rem" />
            <BloqueEsqueleto />
            <BloqueEsqueleto />
          </Esqueleto>
        }
      >
        <Pagina />
      </Suspense>
    </ErrorDePantalla>
  );
}
