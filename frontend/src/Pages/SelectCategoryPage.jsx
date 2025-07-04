import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";
import toast from "react-hot-toast";
import { useQuestionStore } from "../store/useQuestionStore";

export default function SelectCategoryPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { categories, fetchCategories } = useQuestionStore();
  const { rounds, loading, submitCategoryAndStartRound } = useGameStore();

  const [usedCategories, setUsedCategories] = useState([]);

  useEffect(() => {
    fetchCategories();

    // extract used categories from current game rounds
    if (rounds) {
      const used = rounds.map((r) => r.category).filter(Boolean);
      setUsedCategories(used);
    }
  }, [rounds]);

  const availableCategories = categories.filter(
    (c) => !usedCategories.includes(c.category_name)
  );

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-xl mx-auto bg-base-100 p-6 rounded-xl shadow-lg mt-10">
        <h1 className="text-2xl font-bold text-center mb-16 text-primary">
          Select a Category for This Round
        </h1>
        {availableCategories.length === 0 ? (
          <p className="text-center text-base-content/70">
            No categories available. All categories have been used.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  submitCategoryAndStartRound(cat, navigate, gameId)
                }
                className="btn btn-outline btn-primary"
                disabled={loading}
              >
                {cat.category_name}
              </button>
            ))}
          </div>
        )}
        {loading && (
          <div className="mt-4 text-center">
            <span className="loading loading-spinner text-primary"></span>
          </div>
        )}
      </div>
    </div>
  );
}
