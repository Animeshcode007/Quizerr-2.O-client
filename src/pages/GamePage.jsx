import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { usePlayer } from "../contexts/PlayerContext";
import { motion, AnimatePresence } from "framer-motion";

const GamePage = () => {
  const { lobbyId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { playerName } = usePlayer();

  const [gameState, setGameState] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [players, setPlayers] = useState([]);
  const [myAnswer, setMyAnswer] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [isRoundOver, setIsRoundOver] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!playerName || !lobbyId) {
      navigate("/");
      return;
    }
    if (!socket.connected) socket.connect();

    console.log(
      `GamePage mounted for lobby: ${lobbyId}, player: ${playerName}`
    );
    setIsLoading(true);

    const handleNewQuestion = (data) => {
      console.log("New Question Received:", data);
      setIsLoading(false);
      setCurrentQuestion(data.question);
      setQuestionNumber(data.questionNumber);
      setTotalQuestions(data.totalQuestions);
      setTimeLeft(data.timeLimit);
      setPlayers(data.players || players);
      setMyAnswer(null);
      setAnswerResult(null);
      setIsRoundOver(false);
    };

    const handleScoreUpdate = (updatedPlayers) => {
      console.log("Score Update Received:", updatedPlayers);
      setPlayers(updatedPlayers);
    };

    const handleAnswerFeedback = (feedback) => {
      console.log("Answer Feedback Received:", feedback);
      console.log(
        "GamePage: handleAnswerFeedback received:",
        JSON.stringify(feedback)
      );
      setAnswerResult({
        myChoiceCorrect: feedback.correct,
        actualCorrectIndex: feedback.correctAnswerIndex,
        scoreEarned: feedback.scoreEarned,
      });
      setIsRoundOver(true);
    };

    const handleRoundEnd = (data) => {
      console.log("Round End Received:", data);
      setIsRoundOver(true);
      if (data.correctAnswerIndex !== undefined && !answerResult) {
        setAnswerResult({
          correct: myAnswer === data.correctAnswerIndex,
          correctAnswerIndex: data.correctAnswerIndex,
        });
      }
    };

    const handleGameOver = (data) => {
      console.log("Game Over Received:", data);
      alert(
        `Game Over! Final Scores:\n${data.players
          .map((p) => `${p.name}: ${p.score}`)
          .join("\n")}`
      );
      navigate("/lobbies");
    };

    const handleGameError = (data) => {
      console.error("Game Error:", data.message);
      setError(data.message);
      setTimeout(() => navigate("/lobbies"), 3000);
    };

    socket.on("newQuestion", handleNewQuestion);
    socket.on("scoreUpdate", handleScoreUpdate);
    socket.on("answerFeedback", handleAnswerFeedback);
    socket.on("roundEnd", handleRoundEnd);
    socket.on("gameOver", handleGameOver);
    socket.on("gameError", handleGameError);
    const loadingTimeout = setTimeout(() => {
      if (isLoading && !currentQuestion) {
        console.warn(
          "GamePage: Still loading after timeout, no question received."
        );
      }
    }, 5000);

    return () => {
      console.log(`GamePage unmounting for lobby: ${lobbyId}`);
      socket.off("newQuestion", handleNewQuestion);
      socket.off("scoreUpdate", handleScoreUpdate);
      socket.off("answerFeedback", handleAnswerFeedback);
      socket.off("roundEnd", handleRoundEnd);
      socket.off("gameOver", handleGameOver);
      socket.off("gameError", handleGameError);
      clearTimeout(loadingTimeout);
    };
  }, [socket, lobbyId, playerName, navigate]);
  useEffect(() => {
    if (timeLeft > 0 && !isRoundOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isRoundOver && currentQuestion) {
      console.log("Client timer reached zero.");
    }
  }, [timeLeft, isRoundOver, currentQuestion]);

  const handleSubmitAnswer = (answerIndex) => {
    if (myAnswer !== null || isRoundOver || !currentQuestion) return;

    setMyAnswer(answerIndex);
    socket.emit(
      "submitAnswer",
      {
        lobbyId,
        questionId: currentQuestion._id,
        answerIndex,
      },
      (response) => {
        if (response?.success) {
          console.log("Answer submitted successfully.");
        } else {
          console.error("Failed to submit answer:", response?.message);
          setMyAnswer(null);
          alert(response?.message || "Couldn't submit your answer.");
        }
      }
    );
  };

  if (isLoading && !error) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-8 bg-gradient-primary text-brand-text-light">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-green-bright mb-4"></div>
        <p className="text-xl font-semibold">Loading Game...</p>
        <p className="text-sm text-gray-400">Waiting for the first question!</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-8 bg-gradient-primary text-brand-text-light">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Game Error!</h2>
        <p className="text-lg mb-6">{error}</p>
        <button
          onClick={() => navigate("/lobbies")}
          className="px-6 py-2 bg-brand-green-bright text-white rounded-lg"
        >
          Back to Lobbies
        </button>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-8 bg-gradient-primary text-brand-text-light">
        <h2 className="text-2xl font-bold mb-4">
          Waiting for Game to Start...
        </h2>
        <p className="text-lg">
          If the game has started, there might be a connection issue.
        </p>
      </div>
    );
  }
  return (
    <div className="flex-grow flex flex-col p-4 md:p-6 lg:p-8 bg-gradient-primary text-brand-text-light overflow-hidden">
      <header className="mb-4 md:mb-6 flex justify-between items-center">
        <div className="text-lg md:text-xl font-semibold bg-white/10 px-4 py-2 rounded-lg">
          Question: {questionNumber} / {totalQuestions}
        </div>
        <div
          className={`text-2xl md:text-3xl font-bold px-4 py-2 rounded-lg ${
            timeLeft <= 5 && timeLeft > 0
              ? "text-red-400 animate-pulse"
              : "text-brand-green-bright"
          } bg-white/10`}
        >
          Time: {timeLeft}s
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center mb-4 md:mb-6">
        <motion.div
          key={currentQuestion._id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl bg-white/5 p-6 md:p-8 rounded-xl shadow-2xl text-center"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-6 md:mb-8 leading-tight">
            {currentQuestion.text}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleSubmitAnswer(index)}
                disabled={myAnswer !== null || isRoundOver}
                className={`w-full p-3 md:p-4 text-left rounded-lg text-base md:text-lg font-medium transition-all duration-200 ease-in-out transform hover:scale-105
                                    ${
                                      myAnswer === null && !isRoundOver
                                        ? "bg-blue-500 hover:bg-blue-600"
                                        : ""
                                    }
                                    ${
                                      (isRoundOver || myAnswer !== null) &&
                                      index === answerResult?.correctAnswerIndex
                                        ? "bg-green-600 !text-white border-2 border-green-300 scale-105 ring-4 ring-green-500/50"
                                        : ""
                                    }
                                    ${
                                      (isRoundOver || myAnswer !== null) &&
                                      myAnswer === index &&
                                      index !== answerResult?.correctAnswerIndex
                                        ? "bg-red-600 !text-white border-2 border-red-300"
                                        : ""
                                    }
                                    ${
                                      (isRoundOver || myAnswer !== null) &&
                                      myAnswer !== index &&
                                      index !== answerResult?.correctAnswerIndex
                                        ? "bg-gray-600/70 opacity-70"
                                        : ""
                                    }
                                    ${
                                      myAnswer === null && isRoundOver
                                        ? "bg-gray-600/70 opacity-70"
                                        : ""
                                    }
                                `}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <span className="mr-2 font-bold">
                  {String.fromCharCode(65 + index)}.
                </span>{" "}
                {option}
              </motion.button>
            ))}
          </div>
          <AnimatePresence>
            {isRoundOver &&
              answerResult &&
              answerResult.actualCorrectIndex !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 text-lg font-semibold"
                >
                  {answerResult.correct ? (
                    <p className="text-green-400">Correct! Well done!</p>
                  ) : (
                    <p className="text-red-400">
                      Oops! The correct answer was{" "}
                      {String.fromCharCode(
                        65 + answerResult.correctAnswerIndex
                      )}
                      .
                    </p>
                  )}
                </motion.div>
              )}
          </AnimatePresence>
        </motion.div>
      </main>
      <footer className="mt-auto">
        <div className="bg-white/5 p-3 md:p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2 text-center md:text-left">
            Scoreboard
          </h3>
          <div className="flex flex-wrap gap-2 md:gap-4 justify-center md:justify-start">
            {players
              .sort((a, b) => b.score - a.score)
              .map((player) => (
                <motion.div
                  key={player.id}
                  layout
                  className={`px-3 py-1.5 rounded-md text-sm md:text-base ${
                    player.id === socket.id
                      ? "bg-brand-green-bright text-white font-bold ring-2 ring-white/80"
                      : "bg-white/10"
                  }`}
                >
                  {player.name}: {player.score}
                </motion.div>
              ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GamePage;
