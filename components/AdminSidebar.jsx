'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminSidebar({ onSidebarStateChange }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [uploadedQuestions, setUploadedQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const router = useRouter();

  // Notify parent when sidebar state changes
  useEffect(() => {
    if (onSidebarStateChange) {
      onSidebarStateChange(!isCollapsed || isHovering);
    }
  }, [isCollapsed, isHovering, onSidebarStateChange]);

  const menuItems = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-2m-9-3l7-4" />
        </svg>
      ),
      label: 'Dashboard',
      href: '/admin',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      label: 'Analytics',
      href: '/admin#analytics',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Questions',
      href: '/admin/uploaded-questions',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0h.01M9 12h.01M3 20h18a2 2 0 002-2V6a2 2 0 00-2-2H3a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Users',
      href: '/admin#users',
    },
  ];

  const handleLogout = async () => {
    try {
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Fetch uploaded questions
  useEffect(() => {
    fetchUploadedQuestions();
    
    // Refresh every 5 seconds to show newly uploaded questions
    const interval = setInterval(fetchUploadedQuestions, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchUploadedQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const response = await fetch('/api/questions');
      if (!response.ok) throw new Error('Failed to fetch questions');
      const result = await response.json();
      setUploadedQuestions(result.questions?.slice(0, 50) || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoadingQuestions(false);
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

  return (
    <>
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-screen bg-white z-40 transition-all duration-300 shadow-md ${
          isHovering || !isCollapsed ? 'w-64' : 'w-20'
        } overflow-hidden`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setIsCollapsed(true);
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between h-20 px-4 flex-shrink-0">
            <div className={`flex items-center gap-3 ${isHovering || !isCollapsed ? '' : 'justify-center w-full'}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white font-bold text-lg">Q</span>
              </div>
              {isHovering || !isCollapsed ? (
                <div>
                  <h1 className="text-gray-900 font-bold text-sm">Quiz Admin</h1>
                  <p className="text-xs text-gray-500">Dashboard</p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Main Menu Items */}
          <nav className="px-3 py-4 space-y-2 flex-shrink-0">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                onMouseEnter={() => setHoveredItem(`menu-${index}`)}
                onMouseLeave={() => setHoveredItem(null)}
                className="relative flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
              >
                <div className="w-5 h-5 flex-shrink-0 text-blue-600 group-hover:text-blue-700 transition-colors">
                  {item.icon}
                </div>
                {isHovering || !isCollapsed ? (
                  <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-transform">
                    {item.label}
                  </span>
                ) : null}
                {isCollapsed && hoveredItem === `menu-${index}` && (
                  <div className="absolute left-20 bg-white border border-gray-200 rounded-lg px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900 shadow-xl">
                    {item.label}
                  </div>
                )}
              </a>
            ))}
          </nav>

          {/* Recent Uploaded Questions */}
          <div className="px-3 py-4 flex-shrink-0 max-h-56 overflow-y-auto border-t border-gray-100">
            {!isCollapsed && isHovering && uploadedQuestions.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2">Uploaded Files</p>
                {Object.entries(groupedQuestions).map(([batchName, questions]) => (
                  <div key={batchName} className="space-y-1">
                    {/* File Header */}
                    <div className="px-2 py-1.5 bg-blue-100 rounded-lg border-l-4 border-blue-600">
                      <p className="text-xs font-bold text-blue-900">{batchName}</p>
                      <p className="text-xs text-blue-700">{questions.length} questions</p>
                    </div>
                    
                    {/* Questions in this batch */}
                    <div className="space-y-1 pl-1">
                      {questions.slice(0, 3).map((question, idx) => (
                        <div
                          key={`${batchName}-${idx}`}
                          onMouseEnter={() => setHoveredItem(`q-${batchName}-${idx}`)}
                          onMouseLeave={() => setHoveredItem(null)}
                          className="relative group"
                        >
                          <button
                            onClick={() => {
                              router.push('/admin/uploaded-questions');
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-md bg-white hover:bg-blue-50 border border-gray-200 transition-all duration-200 text-xs"
                          >
                            <div className="flex items-start gap-1.5">
                              <span className="text-blue-600 font-bold text-xs flex-shrink-0">Q{question.questionId}</span>
                              <span className="text-gray-700 line-clamp-1 text-xs">
                                {question.question?.substring(0, 25)}...
                              </span>
                            </div>
                          </button>

                          {/* Hover Tooltip */}
                          {hoveredItem === `q-${batchName}-${idx}` && (
                            <div className="absolute left-full ml-2 top-0 bg-white border border-blue-300 rounded-lg p-2.5 w-56 shadow-lg z-50 pointer-events-none">
                              <p className="text-xs text-blue-600 font-bold mb-0.5">Question #{question.questionId}</p>
                              <p className="text-xs text-gray-900 font-medium mb-1.5 leading-relaxed">
                                {question.question}
                              </p>
                              <div className="grid grid-cols-2 gap-0.5 text-xs">
                                <div className={`p-1 rounded text-xs ${question.correctAnswer === 'A' ? 'bg-green-100 border border-green-500 text-green-700 font-bold' : 'bg-gray-100 text-gray-700'}`}>
                                  A: {question.optionA?.substring(0, 12)}...
                                </div>
                                <div className={`p-1 rounded text-xs ${question.correctAnswer === 'B' ? 'bg-green-100 border border-green-500 text-green-700 font-bold' : 'bg-gray-100 text-gray-700'}`}>
                                  B: {question.optionB?.substring(0, 12)}...
                                </div>
                                <div className={`p-1 rounded text-xs ${question.correctAnswer === 'C' ? 'bg-green-100 border border-green-500 text-green-700 font-bold' : 'bg-gray-100 text-gray-700'}`}>
                                  C: {question.optionC?.substring(0, 12)}...
                                </div>
                                <div className={`p-1 rounded text-xs ${question.correctAnswer === 'D' ? 'bg-green-100 border border-green-500 text-green-700 font-bold' : 'bg-gray-100 text-gray-700'}`}>
                                  D: {question.optionD?.substring(0, 12)}...
                                </div>
                              </div>
                              <p className="text-xs text-green-600 font-semibold mt-1">✓ Answer: {question.correctAnswer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                      {questions.length > 3 && (
                        <p className="text-xs text-gray-500 px-2 py-1">+{questions.length - 3} more questions</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Empty Spacer */}
          <div className="flex-1"></div>

          {/* Divider */}
          <div className="px-3 py-4 flex-shrink-0">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              onMouseEnter={() => setHoveredItem('logout')}
              onMouseLeave={() => setHoveredItem(null)}
              className="relative w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
              title="Logout"
            >
              <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {isHovering || !isCollapsed ? <span className="text-sm font-medium">Logout</span> : null}
              {isCollapsed && hoveredItem === 'logout' && (
                <div className="absolute left-20 bg-white border border-gray-200 rounded-lg px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900 shadow-xl">
                  Logout
                </div>
              )}
            </button>
          </div>

          {/* Collapse Button */}
          <div className="p-3 flex-shrink-0">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              <svg className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
