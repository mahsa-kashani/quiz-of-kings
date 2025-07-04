import { useParams, useNavigate } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AnswerQuestionPage() {
  const { gameId, roundId } = useParams();
  const navigate = useNavigate();
  const { rounds, fetchRounds, sendAnswers } = useGameStore();
  const alreadyAnswered = round?.answers?.some((ans) => ans.player_id === myId);
  useEffect(() => {
    fetchRounds(gameId);
  }, [gameId]);

  const round = rounds.find((r) => r.id === Number(roundId));
  const myId = Number(JSON.parse(localStorage.getItem("user")).id);

  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const handleAnswer = (optionId) => {
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    const myAnswer = {
      player_id: myId,
      selected_option_id: optionId,
      time_taken: timeTaken / 1000,
    };
    setSelectedOptionId(optionId);
    sendAnswers(round.id, myAnswer);
    toast.success("Answer submitted!");

    setTimeout(() => {
      navigate(`/game/${gameId}`);
    }, 1000);
  };

  if (!round) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-center text-primary">
        Round {round.round_number}
      </h1>
      <div className="bg-base-100 p-6 rounded-xl shadow space-y-4">
        <p className="text-lg font-semibold text-center text-base-content">
          {round.question.question_text}
        </p>

        <div className="grid grid-cols-2 gap-4">
          {round.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isAnswered = alreadyAnswered;
            const isCorrect = opt.id === round.question.correct_option_id;
            let btnClass = "btn btn-accent btn-outline";

            if (isAnswered) {
              if (isSelected && isCorrect) {
                btnClass = "btn btn-success"; // correct answered
              } else if (isSelected && !isCorrect) {
                btnClass = "btn btn-error"; // wrong answered
              } else if (!isSelected && isCorrect) {
                btnClass = "btn btn-success btn-outline"; // correct option
              }
            } else if (isSelected) {
              btnClass = "btn btn-accent btn-success"; // selecting
            }
            return (
              <button
                key={opt.id}
                onClick={() => handleAnswer(opt.id)}
                disabled={isAnswered}
                className={btnClass}
              >
                {opt.option_text}
              </button>
            );
          })}
        </div>

        {alreadyAnswered && (
          <p className="text-sm text-center text-success mt-4">
            You have answered this round.
          </p>
        )}
      </div>
    </div>
  );
}
