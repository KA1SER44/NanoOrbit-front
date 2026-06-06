import api from "./client.js";

export async function fetchAllSatellites() {
  const { data } = await api.get("/api/back/satellites");
  return data;
}

export async function updateSatelliteStatut(idSatellite, statut) {
  const { data } = await api.post(
    `/api/satellites/${encodeURIComponent(idSatellite)}/statut`,
    { statut },
  );
  return data;
}

export async function fetchOperationalSatellites() {
  const { data } = await api.get("/api/back/satellites/operationnels");
  return data;
}

export async function fetchActiveStations() {
  const { data } = await api.get("/api/back/stations/actives");
  return data;
}

export async function createFenetre(payload) {
  const { data } = await api.post("/api/fenetres", payload);
  return data;
}
