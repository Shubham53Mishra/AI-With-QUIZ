'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import ExcelUploader from '../../components/ExcelUploader';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    
    if (!formData.question.trim() || !formData.optionA.trim() || !formData.optionB.trim() || !formData.optionC.trim() || !formData.optionD.trim()) {
      alert('Please fill all fields');
      return;
    }

    setQuestions((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...formData,
      },
    ]);

    setFormData({
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
    });
  };

  const handleDeleteQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleDownload = () => {
    const dataStr = JSON.stringify(questions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'questions.json';
    link.click();
  };

  return (
    <main>
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 text-center">Admin Panel</h1>

          {/* Excel Upload Section */}
          <div className="mb-10">
            <ExcelUploader />
          </div>

          <hr className="my-10" />

          {/* Add Question Form */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Add New Question</h2>
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Question</label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter question"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Option A</label>
                  <input
                    type="text"
                    name="optionA"
                    value={formData.optionA}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Option A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Option B</label>
                  <input
                    type="text"
                    name="optionB"
                    value={formData.optionB}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Option B"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Option C</label>
                  <input
                    type="text"
                    name="optionC"
                    value={formData.optionC}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Option C"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Option D</label>
                  <input
                    type="text"
                    name="optionD"
                    value={formData.optionD}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Option D"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Correct Answer</label>
                <select
                  name="correctAnswer"
                  value={formData.correctAnswer}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Add Question
              </button>
            </form>
          </div>

          {/* Questions List */}
          {questions.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Questions Added ({questions.length})</h2>
                <button
                  onClick={handleDownload}
                  className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Download JSON
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((q, index) => (
                  <div key={q.id} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg">Q{index + 1}: {q.question}</h3>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className={q.correctAnswer === 'A' ? 'font-bold text-green-600' : ''}>A) {q.optionA}</p>
                      <p className={q.correctAnswer === 'B' ? 'font-bold text-green-600' : ''}>B) {q.optionB}</p>
                      <p className={q.correctAnswer === 'C' ? 'font-bold text-green-600' : ''}>C) {q.optionC}</p>
                      <p className={q.correctAnswer === 'D' ? 'font-bold text-green-600' : ''}>D) {q.optionD}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {questions.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p>No questions added yet. Add your first question above!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
