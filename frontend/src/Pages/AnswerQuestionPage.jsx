import { useParams, useNavigate } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AnswerQuestionPage() {
  const { gameId, roundId } = useParams();
  const navigate = useNavigate();
  const { rounds, fetchRounds, sendAnswers, loading, error } = useGameStore();

  useEffect(() => {
    fetchRounds(gameId);
  }, [gameId]);

  const round = rounds.find((r) => r.id === Number(roundId));

  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime, setStartTime] = useState(null);
  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const handleAnswer = (optionId) => {
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    const myAnswer = {
      selected_option_id: optionId,
      time_taken: timeTaken / 1000,
    };
    setSelectedOptionId(optionId);
    setIsAnswered(true);
    sendAnswers(gameId, round.id, myAnswer);

    setTimeout(() => {
      navigate(`/game/${gameId}`);
    }, 2000);
  };

  if (!round) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-base-200 px-4">
        <h2 className="text-2xl font-bold text-error mb-2">Error</h2>
        <p className="text-base-content/70">{error}</p>
        <Link to="/" className="mt-4 btn btn-outline btn-error">
          Go Back Home
        </Link>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-base-200 p-6 flex flex-col gap-6 items-center">
      <h1 className="text-3xl font-bold text-primary mt-10 mb-5">
        Round {round.round_number}
      </h1>

      <div className="bg-base-100 p-6 rounded-2xl shadow-xl w-full max-w-2xl space-y-6">
        <p className="text-lg md:text-xl font-semibold text-center text-base-content leading-relaxed mb-8">
          {round.question.question_text}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {round.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isCorrect = opt.id === round.question.correct_option_id;

            let btnClass =
              "btn w-full py-3 text-base md:text-lg transition-transform duration-150 ease-in-out btn btn-accent btn-outline hover:scale-105";

            if (isAnswered) {
              if (isSelected && isCorrect) {
                btnClass =
                  "btn btn-success disabled:border-success disabled:text-white";
              } else if (isSelected && !isCorrect) {
                btnClass =
                  "btn btn-error disabled:border-error disabled:text-white";
              } else if (!isSelected && isCorrect) {
                btnClass =
                  "btn btn-success disabled:border-success disabled:text-white";
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleAnswer(opt.id)}
                className={btnClass}
                disabled={isAnswered}
              >
                {opt.option_text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
