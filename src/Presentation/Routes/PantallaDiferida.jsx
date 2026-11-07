import { Component, lazy, Suspense, useState } from "react";
import { ErrorState } from "../Components/App/ErrorState.jsx";
import { Skeleton, BloqueSkeleton } from "../Components/App/Skeleton.jsx";

class ErrorDePantalla extends Component {
  state = { fallo: false };

  static getDerivedStateFromError() {
    return { fallo: true };
  }

  render() {
    if (this.state.fallo) {
      return (
        <ErrorState
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
  const [intento, setIntento] = useState(() => ({ numero: 0, Pagina: lazy(cargar) }));
  const { Pagina } = intento;

  function reintentar() {
    setIntento((actual) => ({ numero: actual.numero + 1, Pagina: lazy(cargar) }));
  }

  return (
    <ErrorDePantalla key={intento.numero} alReintentar={reintentar}>
      <Suspense
        fallback={
          <Skeleton etiqueta="Cargando pantalla…">
            <BloqueSkeleton alto="2rem" />
            <BloqueSkeleton />
            <BloqueSkeleton />
          </Skeleton>
        }
      >
        <Pagina />
      </Suspense>
    </ErrorDePantalla>
  );
}
