import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDashboardStore } from "../../store/useDashboardStore";
import { useGameStore } from "../../store/useGameStore";
import LogoHeader from "../LogoHeader";

export default function PlayerDashboard() {
  const navigate = useNavigate();
  const { userStats, fetchUserStats, error, loading } = useDashboardStore();
  const {
    findOpponentAndStartGame,
    searching,
    fetchActiveGames,
    activeGames,
    finding,
    errorFinding,
  } = useGameStore();

  useEffect(() => {
    fetchUserStats();
    fetchActiveGames();
  }, []);
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
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-10 bg-base-200 space-y-6">
      {/* Header */}
      <LogoHeader />
      {/* User Overview Section */}
      <section className="bg-base-100 rounded-2xl shadow-xl p-6 md:p-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-full bg-base-300 flex items-center justify-center">
            <User className="w-12 h-12 text-base-content/60" />
          </div>
          <span className="text-lg font-medium text-base-content">
            {userStats.username}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2 text-center md:text-left">
          <h2 className="text-xl font-bold text-primary">Welcome back!</h2>
          <p className="text-base-content/70">
            Total Score:{" "}
            <span className="font-semibold">{userStats.all_time_score}</span>
          </p>
          <p className="text-base-content/70">
            Level:{" "}
            <span className="font-semibold">
              {Math.floor(userStats.xp / 100 + 1)}
            </span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link to="/profile" className="btn btn-outline btn-sm">
            View Profile
          </Link>
          <Link to="/leaderboard" className="btn btn-warning btn-sm">
            Leaderboard
          </Link>
        </div>
      </section>
      {/* Action Cards Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8">
        {/* Start Game */}
        <div className="card bg-gradient-to-br from-green-800 via-success/10 to-green-800 border border-success shadow-lg hover:scale-[1.01] transition-transform">
          <div className="card-body">
            <h2 className="card-title text-success">Ready to Play?</h2>
            <p>Start a new quiz battle now!</p>
            <button
              onClick={() => {
                findOpponentAndStartGame(navigate);
              }}
              className="btn btn-success mt-4 self-start"
              disabled={searching}
            >
              {searching ? (
                <>
                  <span className="loading loading-spinner"></span> Searching...
                </>
              ) : (
                "Start Game"
              )}
            </button>
          </div>
        </div>

        {/* Submit Question */}
        <div className="card bg-gradient-to-br from-cyan-900 via-info/10 to-cyan-800 border border-info shadow-lg hover:scale-[1.01] transition-transform">
          <div className="card-body">
            <h2 className="card-title text-info">Contribute a Question</h2>
            <p>Submit your own quiz questions!</p>
            <Link to="/question" className="btn btn-info mt-4 self-start">
              Submit
            </Link>
          </div>
        </div>
      </section>
      {/* Active Games List */}
      <section className="max-w-4xl mx-auto mt-10 space-y-4">
        <h3 className="text-xl font-bold text-base-content">
          Your Active Games
        </h3>

        {finding ? (
          <div className="flex justify-center items-center min-h-[100px]">
            <span className="loading loading-spinner text-primary"></span>
          </div>
        ) : errorFinding ? (
          <div className="text-error text-sm bg-base-100 border border-error rounded-xl p-4 shadow">
            Failed to load active games: {errorFinding}
          </div>
        ) : activeGames.length === 0 ? (
          <p className="text-base-content/60">No active games at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGames.map((game) => {
              const opponent =
                game.player1_id === userStats.id
                  ? game.player2_username
                  : game.player1_username;

              return (
                <div
                  key={game.id}
                  className="border border-base-300 bg-base-100 rounded-xl p-5 shadow-lg flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-base-content text-lg">
                      Game #{game.id}
                    </h4>
                    <div className={`badge text-primary capitalize`}>
                      {game.game_status}
                    </div>
                  </div>

                  <div className="text-sm text-base-content/70">
                    <span className="font-medium">Opponent:</span> {opponent}
                  </div>

                  <button
                    className="btn btn-primary btn-sm self-end mt-2"
                    onClick={() => navigate(`/game/${game.id}`)}
                  >
                    Enter Game
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
