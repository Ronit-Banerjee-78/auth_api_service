import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("ownerToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const ownerAPI = {
  register: (data) => api.post("/api/owner/register", data),
  login: (data) => api.post("/api/owner/login", data),
  getUsers: () => api.get("/api/owner/users"),
  updateUser: (id, data) => api.put(`/api/owner/users/${id}`, data),
  getApiKey: () => api.get("/api/owner/api-key"),
};

export default api;
