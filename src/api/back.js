import api from "./client.js";

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
