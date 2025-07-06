import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/useUserStore";
import { useQuestionStore } from "../../store/useQuestionStore";
import {
  UserCheck,
  ShieldCheck,
  BarChart3,
  MessageCircleMore,
} from "lucide-react";
import BackToPage from "../../components/BackToPage";

export default function Admin() {
  const navigate = useNavigate();
  const { fetchUsers } = useUserStore();
  const { fetchReviewQuestions } = useQuestionStore();

  useEffect(() => {
    fetchUsers();
    fetchReviewQuestions();
  }, []);

  const cards = [
    {
      title: "User Management",
      description: "Ban/unban and manage users",
      icon: <UserCheck className="w-6 h-6" />,
      action: () => navigate("/admin/users"),
    },
    {
      title: "Question Moderation",
      description: "Review all questions in system",
      icon: <ShieldCheck className="w-6 h-6" />,
      action: () => navigate("/admin/questions"),
    },
    {
      title: "Leaderboard & Stats",
      description: "Check scores, XP, and rankings",
      icon: <BarChart3 className="w-6 h-6" />,
      action: () => navigate("/leaderboard"),
    },
    {
      title: "Chat Logs",
      description: "View user chat history",
      icon: <MessageCircleMore className="w-6 h-6" />,
      action: () => navigate("/admin/chats"),
    },
  ];

  return (
    <div className="min-h-screen bg-base-200 px-6 py-10">
      <BackToPage page="home" />
      <h2 className="text-4xl font-bold text-center text-primary mb-10">
        Admin Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="card bg-base-100 border border-base-content/10 shadow-md hover:shadow-lg hover:scale-[1.01] transition-transform cursor-pointer"
            onClick={card.action}
          >
            <div className="card-body">
              <div className="flex items-center gap-3 mb-2 text-primary">
                {card.icon}
                <h3 className="text-xl font-semibold">{card.title}</h3>
              </div>
              <p className="text-base-content/70">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
