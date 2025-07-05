import { create } from "zustand";
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/game";

export const useMessageStore = create((set) => ({
  loading: false,
  error: null,
  unreadCount: 0,
  selectedTab: "match",
  messages: [],

  setSelectedTab: (tab) => {
    set({ selectedTab: tab });
    if (tab === "chat") {
      set({ unreadCount: 0 }); // reset when viewing chat
    }
  },
  incrementUnread: () =>
    set((state) => ({
      unreadCount:
        state.selectedTab === "chat"
          ? state.unreadCount
          : state.unreadCount + 1,
    })),
  fetchMessages: async (gameId) => {
    set({ loading: true });
    try {
      const { data } = await axios.get(`${BASE_URL}/${gameId}/messages`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      set({ messages: data });
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.message || "Failed to fetch messages";
      set({ game: {}, error: message });
    } finally {
      set({ loading: false });
    }
  },
}));
