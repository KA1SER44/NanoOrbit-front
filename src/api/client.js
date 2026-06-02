import axios from "axios";

const api = axios.create({
  // En dev : chaîne vide → même origine (localhost:5173) + proxy Vite
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
