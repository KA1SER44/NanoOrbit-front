import { useEffect, useState } from "react";
import {
  createFenetre,
  fetchActiveStations,
  fetchOperationalSatellites,
} from "../api/back.js";
import { useAuth } from "../context/AuthContext.jsx";
import { defaultDatetimeLocal, toApiDatetime } from "../utils/datetime.js";
import { canPlanCommunication } from "../utils/permissions.js";
import "../styles/planCommunication.css";

export default function PlanCommunicationForm({ onPlanned }) {
  const { user, loading: authLoading } = useAuth();

  const [satellites, setSatellites] = useState([]);
  const [stations, setStations] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [idSatellite, setIdSatellite] = useState("");
  const [idStation, setIdStation] = useState("");
  const [dateHeureDebut, setDateHeureDebut] = useState(defaultDatetimeLocal);
  const [dureeSecondes, setDureeSecondes] = useState("300");
  const [elevationMax, setElevationMax] = useState("45");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setOptionsLoading(true);
      setOptionsError("");

      try {
        const [sats, sts] = await Promise.all([
          fetchOperationalSatellites(),
          fetchActiveStations(),
        ]);
        if (cancelled) return;

        setSatellites(Array.isArray(sats) ? sats : []);
        setStations(Array.isArray(sts) ? sts : []);

        if (sats?.length) setIdSatellite(sats[0].id_satellite);
        if (sts?.length) setIdStation(sts[0].id_station);
      } catch (err) {
        if (cancelled) return;
        setOptionsError(
          err.response?.data?.error ??
            "Impossible de charger satellites et stations.",
        );
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (authLoading || !canPlanCommunication(user)) {
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      const data = await createFenetre({
        id_satellite: idSatellite,
        id_station: idStation,
        date_heure_debut: toApiDatetime(dateHeureDebut),
        duree_secondes: Number(dureeSecondes),
        elevation_max: Number(elevationMax),
        statut: "Planifiée",
      });

      setFeedback({
        type: "success",
        message: `${data.message ?? "Fenêtre planifiée."}${data.id_fenetre ? ` (ID ${data.id_fenetre})` : ""}`,
      });
      onPlanned?.();
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err.response?.data?.error ?? "Échec de la planification de la fenêtre.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      className="satShell planShell"
      aria-labelledby="plan-comm-title"
    >
      <header className="planHeader">
        <div>
          <span className="page-label">BO-02</span>
          <h2 id="plan-comm-title">Planifier une communication</h2>
          <p className="planSubtitle">
            Création d&apos;une fenêtre de communication planifiée.
          </p>
        </div>
        <span className="planRoleTag">operateur · admin</span>
      </header>

      {optionsLoading ? (
        <p className="planState">Chargement des satellites et stations…</p>
      ) : optionsError ? (
        <p className="planState planStateError" role="alert">
          {optionsError}
        </p>
      ) : (
        <form className="planForm" onSubmit={handleSubmit}>
          <div className="planFormGrid">
            <div className="form-group">
              <label className="form-label" htmlFor="plan-satellite">
                Satellite opérationnel
              </label>
              <select
                id="plan-satellite"
                className="form-input"
                value={idSatellite}
                onChange={(e) => setIdSatellite(e.target.value)}
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
              <label className="form-label" htmlFor="plan-station">
                Station au sol active
              </label>
              <select
                id="plan-station"
                className="form-input"
                value={idStation}
                onChange={(e) => setIdStation(e.target.value)}
                required
                disabled={submitting || !stations.length}
              >
                {stations.map((st) => (
                  <option key={st.id_station} value={st.id_station}>
                    {st.id_station} — {st.nom ?? st.nom_station}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="plan-debut">
                Date / heure de début
              </label>
              <input
                id="plan-debut"
                type="datetime-local"
                className="form-input"
                value={dateHeureDebut}
                onChange={(e) => setDateHeureDebut(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="plan-duree">
                Durée (secondes, 1–900)
              </label>
              <input
                id="plan-duree"
                type="number"
                className="form-input"
                min={1}
                max={900}
                value={dureeSecondes}
                onChange={(e) => setDureeSecondes(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="plan-elevation">
                Élévation max (°)
              </label>
              <input
                id="plan-elevation"
                type="number"
                className="form-input"
                min={0}
                max={90}
                step={0.1}
                value={elevationMax}
                onChange={(e) => setElevationMax(e.target.value)}
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
                submitting || !satellites.length || !stations.length
              }
            >
              {submitting ? "Planification…" : "Planifier la fenêtre"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
