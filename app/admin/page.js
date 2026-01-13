'use client';

import { useState, useEffect } from 'react';
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
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userSearch, setUserSearch] = useState('');
  const [quizSearch, setQuizSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTabView, setUserTabView] = useState('regular');
  const [roleUpdateModal, setRoleUpdateModal] = useState(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [blockModal, setBlockModal] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [isBlockingUser, setIsBlockingUser] = useState(false);
  const [blockedSearch, setBlockedSearch] = useState('');
  const [uploadedQuestions, setUploadedQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionSearch, setQuestionSearch] = useState('');
  const [quizPreviewModal, setQuizPreviewModal] = useState(null);
  const [previewQuestionIndex, setPreviewQuestionIndex] = useState(0);
  const [quizSets, setQuizSets] = useState([]);
  const [quizSetsLoading, setQuizSetsLoading] = useState(false);
  const [selectedQuizSet, setSelectedQuizSet] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchUploadedQuestions();
    fetchQuizSets();
  }, []);

  const fetchUploadedQuestions = async () => {
    try {
      setQuestionsLoading(true);
      const response = await fetch('/api/questions');
      if (!response.ok) throw new Error('Failed to fetch questions');
      const result = await response.json();
      setUploadedQuestions(result.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const fetchQuizSets = async () => {
    try {
      setQuizSetsLoading(true);
      const response = await fetch('/api/quiz-sets');
      if (!response.ok) throw new Error('Failed to fetch quiz sets');
      const result = await response.json();
      setQuizSets(result.data || []);
    } catch (error) {
      console.error('Error fetching quiz sets:', error);
    } finally {
      setQuizSetsLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setDashboardData(result);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    // When making a regular user an admin, automatically set to "assistant admin"
    const finalRole = (newRole === 'admin') ? 'assistant admin' : newRole;
    
    setRoleUpdateModal({
      userId,
      newRole: finalRole,
      currentUser: dashboardData?.users?.find(u => u.id === userId),
    });
  };

  const confirmRoleChange = async () => {
    if (!roleUpdateModal) return;
    
    setIsUpdatingRole(true);
    try {
      const response = await fetch(`/api/admin/users/${roleUpdateModal.userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: roleUpdateModal.newRole }),
      });

      if (!response.ok) throw new Error('Failed to update role');

      // Refresh dashboard data
      await fetchDashboardData();
      setRoleUpdateModal(null);
      setSelectedUser(null);
      
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update user role');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const cancelRoleChange = () => {
    setRoleUpdateModal(null);
  };

  const openBlockModal = (user) => {
    setBlockModal(user);
    setBlockReason('');
  };

  const closeBlockModal = () => {
    setBlockModal(null);
    setBlockReason('');
  };

  const confirmBlockUser = async () => {
    if (blockModal.isBlocked) {
      // Unblock user
      await updateBlockStatus(blockModal.id, false, '');
    } else {
      // Block user - requires reason
      if (!blockReason.trim()) {
        alert('Please enter a reason for blocking');
        return;
      }
      await updateBlockStatus(blockModal.id, true, blockReason);
    }
  };

  const updateBlockStatus = async (userId, isBlocked, reason) => {
    setIsBlockingUser(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/block`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          isBlocked, 
          blockReason: reason 
        }),
      });

      if (!response.ok) throw new Error('Failed to update block status');

      await fetchDashboardData();
      closeBlockModal();
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating block status:', error);
      alert('Failed to update user block status');
    } finally {
      setIsBlockingUser(false);
    }
  };
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

  const handleSaveQuestionsToDatabase = async () => {
    if (questions.length === 0) {
      alert('No questions to save');
      return;
    }

    try {
      setQuestionsLoading(true);
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save questions');
      }

      alert(`✓ ${result.count || questions.length} questions saved to database successfully!`);
      
      // Clear the form questions
      setQuestions([]);
      
      // Refresh uploaded questions
      await fetchUploadedQuestions();
      
      // Refresh quiz sets
      await fetchQuizSets();
    } catch (error) {
      console.error('Error saving questions:', error);
      alert('Failed to save questions: ' + error.message);
    } finally {
      setQuestionsLoading(false);
    }
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

  const openQuizPreview = (questionsArray) => {
    setQuizPreviewModal(questionsArray);
    setPreviewQuestionIndex(0);
  };

  const closeQuizPreview = () => {
    setQuizPreviewModal(null);
    setPreviewQuestionIndex(0);
  };

  const handlePreviewNext = () => {
    if (previewQuestionIndex < quizPreviewModal.length - 1) {
      setPreviewQuestionIndex(previewQuestionIndex + 1);
    }
  };

  const handlePreviewPrevious = () => {
    if (previewQuestionIndex > 0) {
      setPreviewQuestionIndex(previewQuestionIndex - 1);
    }
  };

  const openQuizSetPreview = async (quizSetId) => {
    try {
      const response = await fetch(`/api/quiz-sets/${quizSetId}`);
      if (!response.ok) throw new Error('Failed to fetch quiz set');
      const result = await response.json();
      setSelectedQuizSet(result.quizSet);
      setQuizPreviewModal(result.quizSet.questions);
      setPreviewQuestionIndex(0);
    } catch (error) {
      console.error('Error fetching quiz set:', error);
      alert('Failed to load quiz set');
    }
  };

  return (
    <main className="flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-20'} bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 overflow-y-auto max-h-screen fixed left-0 top-0 bottom-0 z-40`}>
        <div className="p-4 flex justify-between items-center border-b border-blue-700 mt-20">
          <h3 className={`font-bold text-lg ${!sidebarOpen && 'hidden'}`}>📚 Quiz Sets</h3>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-blue-700 p-1 rounded transition"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <div className={`p-4 space-y-2 ${!sidebarOpen && 'hidden'}`}>
          {quizSetsLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : quizSets.length > 0 ? (
            quizSets.map((qs) => (
              <button
                key={qs.id}
                onClick={() => openQuizSetPreview(qs.id)}
                className={`w-full text-left p-3 rounded-lg transition ${
                  selectedQuizSet?.id === qs.id
                    ? 'bg-blue-500 shadow-lg'
                    : 'bg-blue-700 hover:bg-blue-600'
                }`}
              >
                <div className="font-semibold truncate">{qs.name}</div>
                <div className="text-xs text-blue-100 mt-1">
                  📝 {qs.questionCount} questions
                </div>
                <div className="text-xs text-blue-200 mt-1">
                  {new Date(qs.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-blue-300">
              <p className="text-sm">No quiz sets yet</p>
            </div>
          )}
        </div>

        {/* Collapsed View */}
        {!sidebarOpen && quizSets.length > 0 && (
          <div className="p-2 space-y-2">
            {quizSets.slice(0, 5).map((qs) => (
              <button
                key={qs.id}
                onClick={() => openQuizSetPreview(qs.id)}
                title={qs.name}
                className={`w-full text-center p-2 rounded-lg transition text-xs font-semibold ${
                  selectedQuizSet?.id === qs.id
                    ? 'bg-blue-500'
                    : 'bg-blue-700 hover:bg-blue-600'
                }`}
              >
                📝
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-80' : 'ml-20'} w-full transition-all duration-300`}>
        <Navbar />
        
        {/* Quiz Preview Modal */}
        {quizPreviewModal && quizPreviewModal.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between border-b-4 border-blue-800">
              <div>
                <h2 className="text-2xl font-bold text-white">📋 Quiz Preview</h2>
                <p className="text-blue-100 text-sm mt-1">Question {previewQuestionIndex + 1} of {quizPreviewModal.length}</p>
              </div>
              <button
                onClick={closeQuizPreview}
                className="text-white hover:bg-blue-800 p-2 rounded-full transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((previewQuestionIndex + 1) / quizPreviewModal.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Question */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Question {previewQuestionIndex + 1}
                </h3>
                <p className="text-lg text-gray-800 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                  {quizPreviewModal[previewQuestionIndex].question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {['A', 'B', 'C', 'D'].map((option) => (
                  <div
                    key={option}
                    className={`p-4 rounded-lg border-2 transition ${
                      quizPreviewModal[previewQuestionIndex].correctAnswer === option
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`font-bold text-lg ${
                        quizPreviewModal[previewQuestionIndex].correctAnswer === option
                          ? 'text-green-600'
                          : 'text-gray-600'
                      }`}>
                        {option}.
                      </span>
                      <div className="flex-1">
                        <p className="text-gray-800">
                          {quizPreviewModal[previewQuestionIndex][`option${option}`]}
                        </p>
                        {quizPreviewModal[previewQuestionIndex].correctAnswer === option && (
                          <span className="inline-block mt-2 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                            ✓ Correct Answer
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={handlePreviewPrevious}
                  disabled={previewQuestionIndex === 0}
                  className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  ← Previous
                </button>

                <div className="flex-1 flex items-center justify-center text-sm text-gray-600">
                  Question {previewQuestionIndex + 1} / {quizPreviewModal.length}
                </div>

                <button
                  onClick={handlePreviewNext}
                  disabled={previewQuestionIndex === quizPreviewModal.length - 1}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Role Update Confirmation Modal */}
      {roleUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Confirm Role Update</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-3">
                <span className="font-semibold">User:</span> {roleUpdateModal.currentUser?.email}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                <span className="font-semibold">Name:</span> {roleUpdateModal.currentUser?.name || '-'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">New Role:</span> <span className={`font-bold ${roleUpdateModal.newRole === 'assistant admin' ? 'text-orange-600' : roleUpdateModal.newRole === 'admin' ? 'text-green-600' : 'text-blue-600'}`}>
                  {roleUpdateModal.newRole === 'assistant admin' ? 'Assistant Admin' : roleUpdateModal.newRole === 'admin' ? 'Admin' : 'Regular User'}
                </span>
              </p>
            </div>
            
            <p className="text-center text-gray-600 text-sm mb-6">
              Are you sure you want to update this user's role to <strong>{roleUpdateModal.newRole === 'assistant admin' ? 'Assistant Admin' : roleUpdateModal.newRole === 'admin' ? 'Admin' : 'User'}</strong>?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={cancelRoleChange}
                disabled={isUpdatingRole}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRoleChange}
                disabled={isUpdatingRole}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-semibold transition ${
                  roleUpdateModal.newRole === 'assistant admin' 
                    ? 'bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400' 
                    : roleUpdateModal.newRole === 'admin' 
                    ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400' 
                    : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
                }`}
              >
                {isUpdatingRole ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Block Modal */}
      {blockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex items-center justify-center mb-4">
              <div className={`w-12 h-12 ${blockModal.isBlocked ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center`}>
                <svg className={`w-6 h-6 ${blockModal.isBlocked ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              {blockModal.isBlocked ? 'Unblock User' : 'Block User'}
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Email:</span> {blockModal.email}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Name:</span> {blockModal.name || '-'}
              </p>
              {blockModal.isBlocked && (
                <>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Reason:</span> {blockModal.blockReason || '-'}
                  </p>
                </>
              )}
            </div>

            {!blockModal.isBlocked && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for blocking:
                </label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Enter reason for blocking this user..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
                  rows="3"
                />
              </div>
            )}
            
            <p className="text-center text-gray-600 text-sm mb-6">
              Are you sure you want to {blockModal.isBlocked ? 'unblock' : 'block'} this user? 
              {!blockModal.isBlocked && ' They will not be able to login.'}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={closeBlockModal}
                disabled={isBlockingUser}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmBlockUser}
                disabled={isBlockingUser || (!blockModal.isBlocked && !blockReason.trim())}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-semibold transition ${
                  blockModal.isBlocked 
                    ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400' 
                    : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                }`}
              >
                {isBlockingUser ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  blockModal.isBlocked ? 'Unblock User' : 'Block User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="pt-20 pb-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-4xl font-bold mb-8 text-center">Admin Dashboard</h1>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-300 mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 font-semibold whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-semibold whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-6 py-3 font-semibold whitespace-nowrap ${
                activeTab === 'questions'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Questions
            </button>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              {dashboardLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                  </div>
                </div>
              ) : dashboardData ? (
                <div className="space-y-8">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Users */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm font-medium">Total Users</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">
                            {dashboardData?.stats.totalUsers}
                          </p>
                        </div>
                        <div className="bg-blue-100 rounded-lg p-4">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0h.01M9 12h.01M3 20h18a2 2 0 002-2V6a2 2 0 00-2-2H3a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Total Admins */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm font-medium">Total Admins</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">
                            {dashboardData?.stats.totalAdmins}
                          </p>
                        </div>
                        <div className="bg-green-100 rounded-lg p-4">
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Total Quizzes */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm font-medium">Total Quizzes</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">
                            {dashboardData?.stats.totalQuizzes}
                          </p>
                        </div>
                        <div className="bg-purple-100 rounded-lg p-4">
                          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Users Cards with Tabs */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    {/* Tab Navigation */}
                    <div className="flex gap-2 mb-6 border-b border-gray-300">
                      <button
                        onClick={() => setUserTabView('regular')}
                        className={`px-6 py-3 font-semibold transition-colors ${
                          userTabView === 'regular'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-blue-600'
                        }`}
                      >
                        Regular Users
                      </button>
                      <button
                        onClick={() => setUserTabView('assistant')}
                        className={`px-6 py-3 font-semibold transition-colors ${
                          userTabView === 'assistant'
                            ? 'text-orange-600 border-b-2 border-orange-600'
                            : 'text-gray-600 hover:text-orange-600'
                        }`}
                      >
                        Assistant Admins
                      </button>
                      <button
                        onClick={() => setUserTabView('admin')}
                        className={`px-6 py-3 font-semibold transition-colors ${
                          userTabView === 'admin'
                            ? 'text-green-600 border-b-2 border-green-600'
                            : 'text-gray-600 hover:text-green-600'
                        }`}
                      >
                        Admin Users
                      </button>
                      <button
                        onClick={() => setUserTabView('blocked')}
                        className={`px-6 py-3 font-semibold transition-colors ${
                          userTabView === 'blocked'
                            ? 'text-red-600 border-b-2 border-red-600'
                            : 'text-gray-600 hover:text-red-600'
                        }`}
                      >
                        Blocked Users
                      </button>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                      {userTabView === 'blocked' ? (
                        <input
                          type="text"
                          placeholder="Search blocked users by email or name..."
                          value={blockedSearch}
                          onChange={(e) => setBlockedSearch(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder="Search by email or name..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      )}
                    </div>

                    {/* Regular Users Table */}
                    {userTabView === 'regular' && (
                      <div>
                        {selectedUser && selectedUser.role !== 'admin' ? (
                          <div className="space-y-4">
                            <button
                              onClick={() => setSelectedUser(null)}
                              className="mb-4 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400"
                            >
                              ← Back to Table
                            </button>
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-400 rounded-lg p-6 max-w-2xl">
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <p className="text-xs font-semibold text-blue-700 uppercase">Email</p>
                                  <p className="text-lg font-medium text-gray-900 break-all">{selectedUser.email}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-blue-700 uppercase">Name</p>
                                  <p className="text-lg text-gray-700">{selectedUser.name || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-blue-700 uppercase">Country</p>
                                  <p className="text-lg text-gray-700">{selectedUser.country || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-blue-700 uppercase">City</p>
                                  <p className="text-lg text-gray-700">{selectedUser.city || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-blue-700 uppercase">Joined</p>
                                  <p className="text-lg text-gray-700">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-blue-700 uppercase">Role</p>
                                  <p className="text-lg text-blue-700 font-semibold">{selectedUser.role}</p>
                                </div>
                              </div>
                              {selectedUser.isBlocked && (
                                <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                                  <p className="text-sm font-semibold text-red-700 mb-2">🚫 User is Blocked</p>
                                  <p className="text-sm text-red-600">
                                    <span className="font-semibold">Reason:</span> {selectedUser.blockReason || 'No reason provided'}
                                  </p>
                                  <p className="text-xs text-red-500 mt-2">
                                    Blocked on: {selectedUser.blockedAt ? new Date(selectedUser.blockedAt).toLocaleString() : '-'}
                                  </p>
                                </div>
                              )}
                              <button
                                onClick={() => {
                                  handleRoleChange(selectedUser.id, 'admin');
                                  setSelectedUser(null);
                                }}
                                className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                              >
                                Make Admin
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(null);
                                  openBlockModal(selectedUser);
                                }}
                                className={`w-full mt-2 px-4 py-2 text-white rounded-lg hover:opacity-90 font-semibold transition ${
                                  selectedUser.isBlocked 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : 'bg-red-600 hover:bg-red-700'
                                }`}
                              >
                                {selectedUser.isBlocked ? 'Unblock User' : 'Block User'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-blue-50 border-b-2 border-blue-300">
                                <tr>
                                  <th className="px-4 py-3 text-left font-semibold text-blue-900">Email</th>
                                  <th className="px-4 py-3 text-left font-semibold text-blue-900">Name</th>
                                  <th className="px-4 py-3 text-left font-semibold text-blue-900">Country</th>
                                  <th className="px-4 py-3 text-left font-semibold text-blue-900">City</th>
                                  <th className="px-4 py-3 text-left font-semibold text-blue-900">Status</th>
                                  <th className="px-4 py-3 text-left font-semibold text-blue-900">Joined</th>
                                  <th className="px-4 py-3 text-left font-semibold text-blue-900">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dashboardData?.users
                                  ?.filter(
                                    (user) =>
                                      user.role !== 'admin' &&
                                      !user.isBlocked &&
                                      (user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                                        (user.name && user.name.toLowerCase().includes(userSearch.toLowerCase())))
                                  )
                                  .map((user) => (
                                    <tr key={user.id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                                      <td className="px-4 py-3 font-medium text-gray-900">{user.email}</td>
                                      <td className="px-4 py-3 text-gray-700">{user.name || '-'}</td>
                                      <td className="px-4 py-3 text-gray-700">{user.country || '-'}</td>
                                      <td className="px-4 py-3 text-gray-700">{user.city || '-'}</td>
                                      <td className="px-4 py-3">
                                        {user.isBlocked ? (
                                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold" title={user.blockReason}>
                                            🚫 Blocked
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                            ✓ Active
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-3 text-gray-700">{new Date(user.createdAt).toLocaleDateString()}</td>
                                      <td className="px-4 py-3">
                                        <div className="flex gap-2 flex-wrap">
                                          <button
                                            onClick={() => setSelectedUser(user)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
                                          >
                                            View
                                          </button>
                                          <button
                                            onClick={() => handleRoleChange(user.id, 'admin')}
                                            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition"
                                          >
                                            Make Admin
                                          </button>
                                          <button
                                            onClick={() => openBlockModal(user)}
                                            className={`px-3 py-1 rounded text-xs transition font-semibold ${
                                              user.isBlocked 
                                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                                : 'bg-red-600 text-white hover:bg-red-700'
                                            }`}
                                          >
                                            {user.isBlocked ? 'Unblock' : 'Block'}
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {dashboardData?.users?.filter(
                          (user) =>
                            user.role !== 'admin' &&
                            !user.isBlocked &&
                            (user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                              (user.name && user.name.toLowerCase().includes(userSearch.toLowerCase())))
                        ).length === 0 && !selectedUser && (
                          <div className="text-center text-gray-500 py-8">
                            No regular users found
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin Users Table */}
                    {userTabView === 'admin' && (
                      <div>
                        {selectedUser && selectedUser.role === 'admin' ? (
                          <div className="space-y-4">
                            <button
                              onClick={() => setSelectedUser(null)}
                              className="mb-4 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400"
                            >
                              ← Back to Table
                            </button>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-400 rounded-lg p-6 max-w-2xl">
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <p className="text-xs font-semibold text-green-700 uppercase">Email</p>
                                  <p className="text-lg font-medium text-gray-900 break-all">{selectedUser.email}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-green-700 uppercase">Name</p>
                                  <p className="text-lg text-gray-700">{selectedUser.name || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-green-700 uppercase">Country</p>
                                  <p className="text-lg text-gray-700">{selectedUser.country || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-green-700 uppercase">City</p>
                                  <p className="text-lg text-gray-700">{selectedUser.city || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-green-700 uppercase">Joined</p>
                                  <p className="text-lg text-gray-700">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-green-700 uppercase">Role</p>
                                  <p className="text-lg text-green-700 font-semibold">{selectedUser.role}</p>
                                </div>
                              </div>
                              {selectedUser.isBlocked && (
                                <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                                  <p className="text-sm font-semibold text-red-700 mb-2">🚫 User is Blocked</p>
                                  <p className="text-sm text-red-600">
                                    <span className="font-semibold">Reason:</span> {selectedUser.blockReason || 'No reason provided'}
                                  </p>
                                  <p className="text-xs text-red-500 mt-2">
                                    Blocked on: {selectedUser.blockedAt ? new Date(selectedUser.blockedAt).toLocaleString() : '-'}
                                  </p>
                                </div>
                              )}
                              <button
                                onClick={() => {
                                  handleRoleChange(selectedUser.id, 'user');
                                  setSelectedUser(null);
                                }}
                                className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                              >
                                Remove Admin Privileges
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(null);
                                  openBlockModal(selectedUser);
                                }}
                                className={`w-full mt-2 px-4 py-2 text-white rounded-lg hover:opacity-90 font-semibold transition ${
                                  selectedUser.isBlocked 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : 'bg-red-600 hover:bg-red-700'
                                }`}
                              >
                                {selectedUser.isBlocked ? 'Unblock User' : 'Block User'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-green-50 border-b-2 border-green-300">
                                <tr>
                                  <th className="px-4 py-3 text-left font-semibold text-green-900">Email</th>
                                  <th className="px-4 py-3 text-left font-semibold text-green-900">Name</th>
                                  <th className="px-4 py-3 text-left font-semibold text-green-900">Country</th>
                                  <th className="px-4 py-3 text-left font-semibold text-green-900">City</th>
                                  <th className="px-4 py-3 text-left font-semibold text-green-900">Joined</th>
                                  <th className="px-4 py-3 text-left font-semibold text-green-900">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dashboardData?.users
                                  ?.filter(
                                    (user) =>
                                      user.role === 'admin' &&
                                      !user.isBlocked &&
                                      (user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                                        (user.name && user.name.toLowerCase().includes(userSearch.toLowerCase())))
                                  )
                                  .map((user) => (
                                    <tr key={user.id} className="border-b border-gray-200 hover:bg-green-50 transition-colors">
                                      <td className="px-4 py-3 font-medium text-gray-900">{user.email}</td>
                                      <td className="px-4 py-3 text-gray-700">{user.name || '-'}</td>
                                      <td className="px-4 py-3 text-gray-700">{user.country || '-'}</td>
                                      <td className="px-4 py-3 text-gray-700">{user.city || '-'}</td>
                                      <td className="px-4 py-3 text-gray-700">{new Date(user.createdAt).toLocaleDateString()}</td>
                                      <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => setSelectedUser(user)}
                                            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition"
                                          >
                                            View
                                          </button>
                                          <button
                                            onClick={() => handleRoleChange(user.id, 'user')}
                                            className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition font-semibold"
                                            title="Remove admin privileges"
                                          >
                                            Remove Admin
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {dashboardData?.users?.filter(
                          (user) =>
                            user.role === 'admin' &&
                            !user.isBlocked &&
                            (user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                              (user.name && user.name.toLowerCase().includes(userSearch.toLowerCase())))
                        ).length === 0 && !selectedUser && (
                          <div className="text-center text-gray-500 py-8">
                            No admin users found
                          </div>
                        )}
                      </div>
                    )}

                    {/* Assistant Admin Users Table */}
                    {userTabView === 'assistant' && (
                      <div>
                        {selectedUser && selectedUser.role === 'assistant admin' ? (
                          <div className="space-y-4">
                            <button
                              onClick={() => setSelectedUser(null)}
                              className="mb-4 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400"
                            >
                              ← Back to Table
                            </button>
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-400 rounded-lg p-6 max-w-2xl">
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <p className="text-xs font-semibold text-orange-700 uppercase">Email</p>
                                  <p className="text-lg font-medium text-gray-900 break-all">{selectedUser.email}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-orange-700 uppercase">Name</p>
                                  <p className="text-lg text-gray-700">{selectedUser.name || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-orange-700 uppercase">Country</p>
                                  <p className="text-lg text-gray-700">{selectedUser.country || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-orange-700 uppercase">City</p>
                                  <p className="text-lg text-gray-700">{selectedUser.city || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-orange-700 uppercase">Joined</p>
                                  <p className="text-lg text-gray-700">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-orange-700 uppercase">Role</p>
                                  <p className="text-lg text-orange-700 font-semibold">{selectedUser.role}</p>
                                </div>
                              </div>
                              {selectedUser.isBlocked && (
                                <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                                  <p className="text-sm font-semibold text-red-700 mb-2">🚫 User is Blocked</p>
                                  <p className="text-sm text-red-600">
                                    <span className="font-semibold">Reason:</span> {selectedUser.blockReason || 'No reason provided'}
                                  </p>
                                  <p className="text-xs text-red-500 mt-2">
                                    Blocked on: {selectedUser.blockedAt ? new Date(selectedUser.blockedAt).toLocaleString() : '-'}
                                  </p>
                                </div>
                              )}
                              <div className="flex gap-2 mt-6">
                                <button
                                  onClick={() => {
                                    handleRoleChange(selectedUser.id, 'admin');
                                    setSelectedUser(null);
                                  }}
                                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                                >
                                  Promote to Admin
                                </button>
                                <button
                                  onClick={() => {
                                    handleRoleChange(selectedUser.id, 'user');
                                    setSelectedUser(null);
                                  }}
                                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                                >
                                  Demote to User
                                </button>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedUser(null);
                                  openBlockModal(selectedUser);
                                }}
                                className={`w-full mt-3 px-4 py-2 text-white rounded-lg hover:opacity-90 font-semibold transition ${
                                  selectedUser.isBlocked 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : 'bg-red-600 hover:bg-red-700'
                                }`}
                              >
                                {selectedUser.isBlocked ? 'Unblock User' : 'Block User'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-orange-50 border-b-2 border-orange-300">
                                <tr>
                                  <th className="px-4 py-3 text-left font-semibold text-orange-900">Email</th>
                                  <th className="px-4 py-3 text-left font-semibold text-orange-900">Name</th>
                                  <th className="px-4 py-3 text-left font-semibold text-orange-900">Country</th>
                                  <th className="px-4 py-3 text-left font-semibold text-orange-900">City</th>
                                  <th className="px-4 py-3 text-left font-semibold text-orange-900">Status</th>
                                  <th className="px-4 py-3 text-left font-semibold text-orange-900">Joined</th>
                                  <th className="px-4 py-3 text-left font-semibold text-orange-900">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dashboardData?.users
                                  ?.filter(
                                    (user) =>
                                      user.role === 'assistant admin' &&
                                      !user.isBlocked &&
                                      (user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                                        (user.name && user.name.toLowerCase().includes(userSearch.toLowerCase())))
                                  )
                                  .map((user) => (
                                    <tr key={user.id} className="border-b border-gray-200 hover:bg-orange-50 transition-colors">
                                      <td className="px-4 py-3 font-medium text-gray-900">{user.email}</td>
                                      <td className="px-4 py-3 text-gray-700">{user.name || '-'}</td>
                                      <td className="px-4 py-3 text-gray-700">{user.country || '-'}</td>
                                      <td className="px-4 py-3 text-gray-700">{user.city || '-'}</td>
                                      <td className="px-4 py-3">
                                        {user.isBlocked ? (
                                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold" title={user.blockReason}>
                                            🚫 Blocked
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                            ✓ Active
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-3 text-gray-700">{new Date(user.createdAt).toLocaleDateString()}</td>
                                      <td className="px-4 py-3">
                                        <div className="flex gap-2 flex-wrap">
                                          <button
                                            onClick={() => setSelectedUser(user)}
                                            className="px-3 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 transition"
                                          >
                                            View
                                          </button>
                                          <button
                                            onClick={() => handleRoleChange(user.id, 'admin')}
                                            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition"
                                          >
                                            Promote
                                          </button>
                                          <button
                                            onClick={() => handleRoleChange(user.id, 'user')}
                                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
                                          >
                                            Demote
                                          </button>
                                          <button
                                            onClick={() => openBlockModal(user)}
                                            className={`px-3 py-1 rounded text-xs transition font-semibold ${
                                              user.isBlocked 
                                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                                : 'bg-red-600 text-white hover:bg-red-700'
                                            }`}
                                          >
                                            {user.isBlocked ? 'Unblock' : 'Block'}
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {dashboardData?.users?.filter(
                          (user) =>
                            user.role === 'assistant admin' &&
                            !user.isBlocked &&
                            (user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                              (user.name && user.name.toLowerCase().includes(userSearch.toLowerCase())))
                        ).length === 0 && !selectedUser && (
                          <div className="text-center text-gray-500 py-8">
                            No assistant admin users found
                          </div>
                        )}
                      </div>
                    )}

                    {/* Blocked Users Table */}
                    {userTabView === 'blocked' && (
                      <div>
                        {selectedUser && selectedUser.isBlocked ? (
                          <div className="space-y-4">
                            <button
                              onClick={() => setSelectedUser(null)}
                              className="mb-4 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400"
                            >
                              ← Back to Table
                            </button>
                            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-400 rounded-lg p-6 max-w-2xl">
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <p className="text-xs font-semibold text-red-700 uppercase">Email</p>
                                  <p className="text-lg font-medium text-gray-900 break-all">{selectedUser.email}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-red-700 uppercase">Name</p>
                                  <p className="text-lg text-gray-700">{selectedUser.name || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-red-700 uppercase">Country</p>
                                  <p className="text-lg text-gray-700">{selectedUser.country || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-red-700 uppercase">City</p>
                                  <p className="text-lg text-gray-700">{selectedUser.city || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-red-700 uppercase">Joined</p>
                                  <p className="text-lg text-gray-700">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-red-700 uppercase">Role</p>
                                  <p className="text-lg text-gray-700 font-semibold capitalize">{selectedUser.role}</p>
                                </div>
                              </div>
                              <div className="mt-4 p-4 bg-red-100 border-2 border-red-400 rounded-lg">
                                <p className="text-sm font-semibold text-red-800 mb-2">🚫 Block Reason</p>
                                <p className="text-sm text-red-700 font-medium mb-2">{selectedUser.blockReason || 'No reason provided'}</p>
                                <p className="text-xs text-red-600 mt-2">
                                  Blocked on: {selectedUser.blockedAt ? new Date(selectedUser.blockedAt).toLocaleString() : '-'}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedUser(null);
                                  openBlockModal(selectedUser);
                                }}
                                className="w-full mt-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
                              >
                                Unblock User
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-red-50 border-b-2 border-red-300">
                                <tr>
                                  <th className="px-4 py-3 text-left font-semibold text-red-900">Email</th>
                                  <th className="px-4 py-3 text-left font-semibold text-red-900">Name</th>
                                  <th className="px-4 py-3 text-left font-semibold text-red-900">Role</th>
                                  <th className="px-4 py-3 text-left font-semibold text-red-900">Block Reason</th>
                                  <th className="px-4 py-3 text-left font-semibold text-red-900">Blocked Date</th>
                                  <th className="px-4 py-3 text-left font-semibold text-red-900">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dashboardData?.users
                                  ?.filter(
                                    (user) =>
                                      user.isBlocked &&
                                      (user.email.toLowerCase().includes(blockedSearch.toLowerCase()) ||
                                        (user.name && user.name.toLowerCase().includes(blockedSearch.toLowerCase())))
                                  )
                                  .map((user) => (
                                    <tr key={user.id} className="border-b border-gray-200 hover:bg-red-50 transition-colors">
                                      <td className="px-4 py-3 font-medium text-gray-900">{user.email}</td>
                                      <td className="px-4 py-3 text-gray-700">{user.name || '-'}</td>
                                      <td className="px-4 py-3 text-gray-700 capitalize">{user.role}</td>
                                      <td className="px-4 py-3 text-gray-700 text-xs">{user.blockReason || '-'}</td>
                                      <td className="px-4 py-3 text-gray-700">{user.blockedAt ? new Date(user.blockedAt).toLocaleDateString() : '-'}</td>
                                      <td className="px-4 py-3">
                                        <div className="flex gap-2 flex-wrap">
                                          <button
                                            onClick={() => setSelectedUser(user)}
                                            className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition"
                                          >
                                            View
                                          </button>
                                          <button
                                            onClick={() => openBlockModal(user)}
                                            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition font-semibold"
                                          >
                                            Unblock
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {dashboardData?.users?.filter(
                          (user) =>
                            user.isBlocked &&
                            (user.email.toLowerCase().includes(blockedSearch.toLowerCase()) ||
                              (user.name && user.name.toLowerCase().includes(blockedSearch.toLowerCase())))
                        ).length === 0 && !selectedUser && (
                          <div className="text-center text-gray-500 py-8">
                            No blocked users found
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quizzes Table */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold mb-4">Quizzes</h3>
                      <input
                        type="text"
                        placeholder="Search by quiz title..."
                        value={quizSearch}
                        onChange={(e) => setQuizSearch(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b border-gray-300">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Title</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Description</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">User ID</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData?.quizzes
                            ?.filter((quiz) =>
                              quiz.title.toLowerCase().includes(quizSearch.toLowerCase())
                            )
                            .map((quiz) => (
                              <tr key={quiz.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{quiz.title}</td>
                                <td className="px-4 py-3 text-gray-600">
                                  {quiz.description ? quiz.description.substring(0, 50) + '...' : '-'}
                                </td>
                                <td className="px-4 py-3 text-gray-600">{quiz.userId}</td>
                                <td className="px-4 py-3 text-gray-600">
                                  {new Date(quiz.createdAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-600">Error loading dashboard data</div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Premium Header */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
                <h2 className="text-3xl font-bold mb-2">Analytics Dashboard</h2>
                <p className="text-blue-100">Real-time insights and performance metrics</p>
              </div>

              {/* Key Metrics - Premium Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border border-blue-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-600 rounded-lg p-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0h.01M9 12h.01M3 20h18a2 2 0 002-2V6a2 2 0 00-2-2H3a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-200 px-3 py-1 rounded-full">Total</span>
                  </div>
                  <p className="text-blue-600 text-sm font-semibold mb-1">Total Users</p>
                  <p className="text-4xl font-bold text-blue-900">{dashboardData?.stats.totalUsers}</p>
                  <p className="text-xs text-blue-600 mt-3">📊 All registered users</p>
                </div>

                {/* Regular Users Card */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg border border-green-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-600 rounded-lg p-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-200 px-3 py-1 rounded-full">Active</span>
                  </div>
                  <p className="text-green-600 text-sm font-semibold mb-1">Regular Users</p>
                  <p className="text-4xl font-bold text-green-900">{dashboardData?.stats.regularUsers}</p>
                  <p className="text-xs text-green-600 mt-3">
                    {dashboardData?.stats.totalUsers > 0
                      ? ((dashboardData?.stats.regularUsers / dashboardData?.stats.totalUsers) * 100).toFixed(1)
                      : 0}% of total
                  </p>
                </div>

                {/* Admin Users Card */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-lg border border-orange-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-orange-600 rounded-lg p-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-orange-600 bg-orange-200 px-3 py-1 rounded-full">Admin</span>
                  </div>
                  <p className="text-orange-600 text-sm font-semibold mb-1">Admin Users</p>
                  <p className="text-4xl font-bold text-orange-900">{dashboardData?.stats.totalAdmins}</p>
                  <p className="text-xs text-orange-600 mt-3">
                    {dashboardData?.stats.totalUsers > 0
                      ? ((dashboardData?.stats.totalAdmins / dashboardData?.stats.totalUsers) * 100).toFixed(1)
                      : 0}% of total
                  </p>
                </div>

                {/* Recent Users Card */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg border border-purple-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-600 rounded-lg p-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-purple-600 bg-purple-200 px-3 py-1 rounded-full">New</span>
                  </div>
                  <p className="text-purple-600 text-sm font-semibold mb-1">New Users (7d)</p>
                  <p className="text-4xl font-bold text-purple-900">{dashboardData?.stats.recentUsers}</p>
                  <p className="text-xs text-purple-600 mt-3">Last 7 days</p>
                </div>
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Quizzes */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-lg border border-indigo-200 p-8 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-indigo-600 rounded-lg p-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-200 px-3 py-1 rounded-full">Quiz</span>
                  </div>
                  <p className="text-indigo-600 text-sm font-semibold mb-2">Total Quizzes</p>
                  <p className="text-5xl font-bold text-indigo-900">{dashboardData?.stats.totalQuizzes}</p>
                </div>

                {/* Avg Quizzes per User */}
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl shadow-lg border border-pink-200 p-8 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-pink-600 rounded-lg p-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-pink-600 bg-pink-200 px-3 py-1 rounded-full">Avg</span>
                  </div>
                  <p className="text-pink-600 text-sm font-semibold mb-2">Avg Quizzes/User</p>
                  <p className="text-5xl font-bold text-pink-900">{dashboardData?.stats.avgQuizzesPerUser}</p>
                </div>
              </div>

              {/* User Distribution by Country */}
              {dashboardData?.usersByCountry && dashboardData.usersByCountry.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Geographic Distribution</h3>
                      <p className="text-gray-500 text-sm mt-1">Users by Country</p>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20H7m6-4h6" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {dashboardData.usersByCountry.map((item, index) => (
                      <div key={index} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition">{item.country}</p>
                          <span className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">{item.count} users</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full group-hover:from-blue-600 group-hover:to-blue-700 transition-all"
                            style={{
                              width: `${
                                (item.count / dashboardData.usersByCountry[0].count) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User Distribution by City */}
              {dashboardData?.usersByCity && dashboardData.usersByCity.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Urban Distribution</h3>
                      <p className="text-gray-500 text-sm mt-1">Users by City</p>
                    </div>
                    <div className="bg-green-100 rounded-lg p-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {dashboardData.usersByCity.map((item, index) => (
                      <div key={index} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition">{item.city}</p>
                          <span className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">{item.count} users</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full group-hover:from-green-600 group-hover:to-green-700 transition-all"
                            style={{
                              width: `${
                                (item.count / dashboardData.usersByCity[0].count) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div className="space-y-8">
              {/* Excel Upload Section */}
              <div className="mb-10">
                <ExcelUploader />
              </div>

              {/* Uploaded Questions Section */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl shadow-lg border border-purple-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">📋 Uploaded Questions</h2>
                    <p className="text-gray-600 text-sm mt-1">All questions in the database</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => uploadedQuestions.length > 0 && openQuizPreview(uploadedQuestions)}
                      disabled={uploadedQuestions.length === 0}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Preview Quiz
                    </button>
                    <div className="bg-purple-600 rounded-lg p-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {questionsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                      <p className="mt-4 text-gray-600">Loading questions...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <input
                        type="text"
                        placeholder="Search questions..."
                        value={questionSearch}
                        onChange={(e) => setQuestionSearch(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white"
                      />
                    </div>

                    {uploadedQuestions.length > 0 ? (
                      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {uploadedQuestions
                          .filter((q) => q.question.toLowerCase().includes(questionSearch.toLowerCase()))
                          .map((q, index) => (
                            <div
                              key={q.id}
                              className="bg-white rounded-lg border-2 border-purple-200 p-5 hover:shadow-md transition-shadow hover:border-purple-400"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">Q{q.questionId}</span>
                                    <span className="text-xs font-semibold text-gray-500">ID: {q.id}</span>
                                  </div>
                                  <h3 className="font-semibold text-gray-900 text-sm leading-relaxed">{q.question}</h3>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className={`p-3 rounded-lg text-sm ${q.correctAnswer === 'A' ? 'bg-green-100 border-2 border-green-500 font-semibold text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                  <span className="font-bold">A:</span> {q.optionA}
                                </div>
                                <div className={`p-3 rounded-lg text-sm ${q.correctAnswer === 'B' ? 'bg-green-100 border-2 border-green-500 font-semibold text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                  <span className="font-bold">B:</span> {q.optionB}
                                </div>
                                <div className={`p-3 rounded-lg text-sm ${q.correctAnswer === 'C' ? 'bg-green-100 border-2 border-green-500 font-semibold text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                  <span className="font-bold">C:</span> {q.optionC}
                                </div>
                                <div className={`p-3 rounded-lg text-sm ${q.correctAnswer === 'D' ? 'bg-green-100 border-2 border-green-500 font-semibold text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                  <span className="font-bold">D:</span> {q.optionD}
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                <div className="text-xs text-gray-500">
                                  ✓ Answer: <span className="font-bold text-purple-600">{q.correctAnswer}</span>
                                </div>
                                <div className="text-xs text-gray-400">
                                  {new Date(q.createdAt).toLocaleDateString()} · {new Date(q.createdAt).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 font-medium">No questions uploaded yet</p>
                        <p className="text-gray-400 text-sm">Upload questions using Excel or add them manually below</p>
                      </div>
                    )}
                  </>
                )}

                <div className="mt-6 pt-6 border-t border-purple-200">
                  <p className="text-sm text-gray-600">
                    📊 Total Questions: <span className="font-bold text-purple-600">{uploadedQuestions.length}</span>
                  </p>
                </div>
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
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveQuestionsToDatabase}
                        className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Save All to Database
                      </button>
                      <button
                        onClick={handleDownload}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download JSON
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {questions.map((q, index) => (
                      <div key={q.id} className="border border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-lg text-gray-900">Q{index + 1}: {q.question}</h3>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm font-semibold"
                          >
                            ✕ Delete
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className={`p-3 rounded ${q.correctAnswer === 'A' ? 'bg-green-100 border-2 border-green-500 font-semibold text-green-700' : 'bg-white border border-gray-200 text-gray-700'}`}>
                            <span className="font-bold">A:</span> {q.optionA}
                          </div>
                          <div className={`p-3 rounded ${q.correctAnswer === 'B' ? 'bg-green-100 border-2 border-green-500 font-semibold text-green-700' : 'bg-white border border-gray-200 text-gray-700'}`}>
                            <span className="font-bold">B:</span> {q.optionB}
                          </div>
                          <div className={`p-3 rounded ${q.correctAnswer === 'C' ? 'bg-green-100 border-2 border-green-500 font-semibold text-green-700' : 'bg-white border border-gray-200 text-gray-700'}`}>
                            <span className="font-bold">C:</span> {q.optionC}
                          </div>
                          <div className={`p-3 rounded ${q.correctAnswer === 'D' ? 'bg-green-100 border-2 border-green-500 font-semibold text-green-700' : 'bg-white border border-gray-200 text-gray-700'}`}>
                            <span className="font-bold">D:</span> {q.optionD}
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                          <span className="text-xs text-gray-600">✓ Correct Answer: <span className="font-bold text-green-600">{q.correctAnswer}</span></span>
                          <span className="text-xs text-gray-500">Not saved yet</span>
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
          )}
        </div>
      </div>
    </div>
    </main>
  );
}
