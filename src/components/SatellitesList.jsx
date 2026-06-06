import { useEffect, useState } from "react";
import { fetchSatellites } from "../api/front.js";
import "../styles/satellitesList.css";

function pickField(row, key, fallback) {
  if (row[key] != null && row[key] !== "") return row[key];
  if (fallback) {
    for (const alt of fallback) {
      if (row[alt] != null && row[alt] !== "") return row[alt];
    }
  }
  return null;
}

function formatLaunchDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAltitude(value) {
  if (value == null || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `${num.toLocaleString("fr-FR")} km`;
}

function mapSatelliteRow(row) {
  const battery = Number(
    pickField(row, "capacite_batterie", ["capacite_batterie_wh"]),
  );

  return {
    id: pickField(row, "id_satellite", ["id"]) ?? "—",
    name: pickField(row, "nom_satellite", ["nom"]) ?? "—",
    format: pickField(row, "format_cubesat", ["format"]) ?? "—",
    launch: formatLaunchDate(
      pickField(row, "date_lancement", ["date_lancement_satellite"]),
    ),
    orbit:
      pickField(row, "type_orbite", ["type_orbite_satellite"]) ?? "—",
    alt: formatAltitude(pickField(row, "altitude", ["altitude_km"])),
    battery: Number.isNaN(battery) ? 0 : battery,
  };
}

function getBatteryClass(wh) {
  if (wh >= 80) return "batHigh";
  if (wh >= 55) return "batMed";
  return "batLow";
}

function SatelliteRow({ id, name, format, launch, orbit, alt, battery }) {
  const formatClass =
    format && format !== "—"
      ? `satFormatBadge fmt${format.replace("U", "u")}`
      : "satFormatBadge";

  const orbitClass =
    orbit && orbit !== "—"
      ? `orbitPill orbit${orbit.toLowerCase()}`
      : "orbitPill";

  return (
    <div className="satRow">
      <div className="satIcon">
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
          <path d="M4.5 9.5 9.5 4.5" />
          <path d="m14.5 19.5 5-5" />
          <path d="M3 3l3 1-1 3" />
          <path d="m18 21 3-1-1-3" />
          <circle cx="12" cy="12" r="4" />
          <path d="m7.5 16.5-4 4" />
          <path d="m16.5 7.5 4-4" />
        </svg>
      </div>

      <div className="satId">{id}</div>

      <div className="divider" />

      <div className="satName">{name}</div>

      <div className={formatClass}>{format}</div>

      <div className="satCell w88">
        <strong>{launch}</strong>
      </div>

      <div className="satCell w72">
        <span className={orbitClass}>{orbit}</span>
      </div>

      <div className="satCell w56">
        <strong>{alt}</strong>
      </div>

      <div className={`satCell satBatteryCell ${getBatteryClass(battery)}`}>
        <strong>
          {battery ? `${battery.toLocaleString("fr-FR")} Wh` : "—"}
        </strong>
      </div>
    </div>
  );
}

export default function SatelliteList({ refreshKey = 0 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchSatellites();
        if (cancelled) return;

        const rows = Array.isArray(data) ? data : [];
        setItems(rows.map(mapSatelliteRow));
      } catch (err) {
        if (cancelled) return;
        const message =
          err.response?.data?.error ??
          "Impossible de charger les satellites opérationnels.";
        setError(message);
        setItems([]);
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
      className="satShell satListShell"
      role="region"
      aria-label="Registre des satellites"
    >
      {content}
    </div>
  );

  if (loading) {
    return listShell(
      <p className="satState">Chargement des satellites opérationnels…</p>,
    );
  }

  if (error) {
    return listShell(
      <p className="satState satStateError" role="alert">
        {error}
      </p>,
    );
  }

  if (!items.length) {
    return listShell(
      <p className="satState">Aucun satellite opérationnel.</p>,
    );
  }

  return listShell(
    <>
      <div className="headerRow">
        <div className="hcellIcon" />

        <div className="hcell hcellId">ID</div>

        <div className="hcellDiv" />

        <div className="hcell hcellName">Nom</div>

        <div className="hcell hcellFmt">Format</div>

        <div className="hcell w88">Lancement</div>

        <div className="hcell w72">Orbite</div>

        <div className="hcell w56">Altitude</div>

        <div className="hcell hcellBat">Batterie</div>
      </div>

      {items.map((sat) => (
        <SatelliteRow key={sat.id} {...sat} />
      ))}
    </>,
  );
}
