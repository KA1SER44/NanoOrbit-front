import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ACCOUNTS = [
  {
    value: "analyste_data",
    label: "analyste_data — analyste (front-office)",
  },
  {
    value: "operateur_sat",
    label: "operateur_sat — opérateur (front + back partiel)",
  },
  {
    value: "resp_mission",
    label: "resp_mission — responsable (front + back partiel)",
  },
  {
    value: "admin_nano",
    label: "admin_nano — admin (accès complet)",
  },
];

const ROLE_LABELS = {
  analyste: "Analyste",
  operateur: "Opérateur",
  responsable: "Responsable mission",
  admin: "Administrateur",
};

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? "/";

  const [username, setUsername] = useState("operateur_sat");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate(from, { replace: true });
    }
  }, [loading, user, navigate, from]);

  if (!loading && user) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.error ?? "Connexion impossible. Réessayez.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card card animate-in">
        <header className="login-header">
          <img
            src="/NanoOrbit.svg"
            alt=""
            className="login-logo"
            width={48}
            height={48}
          />
          <div>
            <span className="page-label">NanoOrbit</span>
            <h1>Connexion</h1>
            <p>Authentification MySQL — session par cookie Flask.</p>
          </div>
        </header>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Compte MySQL (Phase 4)
            </label>
            <select
              id="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={submitting}
            >
              {ACCOUNTS.map((account) => (
                <option key={account.value} value={account.value}>
                  {account.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe MySQL"
              autoComplete="current-password"
              required
              disabled={submitting}
            />
          </div>

          {error ? (
            <div className="alert-banner critical login-error" role="alert">
              <div>
                <p className="alert-title">Échec de connexion</p>
                <p className="alert-body">{error}</p>
              </div>
            </div>
          ) : null}

          <button
            type="submit"
            className="btn btn-primary login-submit"
            disabled={submitting}
          >
            {submitting ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="login-hint">
          Comptes attendus :{" "}
          <code>analyste_data</code>, <code>operateur_sat</code>,{" "}
          <code>resp_mission</code>, <code>admin_nano</code>.
        </p>

        <ul className="login-roles list-data">
          {Object.entries(ROLE_LABELS).map(([role, label]) => (
            <li key={role}>
              <span className="data-key">{role}</span>
              <span className="data-value">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
