import { useEffect } from "react";
import { useQuestionStore } from "../store/useQuestionStore";
import BackToPage from "../components/BackToPage";

export default function QuestionStatusPage() {
  const { userQuestions, fetchUserQuestions, loading, error } =
    useQuestionStore();

  useEffect(() => {
    fetchUserQuestions();
  }, []);

  return (
    <div className="min-h-screen px-6 py-10 bg-base-200">
      <BackToPage page="question" />
      <h2 className="text-4xl font-bold text-center text-info mb-12">
        My Question Status
      </h2>

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <span className="loading loading-spinner text-primary"></span>
        </div>
      ) : error ? (
        <div className="text-center text-error">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      ) : userQuestions?.length === 0 ? (
        <div className="text-center text-base-content/70 text-xl">
          You haven’t submitted any questions yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userQuestions.map((q) => {
            const statusColor =
              q.approval_status === "approved"
                ? "success"
                : q.approval_status === "rejected"
                ? "error"
                : "warning";

            const difficultyColor =
              q.difficulty === "easy"
                ? "text-success"
                : q.difficulty === "hard"
                ? "text-error"
                : "text-warning";

            const statusIcon =
              q.approval_status === "approved"
                ? "✔️"
                : q.approval_status === "rejected"
                ? "❌"
                : "⏳";

            return (
              <div
                key={q.id}
                className="card bg-base-100 border border-base-300 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <div className="card-body space-y-5">
                  <h3 className="font-bold text-xl text-info">
                    {q.question_text}
                  </h3>

                  <ul className="text-base space-y-2">
                    {q.options.map((opt, idx) => {
                      const isCorrect = q.correct_option === opt.id;
                      return (
                        <li
                          key={idx}
                          className={`pl-2 border-l-4 ${
                            isCorrect
                              ? "border-success font-semibold text-success"
                              : "border-transparent"
                          }`}
                        >
                          Option {String.fromCharCode(65 + idx)}:{" "}
                          {opt.option_text}
                        </li>
                      );
                    })}
                  </ul>

                  <div className="text-base text-base-content/80 space-y-2">
                    <p>
                      <span className="font-semibold">Category:</span>{" "}
                      {q.category_name}
                    </p>
                    <p>
                      <span className="font-semibold">Difficulty:</span>{" "}
                      <span className={`${difficultyColor} capitalize`}>
                        {q.difficulty}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      <span className={`badge text-${statusColor}`}>
                        {statusIcon} {q.approval_status}
                      </span>
                    </p>
                    {q.approval_status === "rejected" && q.rejection_reason && (
                      <p className="text-error text-sm mt-1">
                        <span className="font-semibold">Reason:</span>{" "}
                        {q.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
