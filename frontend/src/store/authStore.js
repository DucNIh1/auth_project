import { create } from "zustand";
import axios from "axios";

axios.defaults.withCredentials = true;
const URL_API = "http://localhost:5000/api/v1/auth";

export const userAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true, // kiem tra xem co dang login khong

  signup: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${URL_API}/signup`, {
        email,
        password,
        name,
      });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error(error);
      set({ error: "Error signing up", isLoading: false });
      throw error;
    }
  },

  verifyEmail: async (code) => {
    try {
      set({ isLoading: true, error: null });
      await axios.post(`${URL_API}/verify-email`, { code });
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post(`${URL_API}/login`, {
        email: email,
        password: password,
      });
      set({
        isLoading: false,
        user: response.data.data.user,
        isAuthenticated: true,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response.data.message || "Login Error!",
      });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axios.get(`${URL_API}/check-auth`);
      console.log(response);
      set({
        user: response.data.data.user,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } catch (error) {
      set({ error: null, isCheckingAuth: false, isAuthenticated: false });
      throw error;
    }
  },
  logout: async () => {
    try {
      await axios.post(`${URL_API}/logout`);
      set({
        isCheckingAuth: false,
        error: null,
        isAuthenticated: false,
        user: null,
      });
    } catch (error) {
      set({ error: "Logout failed" });
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      set({ isLoading: true });
      await axios.post(`${URL_API}/forgot-password`, {
        email: email,
      });

      set({ isLoading: false });
    } catch (error) {
      set({ error: "Forgot Password failed" });
      throw error;
    }
  },

  resetPassword: async (token, password) => {
    try {
      set({ isLoading: true });
      await axios.post(`${URL_API}/reset-password/${token}`, {
        password,
      });
      set({ isLoading: false });
    } catch (error) {
      set({ error: "Reset password failed" });
      throw error;
    }
  },
}));
