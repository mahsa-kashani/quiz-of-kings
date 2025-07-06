import React, { useEffect, useState } from "react";
import { useMessageStore } from "../../store/useMessageStore";
import BackToPage from "../../components/BackToPage";
import { MessageCircle } from "lucide-react";

export default function AdminChatsPage() {
  const { fetchAllChats, allChats, loading, error } = useMessageStore();
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    fetchAllChats();
  }, []);

  return (
    <div className="min-h-screen px-6 py-10 bg-base-200">
      <BackToPage page="dashboard" />
      <h2 className="text-4xl font-bold text-center text-primary mb-8">
        Chat History
      </h2>

      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <span className="loading loading-spinner text-primary"></span>
        </div>
      ) : error ? (
        <p className="text-center text-error">{error}</p>
      ) : allChats.length === 0 ? (
        <p className="text-center text-base-content/70 text-xl">
          No chats available.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allChats.map((chat) => (
            <div
              key={chat.id}
              className="card bg-base-100 border border-base-content/10 shadow-md hover:shadow-lg hover:scale-[1.01] transition-transform cursor-pointer"
              onClick={() => setSelectedChat(chat)}
            >
              <div className="card-body">
                <h3 className="font-semibold text-base-content">
                  Game #{chat.game_id}
                </h3>
                <p className="text-sm text-base-content/70">
                  {chat.player1_username} vs {chat.player2_username}
                </p>
                <div className="badge badge-outline text-xs mt-2">
                  {chat.messages.length} messages
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat Preview */}
      {selectedChat && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-base-100 max-w-lg w-full p-6 rounded-lg shadow-xl relative">
            <button
              className="absolute top-3 right-3 btn btn-sm btn-circle btn-ghost"
              onClick={() => setSelectedChat(null)}
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-2">
              Chat: Game #{selectedChat.game_id}
            </h3>
            <div className="max-h-[50vh] overflow-y-auto space-y-3">
              {selectedChat.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat ${
                    msg.sender_id === selectedChat.player1_id
                      ? "chat-start"
                      : "chat-end"
                  }`}
                >
                  <div className="chat-bubble">
                    <span className="font-semibold">
                      {msg.sender_username}:
                    </span>{" "}
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
