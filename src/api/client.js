import axios from "axios";

// Chaîne vide en dev → requêtes relatives + proxy Vite (évite CORS)
const baseURL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
