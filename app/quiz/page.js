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
  const [skippedQuestions, setSkippedQuestions] = useState(new Set());

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
    setSkippedQuestions(new Set());
  };

  const handleSkipQuestion = () => {
    setSkippedQuestions(new Set([...skippedQuestions, currentQuestion]));
    handleNextQuestion();
  };

  if (isLoading) {
    return (
      <main>
        <Navbar />
        <div className="pt-40 md:pt-48 pb-10">
          <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-6 text-gray-600 text-lg font-semibold">Loading questions...</p>
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
        <div className="pt-40 md:pt-48 pb-10">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-xl p-12 text-center border border-blue-100">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">No Questions Available</h1>
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
      <div className="pt-40 md:pt-48 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {showScore ? (
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-2xl p-12 text-center border border-blue-100">
              <div className="mb-8">
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-4">Quiz Complete! 🎉</h1>
              </div>
              
              <div className="mb-12 bg-white rounded-xl p-8 shadow-md border-2 border-blue-200">
                <p className="text-7xl md:text-8xl font-bold text-blue-600 mb-4">
                  {score}
                </p>
                <p className="text-2xl text-gray-700 mb-2">out of {questions.length}</p>
                <p className="text-xl md:text-2xl font-semibold text-transparent bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text">
                  {Math.round((score / questions.length) * 100)}% Score
                </p>
              </div>

              <div className="space-y-4 mb-12 text-left bg-white p-8 rounded-xl shadow-md border border-gray-200 max-h-96 overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Answer Review</h2>
                {questions.map((q, idx) => {
                  const isSkipped = skippedQuestions.has(idx);
                  const isCorrect = userAnswers[idx] === q.correctAnswer;
                  
                  return (
                    <div key={idx} className={`rounded-lg p-4 border-l-4 ${
                      isSkipped 
                        ? 'bg-yellow-50 border-l-yellow-400' 
                        : isCorrect 
                        ? 'bg-green-50 border-l-green-500' 
                        : 'bg-red-50 border-l-red-500'
                    }`}>
                      <p className="font-bold text-gray-900 mb-2">
                        Q{idx + 1}: {q.question}
                        {isSkipped && <span className="text-yellow-600 ml-2 font-bold text-sm">[SKIPPED]</span>}
                      </p>
                      <div className="text-sm space-y-1 text-gray-700">
                        <p>
                          Your answer:{' '}
                          <span
                            className={
                              isSkipped 
                                ? 'text-yellow-600 font-bold'
                                : isCorrect
                                ? 'text-green-600 font-bold'
                                : 'text-red-600 font-bold'
                            }
                          >
                            {userAnswers[idx] || 'Not answered'}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p>
                            Correct answer:{' '}
                            <span className="text-green-600 font-bold">{q.correctAnswer}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleRestart}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:shadow-lg transition font-bold text-lg transform hover:scale-105"
              >
                🔄 Retake Quiz
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-100">
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                  <span className="text-base font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                    Question {currentQuestion + 1} / {questions.length}
                  </span>
                  <span className="text-base font-bold text-green-600 bg-green-50 px-4 py-2 rounded-full">
                    Score: {score}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-700 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-10 text-gray-900 leading-snug">
                {questions[currentQuestion].question}
              </h2>

              <div className="space-y-4 mb-10">
                {['A', 'B', 'C', 'D'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswerClick(option)}
                    className={`w-full p-5 text-left rounded-xl border-2 transition transform hover:scale-102 ${
                      userAnswers[currentQuestion] === option
                        ? 'border-blue-600 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className={`font-bold text-lg flex-shrink-0 ${
                        userAnswers[currentQuestion] === option ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {option}.
                      </span>
                      <span className="text-base md:text-lg text-gray-800">
                        {questions[currentQuestion][`option${option}`]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                  className="px-6 py-3 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed font-bold flex-1 sm:flex-none"
                >
                  ← Previous
                </button>

                <button
                  onClick={handleSkipQuestion}
                  className="px-6 py-3 rounded-lg border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 transition font-bold flex-1 sm:flex-none"
                >
                  ⊘ Skip
                </button>

                <div className={`py-3 px-4 rounded-lg font-bold text-center flex-1 sm:flex-none ${
                  skippedQuestions.has(currentQuestion) 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : userAnswers[currentQuestion] 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {skippedQuestions.has(currentQuestion) ? '⊘ Skipped' : userAnswers[currentQuestion] ? '✓ Answered' : '❌ Not answered'}
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition disabled:opacity-40 font-bold flex-1 sm:flex-none transform hover:scale-105"
                >
                  {currentQuestion === questions.length - 1 ? 'Finish ✓' : 'Next →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
