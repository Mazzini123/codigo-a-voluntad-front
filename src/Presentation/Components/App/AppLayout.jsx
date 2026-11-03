import { NavLink, Outlet } from "react-router-dom";
export function AppLayout() {
  return (
    <>
      <header className="app-header">
        <strong>Código a Voluntad</strong>
        <nav aria-label="Principal">
          <NavLink to="/habilidades">Habilidades</NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
