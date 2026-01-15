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
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    getCurrentUser().then(setUser);
    fetchNextQuestion();
    // eslint-disable-next-line
  }, []);

  const fetchNextQuestion = async () => {
    setIsLoading(true);
    setError('');
    setSelectedAnswer(null);
    setAnswered(false);
    try {
      const response = await fetch('/api/questions/unlock');
      const data = await response.json();
      console.log('Question unlock response:', data);
      
      if (data.success && data.question) {
        setQuestion(data.question);
        setUnlockTime(data.nextUnlock);
        setSecondsLeft(0);
      } else if (data.secondsLeft > 0) {
        // User has to wait for next question
        setQuestion(null);
        setSecondsLeft(data.secondsLeft);
        setUnlockTime(data.nextUnlock);
      } else {
        // No questions available
        setQuestion(null);
        setError(data.message || 'No more questions');
      }
    } catch (err) {
      console.error('Error fetching question:', err);
      setError('Failed to load question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return;
    
    setAnswered(true);
    
    // After a short delay, fetch the next question
    setTimeout(() => {
      fetchNextQuestion();
    }, 1500);
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
                <>
                  <p className="text-lg text-gray-600 mb-6">Next question will unlock in:</p>
                  <Timer secondsLeft={secondsLeft} onComplete={fetchNextQuestion} />
                </>
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
                    onClick={() => !answered && setSelectedAnswer(option)}
                    className={`w-full p-5 text-left rounded-xl border-2 transition transform ${
                      answered
                        ? selectedAnswer === option
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-gray-50 border-gray-200'
                        : selectedAnswer === option
                        ? 'bg-blue-50 border-blue-500 hover:scale-102'
                        : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50 hover:scale-102'
                    }`}
                    disabled={answered}
                  >
                    <div className="flex items-start gap-4">
                      <span className="font-bold text-lg flex-shrink-0 text-gray-700">
                        {option}.
                      </span>
                      <span className="text-base md:text-lg text-gray-800">
                        {question[`option${option}`]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer || answered}
                className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition ${
                  !selectedAnswer || answered
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                }`}
              >
                {answered ? 'Loading next question...' : 'Submit Answer'}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-100 text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">No question available</h2>
              {secondsLeft > 0 && (
                <>
                  <p className="text-lg text-gray-600 mb-6">Next question will unlock in:</p>
                  <Timer secondsLeft={secondsLeft} onComplete={fetchNextQuestion} />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
