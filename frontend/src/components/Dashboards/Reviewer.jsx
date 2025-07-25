import { useEffect, useState } from "react";
import { useQuestionStore } from "../../store/useQuestionStore";
import BackToPage from "../../components/BackToPage";
import { toast } from "react-hot-toast";

const TABS = ["pending", "approved", "rejected"];

export default function ReviewerDashboard({ page }) {
  const {
    reviewQuestions,
    fetchReviewQuestions,
    approveQuestion,
    rejectQuestion,
    loading,
    error,
  } = useQuestionStore();

  const [rejectionReasons, setRejectionReasons] = useState({});
  const [selectedTab, setSelectedTab] = useState("pending");

  useEffect(() => {
    fetchReviewQuestions();
  }, []);

  const handleReject = async (questionId) => {
    const reason = rejectionReasons[questionId];
    if (!reason?.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    await rejectQuestion(questionId, reason);
    toast.success("Question rejected");
    await fetchReviewQuestions();
  };

  const handleApprove = async (questionId) => {
    delete rejectionReasons[questionId];
    await approveQuestion(questionId);
    toast.success("Question approved");
    await fetchReviewQuestions();
  };

  const filteredQuestions =
    reviewQuestions?.filter((q) => q.approval_status === selectedTab) || [];
  return (
    <div className="min-h-screen bg-base-200 px-6 py-10">
      <BackToPage page={page} />
      <h2 className="text-4xl font-bold text-center text-info mb-8">
        Review Questions
      </h2>

      {/* Tabs */}
      <div role="tablist" className="tabs tabs-boxed justify-center mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            className={`tab ${selectedTab === tab ? "tab-active" : ""}`}
            onClick={() => setSelectedTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <span className="loading loading-spinner text-primary"></span>
        </div>
      ) : error ? (
        <div className="text-center text-error">{error}</div>
      ) : filteredQuestions.length === 0 ? (
        <p className="text-center text-base-content/70 text-xl">
          No {selectedTab} questions.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredQuestions.map((q) => {
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
                className="card bg-base-100 border border-base-content/10 shadow-sm"
              >
                <div className="card-body space-y-2">
                  <h3 className="text-lg font-semibold text-base-content">
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
                  <div className="space-y-2">
                    <p>
                      <strong>Category:</strong> {q.category_name}
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
                  </div>

                  {q.rejection_reason && (
                    <p className="text-sm text-error">
                      <strong>Previous Rejection Reason:</strong>{" "}
                      {q.rejection_reason}
                    </p>
                  )}

                  {q.approval_status !== "rejected" && (
                    <textarea
                      placeholder="Rejection reason (if rejecting)"
                      className="textarea textarea-bordered w-full mt-2"
                      value={rejectionReasons[q.id] || ""}
                      onChange={(e) =>
                        setRejectionReasons({
                          ...rejectionReasons,
                          [q.id]: e.target.value,
                        })
                      }
                    />
                  )}

                  <div className="flex gap-3 mt-3">
                    {q.approval_status !== "approved" && (
                      <button
                        className="btn btn-success"
                        onClick={() => handleApprove(q.id)}
                      >
                        Approve
                      </button>
                    )}

                    {q.approval_status !== "rejected" && (
                      <button
                        className="btn btn-error"
                        onClick={() => handleReject(q.id)}
                      >
                        Reject
                      </button>
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
