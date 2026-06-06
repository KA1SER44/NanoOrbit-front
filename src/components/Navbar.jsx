import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { canManageInstruments } from "../utils/permissions";
import "../styles/navbar.css";

const ROLE_LABELS = {
  analyste: "Analyste",
  operateur: "Opérateur",
  responsable: "Responsable",
  admin: "Admin",
};

const NAV_LINKS = [
  { to: "/", label: "Satellites", end: true },
  { to: "/communications", label: "Communications" },
  { to: "/missions", label: "Missions" },
  { to: "/alertes", label: "Alertes" },
  { to: "/historique", label: "Historique" },
];

function NavLinks({ user, onNavigate }) {
  return (
    <>
      {NAV_LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          onClick={onNavigate}
        >
          {link.label}
        </NavLink>
      ))}
      {canManageInstruments(user) ? (
        <NavLink to="/instruments" onClick={onNavigate}>
          Instruments
        </NavLink>
      ) : null}
    </>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate("/login", { replace: true });
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className={`navbar ${menuOpen ? "navbar--open" : ""}`}>
      <div className="navbar-bar">
        <div className="logo">
          <div className="icon" />
          <h2>NanoOrbit</h2>
        </div>

        <div className="navbar-desktop">
          <div className="links">
            <NavLinks user={user} />
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
        </div>

        <button
          type="button"
          className="navbar-toggle"
          aria-expanded={menuOpen}
          aria-controls="navbar-mobile-menu"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="navbar-toggle-bar" />
          <span className="navbar-toggle-bar" />
          <span className="navbar-toggle-bar" />
        </button>
      </div>

      <div
        id="navbar-mobile-menu"
        className="navbar-mobile-menu"
        hidden={!menuOpen}
      >
        <div className="navbar-mobile-links">
          <NavLinks user={user} onNavigate={closeMenu} />
        </div>

        {user ? (
          <div className="navbar-mobile-session">
            <div className="navbar-mobile-user">
              <span className="navbar-mobile-user-label">Session</span>
              <strong>{user.username}</strong>
              <span className="navbar-role">
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            </div>
            <button
              type="button"
              className="btn btn-ghost navbar-logout navbar-mobile-logout"
              onClick={handleLogout}
            >
              Déconnexion
            </button>
          </div>
        ) : null}
      </div>

      {menuOpen ? (
        <button
          type="button"
          className="navbar-backdrop"
          aria-label="Fermer le menu"
          onClick={closeMenu}
        />
      ) : null}
    </nav>
  );
}
