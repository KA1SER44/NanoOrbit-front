import { useEffect, useState } from "react";
import { fetchAlertes } from "../api/front.js";
import "../styles/satellitesList.css";
import "../styles/alertesList.css";

function pickField(row, key, fallback) {
  if (row[key] != null && row[key] !== "") return row[key];
  if (fallback) {
    for (const alt of fallback) {
      if (row[alt] != null && row[alt] !== "") return row[alt];
    }
  }
  return null;
}

function normalizePriorite(value) {
  return String(value ?? "").trim().toUpperCase();
}

function AlerteIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function CritiqueCounter({ count }) {
  const active = count > 0;

  return (
    <div
      className={`alerteHighlight ${active ? "alerteHighlightActive" : ""}`}
      role="status"
    >
      <span className="alerteHighlightBadge">{count}</span>
      <p className="alerteHighlightText">
        alerte{count > 1 ? "s" : ""} critique{count > 1 ? "s" : ""}
      </p>
    </div>
  );
}

function PrioriteBadge({ priorite }) {
  const level = normalizePriorite(priorite);

  if (level === "CRITIQUE") {
    return <span className="alertePriorite alertePrioriteCritique">CRITIQUE</span>;
  }

  if (level === "SURVEILLANCE") {
    return (
      <span className="alertePriorite alertePrioriteSurveillance">
        SURVEILLANCE
      </span>
    );
  }

  return <span className="alertePriorite">{priorite ?? "—"}</span>;
}

function EtatBadge({ etat }) {
  const value = String(etat ?? "").toLowerCase();

  if (value.includes("hors")) {
    return <span className="alerteEtat alerteEtatHorsService">{etat}</span>;
  }

  if (value.includes("dégrad") || value.includes("degrad")) {
    return <span className="alerteEtat alerteEtatDegrade">{etat}</span>;
  }

  return <span className="alerteEtat">{etat ?? "—"}</span>;
}

function AlerteRow({
  ref_instrument,
  nom_satellite,
  type_instrument,
  etat_fonctionnement,
  priorite,
}) {
  const isCritique = normalizePriorite(priorite) === "CRITIQUE";

  return (
    <div className={`alerteRow ${isCritique ? "alerteRowCritique" : ""}`}>
      <div className="satIcon">
        <AlerteIcon />
      </div>

      <div className="satId">{ref_instrument}</div>

      <div className="divider" />

      <div className="satName">{nom_satellite}</div>

      <div className="satCell alerteTypeCell">
        <strong>{type_instrument}</strong>
      </div>

      <div className="satCell alerteEtatCell">
        <EtatBadge etat={etat_fonctionnement} />
      </div>

      <div className="satCell alertePrioriteCell">
        <PrioriteBadge priorite={priorite} />
      </div>
    </div>
  );
}

export default function AlertesList({ refreshKey = 0 }) {
  const [items, setItems] = useState([]);
  const [critiqueCount, setCritiqueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchAlertes();
        if (cancelled) return;

        const rows = data?.items ?? [];
        const mapped = rows.map((row) => ({
          ref_instrument:
            pickField(row, "ref_instrument", [
              "id_instrument",
              "code_instrument",
              "nom_instrument",
            ]) ?? "—",
          nom_satellite: pickField(row, "nom_satellite", ["nom"]) ?? "—",
          type_instrument: pickField(row, "type_instrument") ?? "—",
          etat_fonctionnement: row.etat_fonctionnement ?? "—",
          priorite: row.priorite ?? "—",
        }));

        setItems(mapped);
        setCritiqueCount(
          data?.compteur_critique ??
            mapped.filter(
              (row) => normalizePriorite(row.priorite) === "CRITIQUE",
            ).length,
        );
      } catch (err) {
        if (cancelled) return;
        const message =
          err.response?.data?.error ??
          "Impossible de charger les alertes instruments.";
        setError(message);
        setItems([]);
        setCritiqueCount(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const listShell = (content) => (
    <div
      className="satShell alerteShell"
      role="region"
      aria-label="Alertes instruments en état anormal"
    >
      {content}
    </div>
  );

  if (loading) {
    return listShell(
      <p className="alerteState">Chargement des alertes instruments…</p>,
    );
  }

  if (error) {
    return listShell(
      <p className="alerteState alerteStateError" role="alert">
        {error}
      </p>,
    );
  }

  return listShell(
    <>
      <CritiqueCounter count={critiqueCount} />

      {!items.length ? (
        <p className="alerteState">Aucune alerte instrument.</p>
      ) : (
        <>
          <div className="headerRow">
            <div className="hcellIcon" />
            <div className="hcell hcellInst">Instrument</div>
            <div className="hcellDiv" />
            <div className="hcell hcellName">Satellite</div>
            <div className="hcell hcellType">Type</div>
            <div className="hcell hcellEtat">État</div>
            <div className="hcell hcellPriorite">Priorité</div>
          </div>

          {items.map((row) => (
            <AlerteRow
              key={`${row.ref_instrument}-${row.nom_satellite}`}
              {...row}
            />
          ))}
        </>
      )}
    </>,
  );
}
