import { useEffect, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MessageSquare,
  Sword,
  Trophy,
  Handshake,
  Skull,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import BackToPage from "../components/BackToPage";

export default function GamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { game, rounds, fetchGame, fetchRounds, loading, error, sendResult } =
    useGameStore();
  const [selectedTab, setSelectedTab] = useState("match");
  const [animatingTab, setAnimatingTab] = useState("match");
  const myId = Number(JSON.parse(localStorage.getItem("user")).id);

  const [dataLoaded, setDataLoaded] = useState(false);

  const calculateWinner = () => {
    const myCorrect = rounds.filter((r) => {
      const answer = r.answers.find((a) => a.player_id === myId);
      return answer?.selected_option === r.question.correct_option_id;
    }).length;

    const opponentCorrect = rounds.filter((r) => {
      const answer = r.answers.find((a) => a.player_id === opponent?.id);
      return answer?.selected_option === r.question.correct_option_id;
    }).length;

    if (myCorrect > opponentCorrect) return myId;
    else if (opponentCorrect > myCorrect) return opponent?.id;
    else return null; // draw
  };

  useEffect(() => {
    const fetchAll = async () => {
      await fetchGame(gameId);
      await fetchRounds(gameId);
      setDataLoaded(true);
    };
    fetchAll();
  }, [gameId]);

  useEffect(() => {
    if (!dataLoaded) return;
    if (rounds.length === 4 && !rounds[rounds.length - 1].currentTurn) {
      const winnerId = calculateWinner();

      sendResult(gameId, winnerId);
    }
  }, [rounds]);

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

  const handleTabChange = (tab) => {
    setAnimatingTab(""); // trigger re-render for animation
    setTimeout(() => {
      setSelectedTab(tab);
      setAnimatingTab(tab);
    }, 10); // delay required to allow class transition
  };

  const handleStartNewRound = () => {
    // Check if round count < 4
    if (rounds.length >= 4 && !lastRound.currentTurn) return;

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

      <div className="tabs tabs-boxed justify-center gap-4">
        {["match", "chat"].map((tab) => (
          <button
            key={tab}
            className={`tab transition-all duration-300 ease-in-out rounded-lg
  ${
    selectedTab === tab
      ? "tab-active bg-primary text-primary-content shadow-md"
      : "hover:bg-primary/10 hover:text-primary bg-base-100 text-base-content"
  }`}
            onClick={() => handleTabChange(tab)}
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
        <div
          className={`space-y-6 transition-all duration-300 ease-out ${
            animatingTab === "match"
              ? "opacity-100 "
              : "opacity-0 pointer-events-none "
          }`}
        >
          {rounds.length ? (
            rounds.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-3 items-center text-sm bg-base-100 p-4 rounded-lg shadow cursor-pointer hover:bg-base-300"
              >
                <div className="flex justify-center items-center">
                  {(() => {
                    const a = r.answers.find((a) => a.player_id === myId);
                    if (!a)
                      return <Clock className="w-5 h-5 text-base-content/50" />;
                    return a.selected_option ===
                      r.question.correct_option_id ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-error" />
                    );
                  })()}
                </div>

                <div className="text-center font-semibold text-base-content">
                  {r.category}
                </div>

                <div className="flex justify-center items-center">
                  {(() => {
                    const a = r.answers.find(
                      (a) => a.player_id === opponent?.id
                    );
                    if (!opponent)
                      return (
                        <span className="text-xs text-base-content/60">
                          Searching...
                        </span>
                      );
                    if (!a)
                      return <Clock className="w-5 h-5 text-base-content/50" />;
                    if (
                      (isStarter && !r.currentTurn) ||
                      r.currentTurn !== myId
                    ) {
                      return a.selected_option ===
                        r.question.correct_option_id ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <XCircle className="w-5 h-5 text-error" />
                      );
                    }
                    return <span className="text-base-content/40">-</span>;
                  })()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-base-content/60">No rounds yet.</p>
          )}

          {rounds.length < 4 || lastRound.currentTurn ? (
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
            <div className="text-center text-base-content/60 space-y-3">
              <p className="text-lg">Game completed.</p>
              {(() => {
                const winnerId = calculateWinner();
                const isWin = winnerId === myId;
                const isLose = winnerId === opponent?.id;

                const message = isWin
                  ? "You won"
                  : isLose
                  ? `${opponent?.username} won`
                  : "It's a draw";

                const Icon = isWin ? Trophy : isLose ? Skull : Handshake;
                const colorClass = isWin
                  ? "text-success"
                  : isLose
                  ? "text-error"
                  : "text-warning";

                return (
                  <p
                    className={`font-semibold flex items-center justify-center gap-2 ${colorClass}`}
                  >
                    <Icon className="w-5 h-5" />
                    {message}
                  </p>
                );
              })()}
            </div>
          )}
        </div>
      ) : (
        <div
          className={`transition-all duration-300 ease-out ${
            animatingTab === "chat"
              ? "opacity-100"
              : "opacity-0 pointer-events-none "
          } bg-base-100 p-6 rounded-xl shadow text-center text-base-content/60 `}
        >
          Chat functionality coming soon...
        </div>
      )}
    </div>
  );
}
