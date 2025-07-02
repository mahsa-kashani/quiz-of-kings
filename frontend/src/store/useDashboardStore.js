import { create } from "zustand";
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/dashboard";

const axiosInstance = axios.create({ baseURL: BASE_URL });

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

export const useDashboardStore = create((set, get) => ({
  loading: false,
  error: null,
  userStats: {
    username: "",
    all_time_score: 0,
    xp: 0,
    games_played: 0,
    games_won: 0,
    games_tied: 0,
  },
  fetchUserStats: async () => {
    set({ loading: true });
    try {
      const {
        data: { userStats, user, all_time_score },
      } = await axiosInstance.get("/stats");
      set({
        userStats: {
          username: user.username,
          all_time_score: all_time_score,
          xp: userStats.xp,
          games_played: userStats.games_played,
          games_won: userStats.games_won,
          games_tied: userStats.games_tied,
        },
      });
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong";
      set({
        error: message,
        playerStats: { username: "", all_time_score: 0, xp: 0 },
      });
    } finally {
      set({ loading: false });
    }
  },
}));
