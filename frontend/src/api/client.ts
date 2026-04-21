import axios, { AxiosInstance } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies in requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth API calls
export const authAPI = {
  register: (email: string, password: string) =>
    api.post("/api/auth/register", { email, password }),
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),
  logout: () => api.post("/api/auth/logout"),
  getProfile: () => api.get("/api/auth/me"),
};

// Payment API calls
export const paymentAPI = {
  createPayment: (amount: number) => api.post("/api/payments/create", { amount }),
  confirmPayment: (id: string) => api.post(`/api/payments/${id}/confirm`),
  getPayments: () => api.get("/api/payments"),
  initiateKcbPayment: (amount: number, phoneNumber: string) => api.post("/api/payments/kcb/initiate", { amount, phoneNumber }),
};

// Trading API calls
export const tradingAPI = {
  createLink: (paymentId: string) => api.post("/api/trading/create-link", { paymentId }),
  getLinks: () => api.get("/api/trading/links"),
  validateLink: (token: string) => api.get(`/api/trading/validate-link/${token}`),
};

export default api;
