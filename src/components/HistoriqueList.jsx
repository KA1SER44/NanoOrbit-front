import { useCallback, useEffect, useRef, useState } from "react";
import { fetchHistoriqueFenetres } from "../api/front.js";
import "../styles/satellitesList.css";
import "../styles/historiqueList.css";

const STATUT_OPTIONS = [
  { value: "", label: "— Tous —" },
  { value: "Réalisée", label: "Réalisée" },
  { value: "Planifiée", label: "Planifiée" },
  { value: "Échouée", label: "Échouée" },
];

function pickField(row, key, fallback) {
  if (row[key] != null && row[key] !== "") return row[key];
  if (fallback) {
    for (const alt of fallback) {
      if (row[alt] != null && row[alt] !== "") return row[alt];
    }
  }
  return null;
}

function formatDateTime(value) {
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

function formatDuree(value) {
  if (value == null || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `${num.toLocaleString("fr-FR")} s`;
}

function formatElevation(value) {
  if (value == null || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `${num.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}°`;
}

function HistoriqueIcon() {
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
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function StatutBadge({ statut }) {
  const value = String(statut ?? "");
  const normalized = value.toLowerCase();

  let className = "historiqueStatut";
  if (normalized.includes("réalis") || normalized.includes("realis")) {
    className += " historiqueStatutRealisee";
  } else if (normalized.includes("planif")) {
    className += " historiqueStatutPlanifiee";
  } else if (normalized.includes("échou") || normalized.includes("echou")) {
    className += " historiqueStatutEchouee";
  }

  return <span className={className}>{statut ?? "—"}</span>;
}

function HistoriqueRow({
  id_fenetre,
  date_heure_debut,
  duree_secondes,
  id_satellite,
  nom_satellite,
  id_station,
  nom_station,
  elevation_max_deg,
  volume_donnees_mo,
  statut,
}) {
  return (
    <div className="historiqueRow">
      <div className="satIcon">
        <HistoriqueIcon />
      </div>

      <div className="satId">{id_fenetre}</div>

      <div className="satCell historiqueDateCell">
        <strong>{date_heure_debut}</strong>
      </div>

      <div className="satCell historiqueDureeCell">
        <strong>{duree_secondes}</strong>
      </div>

      <div className="satId historiqueSatId">{id_satellite}</div>

      <div className="satName">{nom_satellite}</div>

      <div className="satId historiqueStationId">{id_station}</div>

      <div className="satCell historiqueStationName">
        <strong>{nom_station}</strong>
      </div>

      <div className="satCell historiqueElevCell">
        <strong>{elevation_max_deg}</strong>
      </div>

      <div className="satCell historiqueVolCell">
        <strong>{volume_donnees_mo}</strong>
      </div>

      <div className="satCell historiqueStatutCell">
        <StatutBadge statut={statut} />
      </div>
    </div>
  );
}

function getStatutOptionClass(value) {
  const normalized = String(value).toLowerCase();

  if (normalized.includes("réalis") || normalized.includes("realis")) {
    return "historiqueSelectOptionRealisee";
  }

  if (normalized.includes("planif")) {
    return "historiqueSelectOptionPlanifiee";
  }

  if (normalized.includes("échou") || normalized.includes("echou")) {
    return "historiqueSelectOptionEchouee";
  }

  return "historiqueSelectOptionAll";
}

function StatutSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selected =
    STATUT_OPTIONS.find((option) => option.value === value) ??
    STATUT_OPTIONS[0];

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div
      className={`historiqueSelect ${open ? "historiqueSelectOpen" : ""}`}
      ref={rootRef}
    >
      <button
        type="button"
        id="filter-statut"
        className="historiqueSelectTrigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="historiqueSelectValue">{selected.label}</span>
        <svg
          className="historiqueSelectChevron"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open ? (
        <ul className="historiqueSelectMenu" role="listbox" aria-label="Statut">
          {STATUT_OPTIONS.map((option) => {
            const isSelected = option.value === value;

            return (
              <li key={option.value || "all"} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={[
                    "historiqueSelectOption",
                    getStatutOptionClass(option.value),
                    isSelected ? "historiqueSelectOptionSelected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function HistoriqueFilters({ filters, onChange, onSubmit, loading }) {
  return (
    <form
      className="historiqueFilters"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="historiqueFilterField">
        <label htmlFor="filter-id-satellite">ID satellite</label>
        <input
          id="filter-id-satellite"
          type="text"
          className="historiqueFilterInput"
          placeholder="ex. SAT-001"
          value={filters.id_satellite}
          onChange={(event) =>
            onChange({ ...filters, id_satellite: event.target.value })
          }
        />
      </div>

      <div className="historiqueFilterField">
        <label htmlFor="filter-statut">Statut</label>
        <StatutSelect
          value={filters.statut}
          onChange={(statut) => onChange({ ...filters, statut })}
        />
      </div>

      <button
        type="submit"
        className="historiqueFilterBtn"
        disabled={loading}
      >
        {loading ? "Chargement…" : "Filtrer"}
      </button>
    </form>
  );
}

export default function HistoriqueList() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ id_satellite: "", statut: "" });
  const [appliedFilters, setAppliedFilters] = useState({
    id_satellite: "",
    statut: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistorique = useCallback(async (activeFilters) => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchHistoriqueFenetres(activeFilters);
      const rows = Array.isArray(data) ? data : [];

      setItems(
        rows.map((row) => ({
          id_fenetre: row.id_fenetre ?? "—",
          date_heure_debut: formatDateTime(row.date_heure_debut),
          duree_secondes: formatDuree(row.duree_secondes),
          id_satellite: pickField(row, "id_satellite") ?? "—",
          nom_satellite: pickField(row, "nom_satellite", ["nom"]) ?? "—",
          id_station:
            pickField(row, "id_station", ["code_station"]) ?? "—",
          nom_station: pickField(row, "nom_station") ?? "—",
          elevation_max_deg: formatElevation(row.elevation_max_deg),
          volume_donnees_mo: formatVolume(row.volume_donnees_mo),
          statut: row.statut ?? "—",
        })),
      );
    } catch (err) {
      const message =
        err.response?.data?.error ??
        "Impossible de charger l'historique des communications.";
      setError(message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistorique(appliedFilters);
  }, [appliedFilters, loadHistorique]);

  function handleFilterSubmit() {
    setAppliedFilters({ ...filters });
  }

  const listShell = (content) => (
    <div
      className="satShell historiqueShell"
      role="region"
      aria-label="Historique des fenêtres de communication"
    >
      {content}
    </div>
  );

  let shellContent;

  if (loading && !items.length) {
    shellContent = (
      <p className="historiqueState">Chargement de l&apos;historique…</p>
    );
  } else if (error) {
    shellContent = (
      <p className="historiqueState historiqueStateError" role="alert">
        {error}
      </p>
    );
  } else if (!items.length) {
    shellContent = (
      <p className="historiqueState">
        Aucune fenêtre trouvée pour ces filtres.
      </p>
    );
  } else {
    shellContent = (
      <>
        <div className="historiqueMeta" role="status">
          {loading
            ? "Actualisation…"
            : `${items.length} fenêtre${items.length > 1 ? "s" : ""}`}
        </div>

        <div className="headerRow">
          <div className="hcellIcon" />
          <div className="hcell hcellId">ID</div>
          <div className="hcell hcellDate">Début</div>
          <div className="hcell hcellDuree">Durée</div>
          <div className="hcell hcellSatId">Satellite</div>
          <div className="hcell hcellName">Nom sat.</div>
          <div className="hcell hcellStationId">Station</div>
          <div className="hcell hcellStationName">Nom stat.</div>
          <div className="hcell hcellElev">Élév. max</div>
          <div className="hcell hcellVol">Volume</div>
          <div className="hcell hcellStatut">Statut</div>
        </div>

        {items.map((row) => (
          <HistoriqueRow key={row.id_fenetre} {...row} />
        ))}
      </>
    );
  }

  return (
    <div className="historiquePage">
      <HistoriqueFilters
        filters={filters}
        onChange={setFilters}
        onSubmit={handleFilterSubmit}
        loading={loading}
      />

      {listShell(shellContent)}
    </div>
  );
}
