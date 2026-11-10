import { Link, Navigate } from "react-router-dom";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import { useState } from "react";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { SelectorDeContexto } from "@/Presentation/Components/App/sesion/SelectorDeContexto.jsx";
import { TIPO_CONTEXTO } from "@/Application/Domain/Enums/TIPO_CONTEXTO.js";
import {
  inicioPorRol,
  RUTA_ALTA_COLABORADORA,
  RUTA_ALTA_COLECTIVO,
} from "@/Presentation/Routes/rutas.js";
import estilos from "./BienvenidaPage.module.css";

const OPCIONES = [
  {
    ruta: RUTA_ALTA_COLECTIVO,
    nombre: "Soy un colectivo",
    detalle: "Publico proyectos y busco colaboradoras.",
    incompatibleCon: TIPO_CONTEXTO.COLABORADOR,
  },
  {
    ruta: RUTA_ALTA_COLABORADORA,
    nombre: "Soy colaboradora",
    detalle: "Me sumo a proyectos con mis habilidades.",
    incompatibleCon: TIPO_CONTEXTO.COLECTIVO,
  },
];

export function BienvenidaPage() {
  const { usuario, perfilDadoDeBaja, cerrarSesion } = useAuth();
  const [cerrando, setCerrando] = useState(false);
  if (perfilDadoDeBaja)
    return (
      <section className={estilos.bienvenida}>
        <TituloDePagina>Colectivo dado de baja</TituloDePagina>
        <h1 tabIndex={-1}>El colectivo ya está dado de baja</h1>
        <p>
          Estamos cerrando tu sesión. Si seguís en esta pantalla, podés reintentar el
          cierre. La baja ya se realizó y tu cuenta quedó sin perfil.
        </p>
        <Boton
          enviando={cerrando}
          textoEnviando="Cerrando sesión…"
          onClick={async () => {
            setCerrando(true);
            await cerrarSesion();
            setCerrando(false);
          }}
        >
          Reintentar cierre de sesión
        </Boton>
      </section>
    );
  if (usuario?.rol) return <Navigate to={inicioPorRol(usuario.rol)} replace />;

  const contextos = usuario?.contextos ?? [];
  const tipos = new Set(contextos.map((contexto) => contexto.tipo));
  const opciones = OPCIONES.filter(({ incompatibleCon }) => !tipos.has(incompatibleCon));

  return (
    <section className={estilos.bienvenida} aria-labelledby="titulo-bienvenida">
      <TituloDePagina>Bienvenida</TituloDePagina>
      <h1 id="titulo-bienvenida" tabIndex={-1}>
        ¿Cómo vas a usar Código a Voluntad?
      </h1>
      {contextos.length > 0 && (
        <section className={estilos.contextos} aria-labelledby="titulo-contextos">
          <h2 id="titulo-contextos">Seguí donde estabas</h2>
          <SelectorDeContexto
            contextos={contextos}
            etiqueta="Tus perfiles y colectivos"
            claseDeOpcion={estilos.contexto}
          />
        </section>
      )}
      <p className={estilos.bajada}>
        {contextos.length > 0
          ? "O armá un perfil nuevo. Podés operar como colaboradora o en nombre de colectivos, pero no las dos cosas a la vez."
          : "Elegí una opción para armar tu perfil. Podés operar como colaboradora o en nombre de colectivos, pero no las dos cosas a la vez."}
      </p>
      <ul className={estilos.opciones}>
        {opciones.map(({ ruta, nombre, detalle }) => (
          <li key={ruta}>
            <Link to={ruta} className={estilos.opcion}>
              <span className={estilos.nombre}>
                {nombre}
                <Icono nombre="flechaDerecha" tamano={20} />
              </span>
              <span className={estilos.detalle}>{detalle}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
