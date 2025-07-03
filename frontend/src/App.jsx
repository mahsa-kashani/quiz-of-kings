import { Routes, Route } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import SignupPage from "./Pages/SignupPage";
import LoginPage from "./Pages/LoginPage";
import DashboardPage from "./Pages/DashboardPage";
import { Toaster } from "react-hot-toast";
import PlayerProfileStats from "./Pages/PlayerProfileStats";
import LeaderboardTabs from "./Pages/LeaderboardTabs";
import QuestionPanel from "./Pages/QuestionPanel";
import SubmitQuestionPage from "./Pages/SubmitQuestionPage";
import QuestionStatusPage from "./Pages/QuestionStatusPage";

function App() {
  return (
    <div
      className="min-h-screen bg-base-200 transition-colors duration-300"
      data-theme="forest"
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<PlayerProfileStats />} />
        <Route path="/leaderboard" element={<LeaderboardTabs />} />
        <Route path="/question" element={<QuestionPanel />} />
        <Route path="/question/new" element={<SubmitQuestionPage />} />
        <Route path="/question/status" element={<QuestionStatusPage />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
