import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";

const ROLE_LABELS = {
  analyste: "Analyste",
  operateur: "Opérateur",
  responsable: "Responsable",
  admin: "Admin",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <nav className="navbar">
      <div className="logo">
        <div className="icon" />
        <h2>NanoOrbit</h2>
      </div>

      <div className="links">
        <NavLink to="/">Satellites</NavLink>
        <NavLink to="/communications">Communications</NavLink>
        <NavLink to="/missions">Missions</NavLink>
        <NavLink to="/alertes">Alertes</NavLink>
      </div>

      {user ? (
        <div className="navbar-session">
          <span className="navbar-user mono">
            {user.username}
            <span className="navbar-role">
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
          </span>
          <button
            type="button"
            className="btn btn-ghost navbar-logout"
            onClick={handleLogout}
          >
            Déconnexion
          </button>
        </div>
      ) : null}
    </nav>
  );
}