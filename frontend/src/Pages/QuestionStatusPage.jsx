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
      <h2 className="text-4xl font-bold text-center text-info mb-8">
        My Question Status
      </h2>

      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : error ? (
        <div className="min-h-screen flex flex-col items-center justify-center text-center bg-base-200 px-4">
          <h2 className="text-2xl font-bold text-error mb-2">Error</h2>
          <p className="text-base-content/70">{error}</p>
          <Link to="/" className="mt-4 btn btn-outline btn-error">
            Go Back Home
          </Link>
        </div>
      ) : userQuestions.length === 0 ? (
        <div className="flex justify-center items-center min-h-[30vh]">
          <p className="text-center text-base-content/70 text-xl">
            You haven’t submitted any questions yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {userQuestions.map((q) => (
            <div
              key={q.id}
              className="card border border-base-content/10 bg-base-100 shadow-sm"
            >
              <div className="card-body">
                <h3 className="font-semibold text-lg text-info">
                  {q.question_text}
                </h3>
                <ul className="list-disc ml-5 text-sm text-base-content/80">
                  <li>Option A: {q.option_a}</li>
                  <li>Option B: {q.option_b}</li>
                  <li>Option C: {q.option_c}</li>
                  <li>Option D: {q.option_d}</li>
                </ul>
                <p className="mt-2">
                  <span className="font-semibold">Correct Option:</span>{" "}
                  {q.correct_option}
                </p>
                <p>
                  <span className="font-semibold">Category:</span>{" "}
                  {q.category_name}
                </p>
                <p>
                  <span className="font-semibold">Difficulty:</span>{" "}
                  {q.difficulty}
                </p>
                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  <span
                    className={
                      q.status === "approved"
                        ? "text-success"
                        : q.status === "rejected"
                        ? "text-error"
                        : "text-warning"
                    }
                  >
                    {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                  </span>
                </p>
                {q.status === "rejected" && q.rejection_reason && (
                  <p className="text-sm text-error mt-1">
                    <span className="font-semibold">Reason:</span>{" "}
                    {q.rejection_reason}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
