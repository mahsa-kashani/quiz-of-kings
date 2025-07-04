// ✅ GamePage.jsx
import { useState } from "react";
import { Tab } from "daisyui";
import { useGameStore } from "../store/useGameStore";

export default function GamePage() {
  const { gameData, player, opponent, rounds } = useGameStore();
  const [tab, setTab] = useState("match");

  return (
    <div className="min-h-screen px-4 py-6 bg-base-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col items-center">
          <div className="avatar">
            <div className="w-12 rounded-full">
              <img src={player.avatar || "/avatar.png"} alt="you" />
            </div>
          </div>
          <p className="font-bold">{player.username}</p>
          <span className="text-success font-semibold">{player.score} pts</span>
        </div>

        <div className="text-lg font-bold">🆚</div>

        <div className="flex flex-col items-center">
          <div className="avatar">
            <div className="w-12 rounded-full">
              <img src={opponent.avatar || "/avatar.png"} alt="opponent" />
            </div>
          </div>
          <p className="font-bold">{opponent.username}</p>
          <span className="text-success font-semibold">
            {opponent.score} pts
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" className="tabs tabs-bordered">
        <button
          role="tab"
          className={`tab ${tab === "match" ? "tab-active" : ""}`}
          onClick={() => setTab("match")}
        >
          🏆 Match
        </button>
        <button
          role="tab"
          className={`tab ${tab === "chat" ? "tab-active" : ""}`}
          onClick={() => setTab("chat")}
        >
          💬 Chat
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {tab === "match" ? (
          <div className="space-y-4">
            {rounds.map((round, index) => (
              <div key={index} className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <p className="text-info font-semibold">
                    Category: {round.category}
                  </p>
                  <div className="flex justify-between">
                    <div>
                      <p className="font-bold">You:</p>
                      {round.yourAnswer ? (
                        <p>{round.yourAnswer}</p>
                      ) : round.isYourTurn ? (
                        <button className="btn btn-sm btn-info">
                          Play Now
                        </button>
                      ) : (
                        <p className="text-warning">Waiting...</p>
                      )}
                    </div>
                    <div>
                      <p className="font-bold">Opponent:</p>
                      {round.opponentPlayed ? (
                        round.revealOpponentAnswer ? (
                          <p>{round.opponentAnswer}</p>
                        ) : (
                          <p className="text-info">Hidden</p>
                        )
                      ) : (
                        <p className="text-warning">Waiting...</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-base-100 p-4 rounded-lg shadow">
            <p className="text-center text-base-content/70">
              Chat coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
