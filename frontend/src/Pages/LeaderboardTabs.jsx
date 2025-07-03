import { useDashboardStore } from "../store/useDashboardStore";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BackToPage from "../components/BackToPage";

export default function LeaderboardTabs() {
  const {
    fetchGlobalLeaderboard,
    fetchWeeklyLeaderboard,
    fetchMonthlyLeaderboard,
    globalLeaderboard,
    weeklyLeaderboard,
    monthlyLeaderboard,
    userStats,
    error,
    loading,
  } = useDashboardStore();

  const [selectedTab, setSelectedTab] = useState("global");

  useEffect(() => {
    fetchGlobalLeaderboard();
    fetchWeeklyLeaderboard();
    fetchMonthlyLeaderboard();
  }, [fetchGlobalLeaderboard, fetchWeeklyLeaderboard, fetchMonthlyLeaderboard]);

  const leaderboards = {
    global: globalLeaderboard,
    weekly: weeklyLeaderboard,
    monthly: monthlyLeaderboard,
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
    <div className="min-h-screen px-6 py-8 bg-base-200 space-y-6">
      <BackToPage page={"dashboard"} />

      <div className="text-center space-y-1">
        <h2 className="text-3xl font-bold text-warning">Leaderboard</h2>
      </div>

      <div className="tabs tabs-boxed justify-center">
        {["global", "weekly", "monthly"].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedTab(type)}
            className={`tab ${selectedTab === type ? "tab-active" : ""}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full bg-base-100 shadow">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboards[selectedTab]?.map((user, index) => (
              <tr
                key={user.user_id}
                className={
                  user.user_id === userStats.id
                    ? "bg-primary/20 font-semibold text-primary"
                    : ""
                }
              >
                <td>{index + 1}</td>
                <td>{user.username}</td>
                <td>{user.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
