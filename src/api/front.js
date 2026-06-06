import api from "./client.js";

export async function fetchSatellites() {
  const { data } = await api.get("/api/satellites");
  return data;
}

export async function fetchCommunications() {
  const { data } = await api.get("/api/communications");
  return data;
}
