import { create } from "zustand";
import api from "../lib/axios";

const getInitialUser = () => {
  try {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create((set, get) => ({
  user: getInitialUser(),
  token: localStorage.getItem("token") || null,
  isLoading: false,

  login: async (phoneNumber, password) => {
    set({ isLoading: true });
    const { data } = await api.post("/login", { phoneNumber, password });
    const { token, user, mustChangePassword } = data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user, isLoading: false });
    return { mustChangePassword };
  },

  register: async (payload) => {
    set({ isLoading: true });
    const { data } = await api.post("/register", payload);
    set({ isLoading: false });
    return data;
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/change-password", {
        currentPassword,
        newPassword,
      });

      // After changing password, update user flag
      const updatedUser = { ...get().user, mustChangePassword: false };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      set({ user: updatedUser, isLoading: false });

      return data;
    } catch (error) {
      // Handle validation errors from backend
      let errorMessage = "Failed to change password";

      if (error.response?.data?.errors) {
        // Multiple validation errors
        errorMessage = error.response.data.errors.join(", ");
      } else if (error.response?.data?.message) {
        // Single error message
        errorMessage = error.response.data.message;
      }

      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },

  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },
}));
