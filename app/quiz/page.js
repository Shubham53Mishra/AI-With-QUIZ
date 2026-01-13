'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/questions');
      const data = await response.json();

      if (data.success) {
        setQuestions(data.questions);
        if (data.questions.length === 0) {
          alert('No questions available. Please upload questions from the admin panel.');
        }
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      alert('Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerClick = (answer) => {
    const newUserAnswers = { ...userAnswers, [currentQuestion]: answer };
    setUserAnswers(newUserAnswers);

    const question = questions[currentQuestion];
    if (answer === question.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setUserAnswers({});
  };

  if (isLoading) {
    return (
      <main>
        <Navbar />
        <div className="pt-20 pb-10">
          <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading questions...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main>
        <Navbar />
        <div className="pt-20 pb-10">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h1 className="text-3xl font-bold mb-4">No Questions Available</h1>
              <p className="text-gray-600 mb-6">
                Please ask your admin to upload questions from the Admin Panel.
              </p>
              <a
                href="/"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Go Back to Home
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="container mx-auto px-4 max-w-2xl">
          {showScore ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h1 className="text-4xl font-bold mb-6">Quiz Complete!</h1>
              <div className="mb-8">
                <p className="text-6xl font-bold text-blue-600 mb-2">
                  {score} / {questions.length}
                </p>
                <p className="text-gray-600 text-lg">
                  You scored {Math.round((score / questions.length) * 100)}%
                </p>
              </div>

              <div className="space-y-4 mb-8 text-left bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Review Answers</h2>
                {questions.map((q, idx) => (
                  <div key={idx} className="border-b pb-4 last:border-b-0">
                    <p className="font-semibold text-sm mb-2">
                      Q{idx + 1}: {q.question}
                    </p>
                    <div className="text-sm space-y-1">
                      <p>
                        Your answer:{' '}
                        <span
                          className={
                            userAnswers[idx] === q.correctAnswer
                              ? 'text-green-600 font-semibold'
                              : 'text-red-600 font-semibold'
                          }
                        >
                          {userAnswers[idx] || 'Not answered'}
                        </span>
                      </p>
                      {userAnswers[idx] !== q.correctAnswer && (
                        <p>
                          Correct answer:{' '}
                          <span className="text-green-600 font-semibold">{q.correctAnswer}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleRestart}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Retake Quiz
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-600">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <span className="text-sm font-semibold text-gray-600">
                    Score: {score}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-8">
                {questions[currentQuestion].question}
              </h2>

              <div className="space-y-3 mb-8">
                {['A', 'B', 'C', 'D'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswerClick(option)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition ${
                      userAnswers[currentQuestion] === option
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    <span className="font-semibold">{option}.</span>{' '}
                    {questions[currentQuestion][`option${option}`]}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 justify-between">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                  className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  ← Previous
                </button>

                <div className="text-sm text-gray-600">
                  {userAnswers[currentQuestion] ? (
                    <span className="text-green-600 font-semibold">✓ Answered</span>
                  ) : (
                    <span className="text-orange-600 font-semibold">Not answered</span>
                  )}
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
                >
                  {currentQuestion === questions.length - 1 ? 'Finish' : 'Next →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
