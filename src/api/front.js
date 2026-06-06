import api from "./client.js";

export async function fetchSatellites() {
  const { data } = await api.get("/api/satellites");
  return data;
}

export async function fetchCommunications() {
  const { data } = await api.get("/api/communications");
  return data;
}

export async function fetchMissions() {
  const { data } = await api.get("/api/missions");
  return data;
}

export async function fetchAlertes() {
  const { data } = await api.get("/api/alertes");
  return data;
}

export async function fetchHistoriqueFenetres(filters = {}) {
  const params = {};
  const idSatellite = filters.id_satellite?.trim();
  const statut = filters.statut?.trim();

  if (idSatellite) params.id_satellite = idSatellite;
  if (statut) params.statut = statut;

  const { data } = await api.get("/api/fenetres/historique", { params });
  return data;
}
