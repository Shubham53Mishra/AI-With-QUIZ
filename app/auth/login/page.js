'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import { getCurrentUser } from '../../../lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBlockReason('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if this is a blocked account error
        if (response.status === 403 && data.blockReason) {
          setError('Your account has been blocked');
          setBlockReason(data.blockReason);
        } else {
          setError(data.error || 'Login failed');
        }
        return;
      }

      setSuccess('Login successful!');
      setFormData({
        email: '',
        password: '',
      });

      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        window.location.href = '/quiz';
      }, 1500);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar user={user} />
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-4">
              Welcome Back
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Sign in to your account and continue creating amazing quizzes
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Form */}
            <div className="flex items-center justify-center">
              <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-center">
                  <h2 className="text-xl font-bold text-white">Sign In</h2>
                  <p className="text-blue-100 text-xs mt-1">Enter your credentials to continue</p>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {error && (
                    <div className={`border px-4 py-4 rounded-lg flex items-start gap-3 ${
                      blockReason 
                        ? 'bg-red-50 border-red-300' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <p className="font-semibold text-red-700">{error}</p>
                        {blockReason && (
                          <div className="mt-2 pt-2 border-t border-red-300">
                            <p className="text-sm text-red-600">
                              <span className="font-semibold">Reason for blocking:</span>
                            </p>
                            <p className="text-sm text-red-600 mt-1">{blockReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-3">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{success}</span>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-gray-50 hover:bg-white text-sm"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-gray-50 hover:bg-white text-sm"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 text-sm rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>

                {/* Footer Links */}
                <div className="border-t border-gray-100 px-8 py-4 text-center space-y-2">
                  <p className="text-gray-600 text-xs">
                    Don't have an account?{' '}
                    <Link
                      href="/auth/signup"
                      className="text-blue-600 font-semibold hover:text-blue-700 transition"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Features */}
            <div className="flex flex-col justify-center">
              <div className="space-y-6">
                <div className="text-center lg:text-left">
                  <h3 className="text-3xl font-bold text-gray-900 mb-8">Why Sign In?</h3>
                </div>

                <div className="flex gap-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">Access Your Quizzes</h4>
                    <p className="text-gray-600 text-base">View and manage all your created quizzes</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">Track Progress</h4>
                    <p className="text-gray-600 text-base">Monitor your quiz performance and analytics</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">Secure Account</h4>
                    <p className="text-gray-600 text-base">Your data is protected with secure authentication</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
