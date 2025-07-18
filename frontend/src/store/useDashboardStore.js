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
    return Promise.reject(error);
  }
);

export const useDashboardStore = create((set, get) => ({
  loading: false,
  error: null,
  userStats: {
    username: "",
    id: 0,
    all_time_score: 0,
    xp: 0,
    games_played: 0,
    games_won: 0,
    games_tied: 0,
    correct_answers: 0,
    average_accuracy: 0,
    global_rank: 0,
  },

  globalLeaderboard: [],
  weeklyLeaderboard: [],
  monthlyLeaderboard: [],

  fetchGlobalLeaderboard: async () => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get("/leaderboard/global");
      set({ globalLeaderboard: response.data.leaderboard });
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.message || "Something went wrong";
      set({
        error: message,
        globalLeaderboard: [],
      });
    } finally {
      set({ loading: false });
    }
  },
  fetchWeeklyLeaderboard: async () => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get("/leaderboard/weekly");
      set({ weeklyLeaderboard: response.data.leaderboard });
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.message || "Something went wrong";
      set({
        error: message,
        weeklyLeaderboard: [],
      });
    } finally {
      set({ loading: false });
    }
  },
  fetchMonthlyLeaderboard: async () => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get("/leaderboard/monthly");
      set({ monthlyLeaderboard: response.data.leaderboard });
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.message || "Something went wrong";
      set({
        error: message,
        monthlyLeaderboard: [],
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchUserStats: async () => {
    set({ loading: true });
    try {
      const {
        data: { userStats, user, all_time_score, user_rank },
      } = await axiosInstance.get("/stats");
      set({
        userStats: {
          username: user.username,
          all_time_score,
          xp: userStats.xp,
          games_played: userStats.games_played,
          games_won: userStats.games_won,
          games_tied: userStats.games_tied,
          correct_answers: userStats.correct_answers,
          average_accuracy: userStats.average_accuracy,
          global_rank: user_rank,
          id: user.id,
        },
      });
    } catch (err) {
      console.log(err);
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
