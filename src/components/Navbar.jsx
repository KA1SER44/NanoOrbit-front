import { NavLink } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">

        <div class="logo">
            <div class="icon"></div>
            <h2>NanoOrbit</h2>
        </div>

        <div className="links">
            <NavLink to="/">
                Satellites
            </NavLink>

            <NavLink to="/communications">
                Communications
            </NavLink>

            <NavLink to="/missions">
                Missions
            </NavLink>

            <NavLink to="/alertes">
                Alertes
            </NavLink>
        </div>
    </nav>
  );
}