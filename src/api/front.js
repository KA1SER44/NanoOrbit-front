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
