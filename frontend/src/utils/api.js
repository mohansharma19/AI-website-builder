import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";

    const isThirdParty = /(deploy|github)$/i.test(url);

    if (err.response?.status === 401 && !isThirdParty) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export const apiError = (err) =>
  err?.response?.data?.error ||
  err?.response?.data?.message ||
  err?.message ||
  "Something went wrong";

const body = (promise) => promise.then((res) => res.data);

// ==================== AUTH ====================

export const register = (data) =>
  body(API.post("/api/auth/register", data));

export const registerVerify = (email, code) =>
  body(API.post("/api/auth/register/verify", { email, code }));

export const registerResend = (email) =>
  body(API.post("/api/auth/register/resend", { email }));

export const login = (data) =>
  body(API.post("/api/auth/login", data));

export const getMe = () =>
  body(API.get("/api/auth/me"));

export const updateProfile = (data) =>
  body(API.patch("/api/auth/me", data));

export const changePassword = (data) =>
  body(API.patch("/api/auth/me/password", data));

export const deleteMyAccount = () =>
  body(API.delete("/api/auth/me"));

export const getContributions = () =>
  body(API.get("/api/auth/me/contributions"));

// ==================== FORGOT PASSWORD ====================

export const forgotRequest = (email) =>
  body(API.post("/api/auth/forgot/request", { email }));

export const forgotVerifyCode = (email, code) =>
  body(API.post("/api/auth/forgot/verify-code", { email, code }));

export const forgotReset = (email, code, newPassword) =>
  body(
    API.post("/api/auth/forgot/reset", {
      email,
      code,
      newPassword,
    })
  );

// ==================== PROJECTS ====================

export const getProjects = () =>
  body(API.get("/api/projects"));

export const createProject = (data) =>
  body(API.post("/api/projects", data));

export const getProject = (id) =>
  body(API.get(`/api/projects/${id}`));

export const updateProject = (id, data) =>
  body(API.patch(`/api/projects/${id}`, data));

export const deleteProject = (id) =>
  body(API.delete(`/api/projects/${id}`));

export const generateProject = (id, prompt) =>
  body(
    API.post(`/api/projects/${id}/generate`, {
      prompt,
    })
  );

export const uploadToGithub = (id, data) =>
  body(API.post(`/api/projects/${id}/github`, data));

export const deployToVercel = (id, data) =>
  body(API.post(`/api/projects/${id}/deploy`, data));

// ==================== COMMUNITY ====================

export const getCommunity = (sort = "new") =>
  body(API.get(`/api/community?sort=${sort}`));

export const getCommunityProject = (id) =>
  body(API.get(`/api/community/${id}`));

export const likeCommunityProject = (id) =>
  body(API.post(`/api/community/${id}/like`));

// ==================== PAYMENTS ====================

export const getPackages = () =>
  body(API.get("/api/payments/packages"));

export const createCheckoutSession = (packageId) =>
  body(
    API.post("/api/payments/create-checkout-session", {
      packageId,
    })
  );

export const verifySession = (sessionId) =>
  body(
    API.post("/api/payments/verify-session", {
      sessionId,
    })
  );

export default API;