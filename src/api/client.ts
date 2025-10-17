import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API error", err?.response?.data ?? err.message);
    return Promise.reject(err);
  }
);

export default client;
