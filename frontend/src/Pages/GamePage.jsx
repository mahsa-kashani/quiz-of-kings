import { useEffect, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MessageSquare, Sword } from "lucide-react";
import BackToPage from "../components/BackToPage";

export default function GamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { game, rounds, fetchGame, fetchRounds, loading, error } =
    useGameStore();
  const [selectedTab, setSelectedTab] = useState("match");
  const myId = Number(JSON.parse(localStorage.getItem("user")).id);

  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      await fetchGame(gameId);
      await fetchRounds(gameId);
      setDataLoaded(true);
    };
    fetchAll();
  }, [gameId]);

  if (!dataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }
  let me = null;
  let opponent = null;

  if (game.player1.id === myId) {
    me = game.player1;
    opponent = game.player2;
  } else {
    me = game.player2;
    opponent = game.player1;
  }
  const lastRound = rounds[rounds.length - 1];

  const isStarter =
    (game.player1.id === myId && lastRound.round_number % 2) ||
    (game.player2.id === myId && !(lastRound.round_number % 2));

  const isMyTurn =
    (isStarter && !lastRound?.currentTurn) || lastRound?.currentTurn === myId;

  const handleStartNewRound = () => {
    // Check if round count < 4
    if (rounds.length >= 4) return;

    if (rounds.length === 0 || !lastRound.currentTurn) {
      navigate(`/game/${gameId}/category`);
      return;
    } else {
      navigate(`/game/${gameId}/round/${lastRound.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-base-200 px-4">
        <h2 className="text-2xl font-bold text-error mb-2">Error</h2>
        <p className="text-base-content/70">{error}</p>
        <Link to="/" className="mt-4 btn btn-outline btn-error">
          Go Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6 space-y-6">
      <BackToPage page="dashboard" />

      <div className="text-center">
        <h1 className="text-xl font-bold text-primary">Game #{gameId}</h1>
      </div>

      <div className="flex justify-between bg-base-100 p-4 rounded-xl shadow">
        {[me, opponent || {}].map((player, idx) => (
          <div key={idx} className="text-center w-1/2">
            <h2 className="font-semibold text-base-content/80">
              {idx === 0 ? "You" : "Opponent"}
            </h2>
            <p className="text-primary font-bold">
              {player?.username || "Waiting..."}
            </p>
            {player && (
              <p className="text-sm text-base-content/60">
                XP: {player.xp ?? 0} | Score: {player.score ?? 0}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="tabs tabs-boxed justify-center">
        {["match", "chat"].map((tab) => (
          <button
            key={tab}
            className={`tab ${selectedTab === tab ? "tab-active" : ""}`}
            onClick={() => setSelectedTab(tab)}
          >
            {tab === "match" ? (
              <Sword className="w-4 h-4 mr-1" />
            ) : (
              <MessageSquare className="w-4 h-4 mr-1" />
            )}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {selectedTab === "match" ? (
        <div className="space-y-4">
          {rounds.length ? (
            rounds.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-3 items-center text-sm bg-base-100 p-4 rounded-lg shadow cursor-pointer hover:bg-base-300"
              >
                <div className="text-center">
                  {(() => {
                    const a = r.answers.find((a) => a.player_id === myId);
                    return a
                      ? a.selected_option_id === r.question.correct_option_id
                        ? "✅"
                        : "❌"
                      : "-";
                  })()}
                </div>

                <div className="text-center font-semibold text-base-content">
                  {r.category}
                </div>
                <div className="text-center">
                  {(() => {
                    const a = r.answers.find(
                      (a) => a.player_id === opponent?.id
                    );
                    return opponent
                      ? a && (isStarter || r.currentTurn !== myId)
                        ? a.selected_option_id === r.question.correct_option_id
                          ? "✅"
                          : "❌"
                        : "-"
                      : "Waiting...";
                  })()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-base-content/60">No rounds yet.</p>
          )}

          {rounds.length < 4 ? (
            isMyTurn ? (
              <div className="text-center">
                <button
                  className="btn btn-primary mt-6"
                  onClick={handleStartNewRound}
                >
                  Start New Round
                </button>
              </div>
            ) : (
              <p className="text-center text-base-content/60 mt-4">
                Waiting for opponent to play...
              </p>
            )
          ) : (
            <p className="text-center text-base-content/60 mt-4">
              Game completed.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-base-100 p-6 rounded-xl shadow text-center text-base-content/60">
          Chat functionality coming soon...
        </div>
      )}
    </div>
  );
}
