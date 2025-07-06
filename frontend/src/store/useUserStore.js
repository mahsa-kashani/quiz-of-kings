import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = "http://localhost:3000/api/users";

const axiosInstance = axios.create({ baseURL: BASE_URL });

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const useUserStore = create((set, get) => ({
  loading: false,
  error: null,
  users: [],
  fetchUsers: async () => {
    set({ loading: true });
    try {
      const { data } = await axiosInstance.get("/");
      set({ users: data });
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.message || "Failed to load users.";
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },
  toggleBan: async (userId, newStatus) => {
    try {
      await axiosInstance.put(`/${userId}/ban`, { is_banned: newStatus });
      toast.success(newStatus ? "User banned" : "User unbanned");
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update ban status.";
      toast.error(message);
    }
  },
}));
