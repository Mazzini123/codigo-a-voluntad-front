import { useState } from "react";
import { useAuth } from "../Context/AuthProvider.jsx";

/*
  Pantalla pensada SOLO para probar la integración de auth de forma desacoplada.
  No importa nada de Logto: todo pasa por useAuth(), que a su vez usa lo que
  devuelva el factory (Infrastructure/Auth/authFactory.jsx).
  Si el día de mañana cambiamos de proveedor, esta pantalla no se toca.
*/
export function AuthTestPage() {
  const { estaAutenticado, cargando, iniciarSesion, cerrarSesion, obtenerToken } = useAuth();
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  const handleObtenerToken = async () => {
    setError(null);
    setToken(null);
    try {
      const t = await obtenerToken();
      setToken(t);
    } catch (e) {
      setError(e.message || "No se pudo obtener el token");
    }
  };

  if (cargando) {
    return <p role="status">Cargando sesión...</p>;
  }

  return (
    <section>
      <h1>Prueba de autenticación</h1>
      <p>
        Estado: <strong>{estaAutenticado ? "Autenticado ✅" : "No autenticado ❌"}</strong>
      </p>

      {!estaAutenticado && (
        <button onClick={iniciarSesion}>Iniciar sesión / Registrarme con Logto</button>
      )}

      {estaAutenticado && (
        <>
          <button onClick={cerrarSesion}>Cerrar sesión</button>
          <button onClick={handleObtenerToken} style={{ marginLeft: 8 }}>
            Obtener access token
          </button>
        </>
      )}

      {token && (
        <div style={{ marginTop: 16, wordBreak: "break-all" }}>
          <p>Token obtenido (recortado):</p>
          <code>{token.slice(0, 60)}...</code>
        </div>
      )}

      {error && (
        <p style={{ color: "red" }}>
          Error al pedir el token: {error}
        </p>
      )}
    </section>
  );
}
