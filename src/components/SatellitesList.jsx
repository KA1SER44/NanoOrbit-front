import "../styles/satellitesList.css";

const satellites = [
  { id: "SAT-0041", name: "Astra Prime", format: "1U", launch: "12 jan 2022", orbit: "LEO", alt: "412 km", battery: 87 },
  { id: "SAT-0078", name: "Helix-B3", format: "3U", launch: "05 avr 2023", orbit: "SSO", alt: "530 km", battery: 54 },
  { id: "SAT-0112", name: "Orion Relay", format: "6U", launch: "19 oct 2021", orbit: "MEO", alt: "8 050 km", battery: 72 },
  { id: "SAT-0155", name: "Kronos XI", format: "12U", launch: "30 jui 2020", orbit: "GEO", alt: "35 786 km", battery: 21 },
  { id: "SAT-0190", name: "Vega Scout", format: "3U", launch: "08 fév 2024", orbit: "LEO", alt: "480 km", battery: 93 },
  { id: "SAT-0203", name: "Nebula Core", format: "6U", launch: "22 sep 2022", orbit: "SSO", alt: "560 km", battery: 45 },
  { id: "SAT-0247", name: "Apex Zero", format: "1U", launch: "14 mar 2023", orbit: "LEO", alt: "390 km", battery: 18 },
  { id: "SAT-0289", name: "Titan Arc", format: "12U", launch: "03 nov 2019", orbit: "MEO", alt: "20 200 km", battery: 66 },
];

function getBatteryClass(pct) {
  if (pct >= 70) return "batHigh";
  if (pct >= 40) return "batMed";
  return "batLow";
}

function SatelliteRow({ id, name, format, launch, orbit, alt, battery }) {
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

      <div className={`satFormatBadge fmt${format.replace("U", "u")}`}>
        {format}
      </div>

      <div className="satCell w88">
        <strong>{launch}</strong>
      </div>

      <div className="satCell w72">
        <span className={`orbitPill orbit${orbit.toLowerCase()}`}>
          {orbit}
        </span>
      </div>

      <div className="satCell w56">
        <strong>{alt}</strong>
      </div>

      <div className={`batteryBar ${getBatteryClass(battery)}`}>
        <div className="batteryTrack">
          <div
            className="batteryFill"
            style={{ width: `${battery}%` }}
          />
        </div>

        <span className="batteryPct">{battery}%</span>
      </div>
    </div>
  );
}

export default function SatelliteList({ data = satellites }) {
  return (
    <div
      className="satShell"
      role="region"
      aria-label="Registre des satellites"
    >
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

      {data.map((sat) => (
        <SatelliteRow key={sat.id} {...sat} />
      ))}
    </div>
  );
}