import { Crown } from "lucide-react";
import { Link } from "react-router-dom";

export default function LogoHeader() {
  return (
    <div
      className="w-full px-6 py-4 flex items-center justify-center border-b border-base-300 md:mb-2 lg:mb-12
"
    >
      <Link
        to="/"
        className="flex items-center gap-2 text-4xl font-bold leading-snug"
      >
        <Crown className="w-10 h-10 text-primary" />
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Quiz of Kings
        </span>
      </Link>
    </div>
  );
}
