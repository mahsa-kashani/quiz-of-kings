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
  searching: false,
  game: {},
  rounds: [],
  findOpponentAndStartGame: async (navigate) => {
    set({ searching: true });
    try {
      const {
        data: { game, isFirstPlayer },
      } = await axiosInstance.post("/find-or-create");
      set({ game });

      if (isFirstPlayer) {
        navigate(`/game/${game.id}/category`);
      } else {
        navigate(`/game/${game.id}`);
      }
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.message || "Failed to start game";
      set({ game: {} });
      toast.error(message);
    } finally {
      set({ searching: false });
    }
  },
  submitCategoryAndStartRound: async (cat, navigate, gameId) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.post("/:id/round", {
        category: cat,
      });
      navigate(`/game/${gameId}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to start round.");
    } finally {
      set({ loading: false });
    }
  },
}));
