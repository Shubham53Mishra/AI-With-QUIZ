'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Timer from '@/components/Timer';
import { getCurrentUser } from '@/lib/auth';

export default function QuizPage() {
  const [question, setQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [unlockTime, setUnlockTime] = useState(null);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
    fetchNextQuestion();
    // eslint-disable-next-line
  }, []);

  const fetchNextQuestion = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/questions/unlock');
      const data = await response.json();
      if (data.success && data.question) {
        setQuestion(data.question);
        setUnlockTime(data.nextUnlock);
        setSecondsLeft(0);
      } else if (data.secondsLeft > 0) {
        setQuestion(null);
        setSecondsLeft(data.secondsLeft);
        setUnlockTime(data.nextUnlock);
      } else {
        setQuestion(null);
        setError(data.message || 'No more questions');
      }
    } catch (err) {
      setError('Failed to load question');
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
        <Navbar user={user} />
        <div className="pt-40 md:pt-48 pb-10">
          <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-6 text-gray-600 text-lg font-semibold">Loading question...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <Navbar user={user} />
        <div className="pt-40 md:pt-48 pb-10">
          <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4 text-gray-900">{error}</h1>
              {secondsLeft > 0 && (
                <Timer secondsLeft={secondsLeft} onComplete={fetchNextQuestion} />
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Navbar user={user} />
      <div className="pt-40 md:pt-48 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {question ? (
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-100">
              <h2 className="text-3xl md:text-4xl font-bold mb-10 text-gray-900 leading-snug">
                {question.question}
              </h2>
              <div className="space-y-4 mb-10">
                {['A', 'B', 'C', 'D'].map((option) => (
                  <button
                    key={option}
                    className="w-full p-5 text-left rounded-xl border-2 transition transform hover:scale-102 border-gray-200 hover:border-blue-400 hover:bg-gray-50"
                    disabled
                  >
                    <div className="flex items-start gap-4">
                      <span className="font-bold text-lg flex-shrink-0 text-gray-400">
                        {option}.
                      </span>
                      <span className="text-base md:text-lg text-gray-800">
                        {question[`option${option}`]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              {secondsLeft > 0 && (
                <Timer secondsLeft={secondsLeft} onComplete={fetchNextQuestion} />
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-100 text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">No question available</h2>
              {secondsLeft > 0 && (
                <Timer secondsLeft={secondsLeft} onComplete={fetchNextQuestion} />
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
