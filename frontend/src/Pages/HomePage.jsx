import React from "react";
import { Link } from "react-router-dom";
import { Crown, Sparkles } from "lucide-react";

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="navbar bg-base-100 shadow-md px-6">
        <div className="flex-1">
          <div className="text-xl font-bold flex items-center gap-2">
            <Crown className="w-6 h-6 text-primary" />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Quiz of Kings
            </span>
          </div>
        </div>
        <div className="flex-none space-x-2">
          <Link to="/login">
            <button className="btn btn-ghost btn-sm">Login</button>
          </Link>
          <Link to="/signup">
            <button className="btn btn-primary btn-sm">Sign Up</button>
          </Link>
        </div>
      </nav>

      {/* Main Page Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 md:py-32 space-y-8">
        <div className="text-primary">
          <Crown className="w-28 h-28" />
        </div>

        <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent pb-3">
          Quiz of Kings
        </h1>

        <p className="text-base-content/70 text-xl md:text-2xl">
          The Ultimate Knowledge Battle Begins!
        </p>

        <Sparkles className="text-warning w-10 h-10 animate-bounce" />
      </div>
    </div>
  );
}

export default HomePage;
