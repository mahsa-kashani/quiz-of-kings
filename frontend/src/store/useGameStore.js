import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = "http://localhost:3000/api/game";

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

export const useGameStore = create((set, get) => ({
  loading: false,
  error: null,
  selectedCategory: null,
  searching: false,
  game: {},
  rounds: [],
  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
  },
  findOpponentAndStartGame: async () => {
    set({ searching: true });
    try {
      const response = await axiosInstance.get();

      // if (result.gameId && result.isFirstPlayer) {
      //   navigate(`/game/${result.gameId}/category`);
      // } else if (result.gameId) {
      //   navigate(`/game/${result.gameId}`);
      // } else {
      //   toast.error("Unexpected server response");
      // }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to start game";
      toast.error(message);
    } finally {
      set({ searching: false });
    }
  },
}));
