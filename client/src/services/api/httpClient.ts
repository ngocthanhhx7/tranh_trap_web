import axios from "axios";

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});
