import { useDashboardStore } from "../store/useDashboardStore";
import { useEffect } from "react";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import BackToDashboard from "../components/BackToDashboard";

export default function PlayerProfileStats() {
  const { userStats, fetchUserStats, loading, error } = useDashboardStore();

  useEffect(() => {
    fetchUserStats();
  }, []);

  const level = Math.floor(userStats.xp / 100 + 1);
  const gamesLost =
    userStats.games_played - userStats.games_won - userStats.games_tied;

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
    <div className="min-h-screen px-6 py-8 bg-base-200 space-y-6">
      <BackToDashboard />

      <div className="text-center space-y-1">
        <h2 className="text-3xl font-bold text-primary">Player Profile</h2>
        <p className="text-base-content/70 text-2xl">{userStats.username}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title text-info">Overview</h3>
            <p>Total Games: {userStats.games_played}</p>
            <p>Correct Answers: {userStats.correct_answers}</p>
            <p>Average Accuracy: {userStats.average_accuracy}%</p>
            <p>XP: {userStats.xp}</p>
            <p>Level: {level}</p>
            <p>Global Rank: #{userStats.global_rank || "?"}</p>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title text-secondary">Game Results</h3>
            <div className="w-full flex justify-center gap-10 pt-10">
              {/* Fake PieChart — Replace with actual chart library if desired */}
              <div
                className="radial-progress text-success"
                style={{
                  "--value":
                    (userStats.games_won / userStats.games_played) * 100 || 0,
                }}
              >
                Wins
              </div>
              <div
                className="radial-progress text-warning"
                style={{
                  "--value":
                    (userStats.games_tied / userStats.games_played) * 100 || 0,
                }}
              >
                Draws
              </div>
              <div
                className="radial-progress text-error"
                style={{
                  "--value":
                    (userStats.gamesLost / userStats.games_played) * 100 || 0,
                }}
              >
                Losses
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
