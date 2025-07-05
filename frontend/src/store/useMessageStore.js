import { create } from "zustand";

export const useMessageStore = create((set) => ({
  unreadCount: 0,
  selectedTab: "match",

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
}));
