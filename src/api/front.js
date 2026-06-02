import api from "./client.js";

export async function fetchCommunications() {
  const { data } = await api.get("/api/communications");
  return data;
}
