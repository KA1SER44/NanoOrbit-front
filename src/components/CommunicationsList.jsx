import { useEffect, useState } from "react";
import { fetchCommunications } from "../api/front.js";
import "../styles/satellitesList.css";
import "../styles/communicationsList.css";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatVolume(value) {
  if (value == null || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `${num.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo`;
}

function pickField(row, key, fallback) {
  if (row[key] != null && row[key] !== "") return row[key];
  if (fallback) {
    for (const alt of fallback) {
      if (row[alt] != null && row[alt] !== "") return row[alt];
    }
  }
  return null;
}

function CommIcon() {
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
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" />
    </svg>
  );
}

function CommRow({
  id_satellite,
  nom_satellite,
  nb_fenetres,
  volume_total,
  volume_moyen,
  date_derniere_com,
  nb_stations,
  isActive,
}) {
  return (
    <div className={`satRow commRow ${isActive ? "commRowActive" : ""}`}>
      <div className="satIcon">
        <CommIcon />
      </div>

      <div className="satId">{id_satellite}</div>

      <div className="divider" />

      <div className="satName">{nom_satellite}</div>

      <div className="commFenBadge">{nb_fenetres ?? "—"}</div>

      <div className="satCell commVolCell">
        <strong>{formatVolume(volume_total)}</strong>
      </div>

      <div className="satCell commMoyCell">
        <strong>{formatVolume(volume_moyen)}</strong>
      </div>

      <div className="satCell w120">
        <strong>{formatDate(date_derniere_com)}</strong>
      </div>

      <div className="satCell commStationsCell">
        <span className="commStationsPill">{nb_stations ?? 0} st.</span>
      </div>
    </div>
  );
}

function ActiveHighlight({ satellite }) {
  if (!satellite) return null;

  const name =
    pickField(satellite, "nom_satellite", ["nom"]) ?? satellite.id_satellite;
  const volume = pickField(satellite, "volume_total", ["volume_total_mo"]);

  return (
    <div className="comHighlight" role="status">
      <span className="comHighlightBadge">Plus actif</span>
      <p className="comHighlightText">
        <strong>{name}</strong> — satellite le plus actif du réseau
      </p>
      <span className="comHighlightVol">{formatVolume(volume)}</span>
    </div>
  );
}

export default function CommunicationsList({ refreshKey = 0 }) {
  const [items, setItems] = useState([]);
  const [activeSatellite, setActiveSatellite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchCommunications();
        if (cancelled) return;

        const rows = data?.items ?? [];
        setItems(rows);
        setActiveSatellite(data?.satellite_plus_actif ?? rows[0] ?? null);
      } catch (err) {
        if (cancelled) return;
        const message =
          err.response?.data?.error ??
          "Impossible de charger le bilan des communications.";
        setError(message);
        setItems([]);
        setActiveSatellite(null);
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
      className="satShell commShell"
      role="region"
      aria-label="Bilan des communications par satellite"
    >
      {content}
    </div>
  );

  if (loading) {
    return listShell(
      <p className="commState">Chargement du bilan communications…</p>,
    );
  }

  if (error) {
    return listShell(
      <p className="commState commStateError" role="alert">
        {error}
      </p>,
    );
  }

  if (!items.length) {
    return listShell(
      <p className="commState">Aucune communication enregistrée.</p>,
    );
  }

  return listShell(
    <>
      <ActiveHighlight satellite={activeSatellite} />

      <div className="headerRow">
        <div className="hcellIcon" />
        <div className="hcell hcellId">ID</div>
        <div className="hcellDiv" />
        <div className="hcell hcellName">Satellite</div>
        <div className="hcell hcellFen">Fenêtres</div>
        <div className="hcell hcellVol">Volume total</div>
        <div className="hcell hcellMoy">Vol. moyen</div>
        <div className="hcell hcellDate">Dernière com.</div>
        <div className="hcell hcellStations">Stations</div>
      </div>

      {items.map((row, index) => {
        const volume = pickField(row, "volume_total", ["volume_total_mo"]);

        return (
          <CommRow
            key={row.id_satellite ?? index}
            id_satellite={row.id_satellite}
            nom_satellite={
              pickField(row, "nom_satellite", ["nom"]) ?? "—"
            }
            nb_fenetres={row.nb_fenetres}
            volume_total={volume}
            volume_moyen={row.volume_moyen}
            date_derniere_com={row.date_derniere_com}
            nb_stations={row.nb_stations}
            isActive={index === 0}
          />
        );
      })}
    </>,
  );
}
