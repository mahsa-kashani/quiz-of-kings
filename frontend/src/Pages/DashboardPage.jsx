import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import Player from "../components/Dashboards/Player";
import Reviewer from "../components/Dashboards/Reviewer";
import Moderator from "../components/Dashboards/Moderator";
import Admin from "../components/Dashboards/Admin";
import { Navigate, Link } from "react-router-dom";

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) {
    // user not logged in or null
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <h2 className="text-2xl font-bold text-error">User not found!</h2>
          <p className="mt-6 text-base-content/70">
            Please log in to access your dashboard.
          </p>
          <Link to="/login" className="btn btn-primary mt-6">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (user.is_banned) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <h2 className="text-2xl font-bold text-error">Access Denied</h2>
          <p className="mt-2 text-base-content/70">
            Your account has been banned. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  // show dashboard based on role
  switch (user.user_role) {
    case "player":
      return <Player />;
    case "reviewer":
      return <Reviewer />;
    case "moderator":
      return <Moderator />;
    case "admin":
      return <Admin />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center text-center px-4">
          <h2 className="text-xl text-warning">Unknown role</h2>
        </div>
      );
  }
}
