import { useEffect, useState } from "react";
import {
  createParticipation,
  fetchActiveMissions,
  fetchOperationalSatellites,
} from "../api/back.js";
import { useAuth } from "../context/AuthContext.jsx";
import { canAssignParticipation } from "../utils/permissions.js";
import "../styles/planCommunication.css";

export default function AssignParticipationForm({ onAssigned }) {
  const { user, loading: authLoading } = useAuth();

  const [satellites, setSatellites] = useState([]);
  const [missions, setMissions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [idSatellite, setIdSatellite] = useState("");
  const [idMission, setIdMission] = useState("");
  const [roleSatellite, setRoleSatellite] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setOptionsLoading(true);
      setOptionsError("");

      try {
        const [sats, miss] = await Promise.all([
          fetchOperationalSatellites(),
          fetchActiveMissions(),
        ]);
        if (cancelled) return;

        const satRows = Array.isArray(sats) ? sats : [];
        const missionRows = Array.isArray(miss) ? miss : [];

        setSatellites(satRows);
        setMissions(missionRows);

        if (satRows.length) setIdSatellite(satRows[0].id_satellite);
        if (missionRows.length) setIdMission(missionRows[0].id_mission);
      } catch (err) {
        if (cancelled) return;
        setOptionsError(
          err.response?.data?.error ??
            "Impossible de charger satellites et missions.",
        );
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (authLoading || !canAssignParticipation(user)) {
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      const data = await createParticipation({
        id_satellite: idSatellite,
        id_mission: idMission,
        role_satellite: roleSatellite.trim(),
      });

      setFeedback({
        type: "success",
        message: data.message ?? "Satellite assigné à la mission.",
      });
      setRoleSatellite("");
      onAssigned?.();
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err.response?.data?.error ??
          "Échec de l'assignation du satellite à la mission.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      className="satShell planShell"
      aria-labelledby="assign-participation-title"
    >
      <header className="planHeader">
        <div>
          <span className="page-label">BO-03</span>
          <h2 id="assign-participation-title">
            Assigner un satellite à une mission
          </h2>
          <p className="planSubtitle">
            Choisissez un satellite opérationnel, une mission active et le rôle
            du satellite.
          </p>
        </div>
        <span className="planRoleTag">responsable · admin</span>
      </header>

      {optionsLoading ? (
        <p className="planState">Chargement des satellites et missions…</p>
      ) : optionsError ? (
        <p className="planState planStateError" role="alert">
          {optionsError}
        </p>
      ) : (
        <form className="planForm" onSubmit={handleSubmit}>
          <div className="planFormGrid">
            <div className="form-group">
              <label className="form-label" htmlFor="part-satellite">
                Satellite opérationnel
              </label>
              <select
                id="part-satellite"
                className="form-input"
                value={idSatellite}
                onChange={(event) => setIdSatellite(event.target.value)}
                required
                disabled={submitting || !satellites.length}
              >
                {satellites.map((sat) => (
                  <option key={sat.id_satellite} value={sat.id_satellite}>
                    {sat.id_satellite} — {sat.nom ?? sat.nom_satellite}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="part-mission">
                Mission active
              </label>
              <select
                id="part-mission"
                className="form-input"
                value={idMission}
                onChange={(event) => setIdMission(event.target.value)}
                required
                disabled={submitting || !missions.length}
              >
                {missions.map((mission) => (
                  <option key={mission.id_mission} value={mission.id_mission}>
                    {mission.id_mission} — {mission.nom ?? mission.nom_mission}
                    {mission.zone_cible ? ` (${mission.zone_cible})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="part-role">
                Rôle du satellite
              </label>
              <input
                id="part-role"
                type="text"
                className="form-input"
                placeholder="ex. Principal, Relais…"
                value={roleSatellite}
                onChange={(event) => setRoleSatellite(event.target.value)}
                required
                disabled={submitting}
              />
            </div>
          </div>

          {feedback ? (
            <div
              className={`alert-banner planFeedback ${feedback.type === "success" ? "info" : "critical"}`}
              role="alert"
            >
              <div>
                <p className="alert-title">
                  {feedback.type === "success" ? "Succès" : "Erreur"}
                </p>
                <p className="alert-body">{feedback.message}</p>
              </div>
            </div>
          ) : null}

          <div className="planActions">
            <button
              type="submit"
              className="btn btn-primary planSubmit"
              disabled={
                submitting ||
                !satellites.length ||
                !missions.length ||
                !roleSatellite.trim()
              }
            >
              {submitting ? "Assignation…" : "Assigner à la mission"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
