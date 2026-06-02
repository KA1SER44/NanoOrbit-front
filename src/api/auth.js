import api from "./client.js";

export async function fetchCurrentUser() {
  const { data } = await api.get("/api/auth/me");
  return data;
}

export async function login(username, password) {
  const { data } = await api.post("/api/auth/login", { username, password });
  return data;
}

export async function logout() {
  const { data } = await api.post("/api/auth/logout");
  return data;
}
