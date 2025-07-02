import { useDashboardStore } from "../store/useDashboardStore";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function LeaderboardTabs() {
  const {
    fetchGlobalLeaderboard,
    fetchWeeklyLeaderboard,
    fetchMonthlyLeaderboard,
    globalLeaderboard,
    weeklyLeaderboard,
    monthlyLeaderboard,
    playerStats,
  } = useDashboardStore();

  const [selectedTab, setSelectedTab] = useState("global");

  useEffect(() => {
    fetchGlobalLeaderboard();
    fetchWeeklyLeaderboard();
    fetchMonthlyLeaderboard();
  }, []);

  const leaderboards = {
    global: globalLeaderboard,
    weekly: weeklyLeaderboard,
    monthly: monthlyLeaderboard,
  };

  return (
    <div className="min-h-screen px-6 py-8 bg-base-200 space-y-6">
      <Link to="/dashboard" className="btn btn-sm btn-outline">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

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
                  user.user_id === playerStats.id
                    ? "bg-primary/20 font-semibold"
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
