import { useState, useEffect, useRef } from "react";
import {
  SendHorizonal,
  Trash2,
  Edit2,
  CornerDownRight,
  Check,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useMessageStore } from "../store/useMessageStore";
import toast from "react-hot-toast";
import axios from "axios";

const ChatTab = ({ opponent }) => {
  const { gameId } = useParams();
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const messagesEndRef = useRef(null);
  const me = JSON.parse(localStorage.getItem("user"));
  const myId = Number(me.id);

  const { messages, fetchMessages, loading, error, sendMessage } =
    useMessageStore();

  useEffect(() => {
    fetchMessages(gameId);
  }, [gameId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      if (editingId) {
        await axios.put(`${url}/${editingId}`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        toast.success("Message edited");
      } else {
        sendMessage(gameId, input, opponent.id, replyTo?.id || null);
      }
      setInput("");
      setEditingId(null);
      setReplyTo(null);
      fetchMessages(gameId);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    }
  };

  const handleDelete = async (msgId) => {
    try {
      await axios.delete(
        `http://localhost:3000/api/game/${gameId}/messages/${msgId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Message deleted");
      fetchMessages(gameId);
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  if (loading) {
    return (
      <div className="bg-base-100 p-6 rounded-xl shadow flex justify-center items-center min-h-[20vh] text-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-base-100 p-6 rounded-xl shadow text-center space-y-2 min-h-[20vh] flex flex-col justify-center items-center">
        <h2 className="text-xl font-semibold text-error">Error loading chat</h2>
        <p className="text-base text-base-content/70">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 overflow-y-auto grow min-h-[300px] px-4 max-w-5xl mx-auto w-full">
      {messages.length === 0 ? (
        <p className="text-center text-base-content/60">No messages yet.</p>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat ${
              msg.sender_id === myId ? "chat-start" : "chat-end"
            }`}
          >
            {(() => {
              const repliedMsg = messages.find((m) => m.id === msg.reply_to_id);
              if (!repliedMsg) return null;

              return (
                <div className="bg-base-200 p-2 rounded text-xs text-base-content/60">
                  <CornerDownRight className="w-5 h-5 inline-block mr-1" />
                  {repliedMsg.content.slice(0, 100)}
                </div>
              );
            })()}

            <div className="flex flex-col gap-2 max-w-full">
              <div
                className={`chat-bubble rounded-xl px-4 py-3 text-base leading-relaxed whitespace-pre-wrap w-fit text-left ${
                  msg.sender_id === myId
                    ? "bg-primary text-primary-content self-start"
                    : "bg-base-300 text-base-content self-end"
                }`}
              >
                {msg.content}
              </div>

              <div className="flex justify-start gap-4 items-center text-sm text-white/80">
                {msg.sender_id === myId && (
                  <>
                    <button
                      onClick={() => {
                        setInput(msg.content);
                        setEditingId(msg.id);
                      }}
                      className="flex items-center gap-1 hover:text-yellow-300 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="flex items-center gap-1 hover:text-red-300 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  className="flex items-center gap-1 hover:text-cyan-300 transition"
                  onClick={() => setReplyTo(msg)}
                >
                  <CornerDownRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      <div ref={messagesEndRef} />

      {replyTo && (
        <div className="text-left text-sm text-base-content/60">
          Replying to: <span className="italic">{replyTo.content}</span>
          <button
            className="ml-2 text-xs text-error hover:underline"
            onClick={() => setReplyTo(null)}
          >
            Cancel
          </button>
        </div>
      )}

      <div className="flex gap-5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type="text"
          className="input input-bordered w-full"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="btn btn-primary btn-square"
          aria-label="Send"
        >
          {editingId ? (
            <Check className="w-5 h-5" />
          ) : (
            <SendHorizonal className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatTab;
