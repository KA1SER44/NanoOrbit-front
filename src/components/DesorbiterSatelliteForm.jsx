import { useCallback, useEffect, useMemo, useState } from "react";
import { desorbiterSatellite, fetchAllSatellites } from "../api/back.js";
import { useAuth } from "../context/AuthContext.jsx";
import { canDesorbiterSatellite } from "../utils/permissions.js";
import "../styles/planCommunication.css";
import "../styles/satelliteStatut.css";

function isDesorbite(statut) {
  const value = String(statut ?? "").toLowerCase();
  return value.includes("désorbit") || value.includes("desorbit");
}

export default function DesorbiterSatelliteForm({ onDesorbited }) {
  const { user, loading: authLoading } = useAuth();

  const [satellites, setSatellites] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const [idSatellite, setIdSatellite] = useState("");

  const eligibleSatellites = useMemo(
    () => satellites.filter((sat) => !isDesorbite(sat.statut)),
    [satellites],
  );

  const selectedSatellite = useMemo(
    () => eligibleSatellites.find((sat) => sat.id_satellite === idSatellite),
    [eligibleSatellites, idSatellite],
  );

  const loadSatellites = useCallback(async () => {
    setListLoading(true);
    setListError("");

    try {
      const data = await fetchAllSatellites();
      const rows = Array.isArray(data) ? data : [];
      setSatellites(rows);
    } catch (error) {
      setListError(
        error.response?.data?.error ||
          "Impossible de charger la liste des satellites.",
      );
      setSatellites([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !canDesorbiterSatellite(user)) {
      return;
    }

    loadSatellites();
  }, [authLoading, user, loadSatellites]);

  useEffect(() => {
    if (
      idSatellite &&
      !eligibleSatellites.some((sat) => sat.id_satellite === idSatellite)
    ) {
      setIdSatellite("");
    }
  }, [eligibleSatellites, idSatellite]);

  if (authLoading || !canDesorbiterSatellite(user)) {
    return null;
  }

  function handleRequestDesorbit(e) {
    e.preventDefault();
    setFeedback(null);

    if (!idSatellite) {
      setFeedback({ type: "error", message: "Sélectionnez un satellite." });
      return;
    }

    setConfirming(true);
  }

  function handleCancelConfirm() {
    setConfirming(false);
  }

  async function handleConfirmDesorbit() {
    setSubmitting(true);
    setFeedback(null);

    try {
      const data = await desorbiterSatellite(idSatellite);
      const extra =
        data.fenetres_annulees != null
          ? ` — ${data.fenetres_annulees} fenêtre(s) annulée(s).`
          : "";
      setFeedback({
        type: "success",
        message: (data.message || "Satellite désorbité.") + extra,
      });
      setIdSatellite("");
      setConfirming(false);
      await loadSatellites();
      onDesorbited?.();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error.response?.data?.error || "Échec de la désorbitation.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      className="satShell planShell desorbShell"
      aria-labelledby="desorb-sat-title"
    >
      <header className="planHeader">
        <div>
          <span className="page-label">BO-04</span>
          <h2 id="desorb-sat-title">Désorbiter un satellite</h2>
          <p className="planSubtitle desorbNote">
            Action destructive — une confirmation explicite est requise.
          </p>
        </div>
        <span className="planRoleTag planRoleTagDanger">admin</span>
      </header>

      {listLoading ? (
        <p className="planState">Chargement des satellites…</p>
      ) : listError ? (
        <p className="planState planStateError" role="alert">
          {listError}
        </p>
      ) : confirming ? (
        <div
          className="desorbConfirm"
          role="alertdialog"
          aria-labelledby="desorb-confirm-title"
        >
          <p id="desorb-confirm-title" className="desorbConfirmTitle">
            Êtes-vous sûr ?
          </p>
          <p className="desorbConfirmText">
            Vous allez désorbiter{" "}
            <strong>
              {selectedSatellite?.nom ?? idSatellite} ({idSatellite})
            </strong>
            . Cette action est irréversible et passera le statut du satellite à
            « Désorbité ».
          </p>

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

          <div className="desorbConfirmActions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleCancelConfirm}
              disabled={submitting}
            >
              Annuler
            </button>
            <button
              type="button"
              className="btn btn-danger planSubmit"
              onClick={handleConfirmDesorbit}
              disabled={submitting}
            >
              {submitting ? "Désorbitation…" : "Oui, désorbiter"}
            </button>
          </div>
        </div>
      ) : (
        <form className="planForm desorbForm" onSubmit={handleRequestDesorbit}>
          <div className="planFormGrid">
            <div className="form-group">
              <label className="form-label" htmlFor="desorb-satellite">
                Satellite
              </label>
              <select
                id="desorb-satellite"
                className="form-input"
                value={idSatellite}
                onChange={(e) => setIdSatellite(e.target.value)}
                disabled={eligibleSatellites.length === 0}
                required
              >
                <option value="">
                  {eligibleSatellites.length === 0
                    ? "Aucun satellite éligible"
                    : "Choisir un satellite"}
                </option>
                {eligibleSatellites.map((sat) => (
                  <option key={sat.id_satellite} value={sat.id_satellite}>
                    {sat.id_satellite} — {sat.nom} ({sat.statut})
                  </option>
                ))}
              </select>
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
              className="btn btn-danger planSubmit"
              disabled={submitting || !idSatellite || eligibleSatellites.length === 0}
            >
              Désorbiter le satellite
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
