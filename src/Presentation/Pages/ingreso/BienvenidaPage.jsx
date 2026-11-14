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
  RUTA_MIS_SOLICITUDES,
  RUTA_PROYECTOS,
  RUTA_UNIRME_A_COLECTIVO,
} from "@/Presentation/Routes/rutas.js";
import estilos from "./BienvenidaPage.module.css";

const CREAR_UN_COLECTIVO = {
  ruta: RUTA_ALTA_COLECTIVO,
  nombre: "Crear un colectivo",
  detalle: "Lo administro como líder, publico proyectos y busco colaboradoras.",
  incompatibleCon: TIPO_CONTEXTO.COLABORADOR,
};

const UNIRME_A_UN_COLECTIVO = {
  ruta: RUTA_UNIRME_A_COLECTIVO,
  nombre: "Unirme a un colectivo",
  detalle: "Pido sumarme a uno que ya existe. Entro cuando su liderazgo me acepte.",
  incompatibleCon: TIPO_CONTEXTO.COLABORADOR,
};

const REGISTRARME_COMO_COLABORADORA = {
  ruta: RUTA_ALTA_COLABORADORA,
  nombre: "Registrarme como colaboradora",
  detalle: "Me sumo a proyectos con mis habilidades, a título personal.",
  incompatibleCon: TIPO_CONTEXTO.COLECTIVO,
};

const MODALIDADES_DE_REGISTRO = [
  CREAR_UN_COLECTIVO,
  UNIRME_A_UN_COLECTIVO,
  REGISTRARME_COMO_COLABORADORA,
];

const MODALIDADES_CON_PERFIL = [CREAR_UN_COLECTIVO, REGISTRARME_COMO_COLABORADORA];

const SUMARME_A_UN_COLECTIVO = {
  ruta: RUTA_PROYECTOS,
  nombre: "Quiero sumarme a un colectivo",
  detalle: "Buscá el colectivo desde sus proyectos y pedí el ingreso en su perfil.",
  incompatibleCon: TIPO_CONTEXTO.COLABORADOR,
};

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
  const registrando = contextos.length === 0;
  const tipos = new Set(contextos.map((contexto) => contexto.tipo));
  const opciones = (
    registrando
      ? MODALIDADES_DE_REGISTRO
      : [...MODALIDADES_CON_PERFIL, SUMARME_A_UN_COLECTIVO]
  ).filter(({ incompatibleCon }) => !tipos.has(incompatibleCon));

  return (
    <section className={estilos.bienvenida} aria-labelledby="titulo-bienvenida">
      <TituloDePagina>Bienvenida</TituloDePagina>
      <h1 id="titulo-bienvenida" tabIndex={-1}>
        ¿Cómo vas a usar Código a Voluntad?
      </h1>
      {!registrando && (
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
        {registrando
          ? "Para terminar tu registro, elegí cómo te vas a registrar. Podés operar como colaboradora o en nombre de colectivos, pero no las dos cosas a la vez."
          : "O armá un perfil nuevo. Podés operar como colaboradora o en nombre de colectivos, pero no las dos cosas a la vez."}
      </p>
      <ul
        className={estilos.opciones}
        aria-label={registrando ? "Modalidades de registro" : undefined}
      >
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
      {!registrando && !tipos.has(TIPO_CONTEXTO.COLABORADOR) && (
        <p className={estilos.bajada}>
          ¿Ya pediste sumarte? Seguila en{" "}
          <Link to={RUTA_MIS_SOLICITUDES}>Mis solicitudes</Link>.
        </p>
      )}
    </section>
  );
}
