import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = "http://localhost:3000/api/messages";

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
      const { data } = await axios.get(`${BASE_URL}/${gameId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      set({ messages: data });
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.message || "Failed to fetch messages";
      set({ messages: [], error: message });
    } finally {
      set({ loading: false });
    }
  },
  sendMessage: async (gameId, content, receiver_id, reply_to_id) => {
    try {
      await axios.post(
        `${BASE_URL}/${gameId}`,
        { content, receiver_id, reply_to_id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Message sent");
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.message || "Failed to send messages";
      toast.error(message);
    }
  },
  editMessage: async (gameId, content, message) => {
    try {
      await axios.put(
        `${BASE_URL}/${gameId}/${message.id}`,
        {
          id: message.id,
          game_id: gameId,
          sender_id: message.sender_id,
          receiver_id: message.receiver_id,
          content,
          created_at: message.created_at,
          is_edited: true,
          reply_to_id: message.reply_to_id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Message edited");
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.message || "Failed to edit messages";
      toast.error(message);
    }
  },
}));
