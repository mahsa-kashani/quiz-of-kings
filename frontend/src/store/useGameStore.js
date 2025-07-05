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
  game: {
    id: 0,
    player1: null,
    player2: null,
    winner: null,
    status: "",
    created_at: "",
    ended_at: "",
  },
  rounds: [],

  updateRoundAfterAnswer: (roundId, myAnswer) => {
    const { rounds } = get();
    const updated = rounds.map((r) =>
      r.id === roundId
        ? {
            ...r,
            answers: [...r.answers, myAnswer],
            currentTurn: 1,
          }
        : r
    );
    set({ rounds: updated });
  },
  fetchGame: async (gameId) => {
    set({ loading: true });
    try {
      const {
        data: { players, game },
      } = await axiosInstance.get(`/${gameId}`);
      set({
        game: {
          id: game.id,
          status: game.game_status,
          created_at: game.created_at,
          ended_at: game.ended_at,
          winner: game.winner,
          player1: players[0],
          player2: players[1],
        },
      });
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.message || "Failed to load game info";
      set({ game: {}, error: message });
    } finally {
      set({ loading: false });
    }
  },

  fetchRounds: async (gameId) => {
    set({ loading: true });
    try {
      const { data } = await axiosInstance.get(`/${gameId}/rounds`);
      // id, round_number, category, question, options, currentTurn, answers
      set({ rounds: data });
    } catch (err) {
      console.log(err);
      const message =
        err.response?.data?.message || "Failed to load round info";
      set({ rounds: [], error: message });
    } finally {
      set({ loading: false });
    }
  },

  sendAnswers: async (gameId, roundId, answer) => {
    try {
      await axiosInstance.post(`/${gameId}/round/${roundId}/answer`, answer);
      get().updateRoundAfterAnswer(roundId, answer);
      toast.success("Answer submitted!");
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.message || "Failed to start game";
      toast.error(message);
    }
  },

  sendResult: async (gameId, winnerId) => {
    const myId = Number(JSON.parse(localStorage.getItem("user")).id);
    try {
      const {
        data: { game_status, ended_at, winner_id },
      } = await axiosInstance.post(`/${gameId}/result`, winnerId);
      set((state) => ({
        game: {
          ...state.game,
          winner: winner_id,
          ended_at,
          status: game_status,
        },
      }));

      if (winner_id === myId) toast.success("You win!");
      else if (!winnerId) toast("Game tied");
      else toast.error("You lose!");
    } catch (err) {
      console.log(err);
      const message =
        err.response?.data?.message || "Failed to save game results";
      toast.error(message);
    }
  },

  findOpponentAndStartGame: async (navigate) => {
    set({ searching: true });
    try {
      const {
        data: { game, isFirstPlayer, players },
      } = await axiosInstance.post("/find-or-create");
      set({
        game: {
          id: game.id,
          status: game.game_status,
          created_at: game.created_at,
          ended_at: game.ended_at,
          winner: game.winner,
          player1: players[0],
          player2: players[1],
        },
      });
      set({ game: { player1: players[0], player2: players[1] } });

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
      const {
        data: { question, options, round, currentTurn },
      } = await axiosInstance.post(`/${gameId}/round`, {
        category: cat,
      });
      const { rounds } = get();
      set({
        rounds: [
          ...rounds,
          {
            id: round.id,
            round_number: round.round_number,
            category: cat.category_name,
            currentTurn,
            question,
            options,
            answers: [],
          },
        ],
      });
      navigate(`/game/${gameId}/round/${round.id}`);
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.message || "Failed to start round";
      set({ rounds: [] });
      toast.error(message);
    } finally {
      set({ loading: false });
    }
  },
}));
