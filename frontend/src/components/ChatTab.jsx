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

const ChatTab = () => {
  const { gameId } = useParams();
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const messagesEndRef = useRef(null);
  const myId = Number(JSON.parse(localStorage.getItem("user")).id);
  const { messages, fetchMessages, loading, error } = useMessageStore();

  useEffect(() => {
    fetchMessages(gameId);
  }, [gameId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      const url = `http://localhost:3000/api/game/${gameId}/messages`;
      const payload = {
        text: input,
        reply_to: replyTo?.id || null,
      };
      if (editingId) {
        await axios.put(`${url}/${editingId}`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        toast.success("Message edited");
      } else {
        await axios.post(url, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        toast.success("Message sent");
      }
      setInput("");
      setEditingId(null);
      setReplyTo(null);
      fetchMessages();
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
      fetchMessages();
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
    <div className="flex flex-col space-y-4 max-h-[65vh]">
      {messages.length === 0 ? (
        <p className="text-center text-base-content/60">No messages yet.</p>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat ${
              msg.sender_id === myId ? "chat-end" : "chat-start"
            }`}
          >
            <div className="chat-header text-sm font-semibold">
              {msg.sender.username}
            </div>

            {msg.reply_to && (
              <div className="bg-base-200 p-2 rounded text-xs text-base-content/60">
                <CornerDownRight className="w-5 h-5" />
                {msg.reply_to.content.slice(0, 100)}
              </div>
            )}

            <div className="chat-bubble bg-primary text-primary-content relative">
              {msg.content}
              {msg.sender_id === myId && (
                <div className="absolute bottom-1 right-2 flex gap-2 text-xs">
                  <button
                    onClick={() => {
                      setInput(msg.content);
                      setEditingId(msg.id);
                    }}
                    className="hover:text-warning"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="hover:text-error"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <button
              className="text-xs text-blue-400 hover:underline"
              onClick={() => setReplyTo(msg)}
            >
              Reply
            </button>
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
