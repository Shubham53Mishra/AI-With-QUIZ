'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import AdminSidebar from '../../../components/AdminSidebar';
import { useRouter } from 'next/navigation';

export default function UploadedQuestionsPage() {
  const [uploadedQuestions, setUploadedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchUploadedQuestions();
  }, []);

  const fetchUploadedQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/questions');
      if (!response.ok) throw new Error('Failed to fetch questions');
      const result = await response.json();
      setUploadedQuestions(result.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group questions by fileName
  const groupedQuestions = uploadedQuestions.reduce((acc, question) => {
    const batch = question.fileName || 'Uploaded Questions';
    if (!acc[batch]) {
      acc[batch] = [];
    }
    acc[batch].push(question);
    return acc;
  }, {});

  // Sort batches by most recent
  const sortedBatches = Object.entries(groupedQuestions).sort(
    (a, b) => {
      const latestA = Math.max(...a[1].map(q => new Date(q.createdAt).getTime()));
      const latestB = Math.max(...b[1].map(q => new Date(q.createdAt).getTime()));
      return latestB - latestA;
    }
  );

  return (
    <main>
      <Navbar />
      <AdminSidebar />

      <div className="pt-20 pb-10 ml-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">📁 Uploaded Questions</h1>
            <p className="text-gray-600">View and manage all questions organized by file</p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search questions by text, file name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading questions...</p>
            </div>
          ) : sortedBatches.length === 0 ? (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 text-lg">No questions uploaded yet</p>
              <p className="text-gray-500 text-sm mt-1">Upload an Excel file to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedBatches.map(([batchName, questions]) => {
                const filteredQuestions = questions.filter(q =>
                  q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  batchName.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (filteredQuestions.length === 0) return null;

                return (
                  <div key={batchName} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    {/* File Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h2 className="text-xl font-bold">{batchName}</h2>
                            <p className="text-blue-100 text-sm">
                              {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-blue-100">
                            Uploaded {new Date(Math.max(...questions.map(q => new Date(q.createdAt).getTime()))).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Questions List */}
                    <div className="divide-y divide-gray-200">
                      {filteredQuestions.map((question, index) => (
                        <div key={question.id} className="p-6 hover:bg-blue-50/50 transition-colors">
                          <div className="flex items-start gap-4">
                            {/* Question Number */}
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-700 font-bold">Q{question.questionId}</span>
                              </div>
                            </div>

                            {/* Question Content */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                {question.question}
                              </h3>

                              {/* Options Grid */}
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                {['A', 'B', 'C', 'D'].map((option) => (
                                  <div
                                    key={option}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                      question.correctAnswer === option
                                        ? 'bg-green-50 border-green-500 shadow-md'
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <span className={`font-bold text-sm flex-shrink-0 ${
                                        question.correctAnswer === option ? 'text-green-700' : 'text-gray-600'
                                      }`}>
                                        {option}.
                                      </span>
                                      <p className={`text-sm ${
                                        question.correctAnswer === option ? 'text-green-700 font-semibold' : 'text-gray-700'
                                      }`}>
                                        {question[`option${option}`]}
                                      </p>
                                    </div>
                                    {question.correctAnswer === option && (
                                      <div className="mt-2 flex items-center gap-1 text-xs text-green-600 font-bold">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Correct Answer
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* Answer Summary */}
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-600">Correct Answer:</span>
                                <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  {question.correctAnswer}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
