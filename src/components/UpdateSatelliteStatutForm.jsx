import { useCallback, useEffect, useState } from "react";
import {
  fetchAllSatellites,
  updateSatelliteStatut,
} from "../api/back.js";
import { useAuth } from "../context/AuthContext.jsx";
import { canUpdateSatelliteStatut } from "../utils/permissions.js";
import "../styles/planCommunication.css";
import "../styles/satelliteStatut.css";

const STATUT_OPTIONS = ["Opérationnel", "En veille", "Désorbité"];

function getStatutBadgeClass(statut) {
  const value = String(statut ?? "").toLowerCase();

  if (value.includes("opération") || value.includes("operation")) {
    return "statutBadge statutBadgeOperationnel";
  }

  if (value.includes("veille")) {
    return "statutBadge statutBadgeVeille";
  }

  if (value.includes("désorbit") || value.includes("desorbit")) {
    return "statutBadge statutBadgeDesorbite";
  }

  if (value.includes("défaill") || value.includes("defaill")) {
    return "statutBadge statutBadgeDefaillant";
  }

  return "statutBadge";
}

function StatutBadge({ statut }) {
  return <span className={getStatutBadgeClass(statut)}>{statut ?? "—"}</span>;
}

export default function UpdateSatelliteStatutForm({ onUpdated }) {
  const { user, loading: authLoading } = useAuth();

  const [satellites, setSatellites] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [idSatellite, setIdSatellite] = useState("");
  const [statut, setStatut] = useState(STATUT_OPTIONS[0]);

  const loadSatellites = useCallback(async () => {
    setListLoading(true);
    setListError("");

    try {
      const data = await fetchAllSatellites();
      const rows = Array.isArray(data) ? data : [];
      setSatellites(rows);

      if (rows.length) {
        setIdSatellite((current) => current || rows[0].id_satellite);
      }
    } catch (err) {
      setSatellites([]);
      setListError(
        err.response?.data?.error ??
          "Impossible de charger la liste des satellites.",
      );
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSatellites();
  }, [loadSatellites]);

  useEffect(() => {
    const selected = satellites.find((sat) => sat.id_satellite === idSatellite);
    if (!selected) return;

    const current = selected.statut;
    if (STATUT_OPTIONS.includes(current)) {
      setStatut(current);
    }
  }, [idSatellite, satellites]);

  if (authLoading || !canUpdateSatelliteStatut(user)) {
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      const data = await updateSatelliteStatut(idSatellite, statut);

      setFeedback({
        type: "success",
        message:
          data.message ??
          `Statut de ${idSatellite} mis à jour vers « ${statut} ».`,
      });

      await loadSatellites();
      onUpdated?.();
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err.response?.data?.error ??
          "Échec de la mise à jour du statut du satellite.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      className="satShell planShell statutShell"
      aria-labelledby="statut-sat-title"
    >
      <header className="planHeader">
        <div>
          <span className="page-label">BO-01</span>
          <h2 id="statut-sat-title">Modifier le statut d&apos;un satellite</h2>
          <p className="planSubtitle">
            Liste tous les satellites et permet de changer leur statut.
          </p>
        </div>
        <span className="planRoleTag">operateur · admin</span>
      </header>

      {listLoading ? (
        <p className="planState">Chargement des satellites…</p>
      ) : listError ? (
        <p className="planState planStateError" role="alert">
          {listError}
        </p>
      ) : (
        <>
          <div
            className="statutSatList"
            role="table"
            aria-label="Satellites et statuts"
          >
            <div className="statutSatHeader" role="row">
              <span role="columnheader">ID</span>
              <span role="columnheader">Nom</span>
              <span role="columnheader">Statut actuel</span>
            </div>

            {satellites.map((sat) => (
              <div
                key={sat.id_satellite}
                className={`statutSatRow ${
                  sat.id_satellite === idSatellite ? "statutSatRowSelected" : ""
                }`}
                role="row"
              >
                <span className="statutSatId" role="cell">
                  {sat.id_satellite}
                </span>
                <span className="statutSatNom" role="cell">
                  {sat.nom ?? sat.nom_satellite ?? "—"}
                </span>
                <span role="cell">
                  <StatutBadge statut={sat.statut} />
                </span>
              </div>
            ))}
          </div>

          <form className="planForm statutForm" onSubmit={handleSubmit}>
            <div className="planFormGrid">
              <div className="form-group">
                <label className="form-label" htmlFor="statut-satellite">
                  Satellite
                </label>
                <select
                  id="statut-satellite"
                  className="form-input"
                  value={idSatellite}
                  onChange={(event) => setIdSatellite(event.target.value)}
                  required
                  disabled={submitting || !satellites.length}
                >
                  {satellites.map((sat) => (
                    <option key={sat.id_satellite} value={sat.id_satellite}>
                      {sat.id_satellite} — {sat.nom ?? sat.nom_satellite} (
                      {sat.statut})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="statut-nouveau">
                  Nouveau statut
                </label>
                <select
                  id="statut-nouveau"
                  className="form-input"
                  value={statut}
                  onChange={(event) => setStatut(event.target.value)}
                  required
                  disabled={submitting}
                >
                  {STATUT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
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
                className="btn btn-primary planSubmit"
                disabled={submitting || !satellites.length}
              >
                {submitting ? "Mise à jour…" : "Mettre à jour le statut"}
              </button>
            </div>
          </form>
        </>
      )}
    </section>
  );
}
