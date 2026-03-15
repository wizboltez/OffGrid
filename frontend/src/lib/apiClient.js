import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem("lms-auth");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch {
        // no-op for invalid local cache
      }
    }
  }
  return config;
});
