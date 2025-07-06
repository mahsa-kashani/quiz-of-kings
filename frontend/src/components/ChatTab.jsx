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

const ChatTab = ({ opponent }) => {
  const { gameId } = useParams();
  const [input, setInput] = useState("");
  const [editing, setEditing] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const messagesEndRef = useRef(null);
  const messageRefs = useRef({});
  const inputRef = useRef(null);
  const me = JSON.parse(localStorage.getItem("user"));
  const myId = Number(me.id);

  const {
    messages,
    fetchMessages,
    loading,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
  } = useMessageStore();

  useEffect(() => {
    fetchMessages(gameId);
  }, [gameId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (editing) {
      await editMessage(gameId, input, editing);
    } else {
      await sendMessage(gameId, input, opponent.id, replyTo?.id || null);
    }
    setInput("");
    setEditing(null);
    setReplyTo(null);
    await fetchMessages(gameId);
  };

  const handleDelete = async (msgId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?"
    );
    if (!confirmed) return;
    await deleteMessage(gameId, msgId);
    await fetchMessages(gameId);
    if (editing?.id === msgId) {
      setInput("");
      setEditing(null);
    }
    if (replyTo?.id === msgId) {
      setReplyTo(null);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };
  useEffect(() => {
    scrollToBottom();
    inputRef.current?.focus();
  }, [messages]);

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
            ref={(el) => (messageRefs.current[msg.id] = el)}
            className={`chat ${
              msg.sender_id === myId ? "chat-start" : "chat-end"
            }`}
          >
            <div className="relative w-fit max-w-full">
              {(() => {
                const repliedMsg = messages.find(
                  (m) => m.id === msg.reply_to_id
                );
                if (!repliedMsg) return null;

                return (
                  <div className="bg-base-200 p-2 rounded text-xs text-base-content/60">
                    <CornerDownRight className="w-5 h-5 inline-block mr-1" />
                    <span
                      onClick={() =>
                        messageRefs.current[repliedMsg.id]?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        })
                      }
                      className="cursor-pointer hover:underline"
                    >
                      {repliedMsg.content.slice(0, 100)}
                    </span>
                  </div>
                );
              })()}

              <div className={`relative w-fit max-w-full mb-7`}>
                <div
                  className={`chat-bubble rounded-xl px-4 py-3 text-base text-left break-words max-w-[50vw] ${
                    msg.sender_id === myId
                      ? "bg-primary text-primary-content "
                      : "bg-base-300 text-base-content "
                  }`}
                >
                  {msg.content}
                </div>

                <div className="flex absolute bottom-[-30px] left-[-8px] gap-1 items-center text-sm text-white/80">
                  {msg.sender_id === myId && (
                    <>
                      <button
                        onClick={() => {
                          setInput(msg.content);
                          setEditing(msg);
                          inputRef.current?.focus();
                          scrollToBottom();
                        }}
                        className="flex items-center gap-1 hover:text-yellow-300 transition btn-ghost rounded-full p-1"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="flex items-center gap-1 hover:text-red-300 transition btn-ghost rounded-full p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    className="flex items-center gap-1 hover:text-cyan-300 transition btn-ghost rounded-full p-1"
                    onClick={() => {
                      inputRef.current?.focus();
                      setReplyTo(msg);
                    }}
                  >
                    <CornerDownRight className="w-4 h-4" />
                  </button>
                </div>
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
          ref={inputRef}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          type="text"
          className="input input-bordered w-full text-white"
          placeholder="Type your message..."
        />
        <button
          onClick={(e) => {
            handleSend();
          }}
          className="btn btn-primary btn-square"
          aria-label="Send"
        >
          {editing ? (
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
