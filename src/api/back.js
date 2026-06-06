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

export async function desorbiterSatellite(idSatellite) {
  const { data } = await api.post(
    `/api/satellites/${encodeURIComponent(idSatellite)}/desorbiter`,
    { confirm: true },
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

export async function fetchActiveMissions() {
  const { data } = await api.get("/api/back/missions/actives");
  return data;
}

export async function createParticipation(payload) {
  const { data } = await api.post("/api/participations", payload);
  return data;
}

export async function fetchSatelliteInstruments(idSatellite) {
  const { data } = await api.get(
    `/api/back/satellites/${encodeURIComponent(idSatellite)}/instruments`,
  );
  return data;
}

export async function createEmbarquement(payload) {
  const { data } = await api.post("/api/embarquements", payload);
  return data;
}

export async function deleteEmbarquement(idSatellite, idInstrument) {
  const { data } = await api.delete(
    `/api/embarquements/${encodeURIComponent(idSatellite)}/${encodeURIComponent(idInstrument)}`,
  );
  return data;
}

export async function updateEmbarquementEtat(idSatellite, idInstrument, etat) {
  const { data } = await api.patch(
    `/api/embarquements/${encodeURIComponent(idSatellite)}/${encodeURIComponent(idInstrument)}`,
    { etat_fonctionnement: etat },
  );
  return data;
}
