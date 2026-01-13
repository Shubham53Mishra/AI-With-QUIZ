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

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                      <input
                        type="text"
                        placeholder="Search by email or name..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
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
                            (user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                              (user.name && user.name.toLowerCase().includes(userSearch.toLowerCase())))
                        ).length === 0 && !selectedUser && (
                          <div className="text-center text-gray-500 py-8">
                            No assistant admin users found
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
              {/* Enhanced Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Total Users */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <p className="text-gray-600 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {dashboardData?.stats.totalUsers}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Regular: {dashboardData?.stats.regularUsers}</p>
                </div>

                {/* Regular Users */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <p className="text-gray-600 text-sm font-medium">Regular Users</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {dashboardData?.stats.regularUsers}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {dashboardData?.stats.totalUsers > 0
                      ? ((dashboardData?.stats.regularUsers / dashboardData?.stats.totalUsers) * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>

                {/* Admin Users */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <p className="text-gray-600 text-sm font-medium">Admin Users</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {dashboardData?.stats.totalAdmins}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {dashboardData?.stats.totalUsers > 0
                      ? ((dashboardData?.stats.totalAdmins / dashboardData?.stats.totalUsers) * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>

                {/* Recent Users (7 days) */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <p className="text-gray-600 text-sm font-medium">New Users (7d)</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {dashboardData?.stats.recentUsers}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Last 7 days</p>
                </div>
              </div>

              {/* User Distribution by Country */}
              {dashboardData?.usersByCountry && dashboardData.usersByCountry.length > 0 && (
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <h3 className="text-xl font-bold mb-4">Users by Country</h3>
                  <div className="space-y-3">
                    {dashboardData.usersByCountry.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.country}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-48 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  (item.count / dashboardData.usersByCountry[0].count) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User Distribution by City */}
              {dashboardData?.usersByCity && dashboardData.usersByCity.length > 0 && (
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <h3 className="text-xl font-bold mb-4">Users by City</h3>
                  <div className="space-y-3">
                    {dashboardData.usersByCity.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.city}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-48 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  (item.count / dashboardData.usersByCity[0].count) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quiz Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <p className="text-gray-600 text-sm font-medium">Total Quizzes</p>
                  <p className="text-4xl font-bold text-purple-600 mt-2">
                    {dashboardData?.stats.totalQuizzes}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <p className="text-gray-600 text-sm font-medium">Avg Quizzes per User</p>
                  <p className="text-4xl font-bold text-indigo-600 mt-2">
                    {dashboardData?.stats.avgQuizzesPerUser}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div>
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
          )}
        </div>
      </div>
    </main>
  );
}
