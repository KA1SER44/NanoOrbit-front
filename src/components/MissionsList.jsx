import { useEffect, useState } from "react";
import { fetchMissions } from "../api/front.js";
import "../styles/satellitesList.css";
import "../styles/missionsList.css";

function pickField(row, key, fallback) {
  if (row[key] != null && row[key] !== "") return row[key];
  if (fallback) {
    for (const alt of fallback) {
      if (row[alt] != null && row[alt] !== "") return row[alt];
    }
  }
  return null;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isSousDotee(row) {
  const flag = row.sous_dotee;
  if (flag === true || flag === 1 || flag === "1") return true;
  if (flag === false || flag === 0 || flag === "0") return false;

  const participants = Number(
    pickField(row, "nb_satellites", ["nb_satellites_participants"]),
  );
  const operationnels = Number(
    pickField(row, "nb_sat_operationnels", [
      "nb_satellites_operationnels",
    ]),
  );

  if (Number.isNaN(participants) || Number.isNaN(operationnels)) return false;
  return operationnels < participants;
}

function MissionIcon() {
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
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function SousDoteeHighlight({ count }) {
  if (!count) return null;

  return (
    <div className="missionHighlight" role="status">
      <span className="missionHighlightBadge">Sous-dotées</span>
      <p className="missionHighlightText">
        <strong>{count}</strong> mission{count > 1 ? "s" : ""} avec moins de
        satellites opérationnels que de participants
      </p>
    </div>
  );
}

function MissionRow({
  id_mission,
  nom_mission,
  zone_geo_cible,
  date_debut,
  nb_participants,
  nb_operationnels,
  sousDotee,
}) {
  return (
    <div className={`missionRow ${sousDotee ? "missionRowSousDotee" : ""}`}>
      <div className="satIcon">
        <MissionIcon />
      </div>

      <div className="satId">{id_mission}</div>

      <div className="divider" />

      <div className="satName">{nom_mission}</div>

      <div className="satCell missionZoneCell">
        <span className="missionZonePill">{zone_geo_cible}</span>
      </div>

      <div className="satCell missionDateCell">
        <strong>{date_debut}</strong>
      </div>

      <div className="missionCountBadge missionPartBadge">
        {nb_participants ?? "—"}
      </div>

      <div className="missionCountSpacer" aria-hidden="true" />

      <div
        className={`missionCountBadge missionOpBadge ${
          sousDotee ? "missionOpBadgeWarn" : ""
        }`}
      >
        {nb_operationnels ?? "—"}
      </div>

      <div className="satCell missionStatusCell">
        {sousDotee ? (
          <span className="missionSousDoteeBadge">Sous-dotée</span>
        ) : (
          <span className="missionOkBadge">OK</span>
        )}
      </div>
    </div>
  );
}

export default function MissionsList({ refreshKey = 0 }) {
  const [items, setItems] = useState([]);
  const [sousDoteeCount, setSousDoteeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchMissions();
        if (cancelled) return;

        const rows = Array.isArray(data) ? data : [];
        const mapped = rows.map((row) => {
          const sousDotee = isSousDotee(row);

          return {
            id_mission: pickField(row, "id_mission", ["id"]) ?? "—",
            nom_mission:
              pickField(row, "nom_mission", ["nom"]) ?? "—",
            zone_geo_cible:
              pickField(row, "zone_geo_cible", ["zone_geographique"]) ?? "—",
            date_debut: formatDate(
              pickField(row, "date_debut", ["date_debut_mission"]),
            ),
            nb_participants: pickField(row, "nb_satellites", [
              "nb_satellites_participants",
            ]),
            nb_operationnels: pickField(row, "nb_sat_operationnels", [
              "nb_satellites_operationnels",
            ]),
            sousDotee,
          };
        });

        setItems(mapped);
        setSousDoteeCount(mapped.filter((row) => row.sousDotee).length);
      } catch (err) {
        if (cancelled) return;
        const message =
          err.response?.data?.error ??
          "Impossible de charger le tableau de bord des missions.";
        setError(message);
        setItems([]);
        setSousDoteeCount(0);
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
      className="satShell missionShell"
      role="region"
      aria-label="Tableau de bord des missions actives"
    >
      {content}
    </div>
  );

  if (loading) {
    return listShell(
      <p className="missionState">Chargement des missions actives…</p>,
    );
  }

  if (error) {
    return listShell(
      <p className="missionState missionStateError" role="alert">
        {error}
      </p>,
    );
  }

  if (!items.length) {
    return listShell(<p className="missionState">Aucune mission active.</p>);
  }

  return listShell(
    <>
      <SousDoteeHighlight count={sousDoteeCount} />

      <div className="headerRow">
        <div className="hcellIcon" />
        <div className="hcell hcellId">ID</div>
        <div className="hcellDiv" />
        <div className="hcell hcellName">Mission</div>
        <div className="hcell hcellZone">Zone</div>
        <div className="hcell hcellDate">Début</div>
        <div className="hcell hcellPart">Participants</div>
        <div className="missionCountSpacer" aria-hidden="true" />
        <div className="hcell hcellOp">Opérationnels</div>
        <div className="hcell hcellStatus">Statut</div>
      </div>

      {items.map((row) => (
        <MissionRow key={row.id_mission} {...row} />
      ))}
    </>,
  );
}
