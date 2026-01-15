'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthNavbar from '../../../components/AuthNavbar';
import { getCurrentUser } from '../../../lib/auth';

export default function AdminSignupPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    adminCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);

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
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/admin-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      setSuccess('Admin account created successfully!');
      setFormData({
        email: '',
        password: '',
        name: '',
        adminCode: '',
      });

      // Redirect to admin login
      setTimeout(() => {
        window.location.href = '/auth/admin-login';
      }, 1000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthNavbar user={user} isAdmin={true} />
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-4">
              Admin Registration
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create an admin account to manage quizzes and users
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Form */}
            <div className="flex items-center justify-center">
              <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-center">
                  <h2 className="text-xl font-bold text-white">Create Admin Account</h2>
                  <p className="text-blue-100 text-xs mt-1">Enter your details below</p>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>{error}</span>
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

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Admin Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-gray-50 hover:bg-white text-sm"
                    />
                  </div>

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
                      placeholder="admin@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-gray-50 hover:bg-white text-sm"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition bg-gray-50 hover:bg-white text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  {/* Admin Code */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Admin Code
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminCode ? 'text' : 'password'}
                        name="adminCode"
                        value={formData.adminCode}
                        onChange={handleChange}
                        required
                        placeholder="Enter admin code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-gray-50 hover:bg-white text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminCode(!showAdminCode)}
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                      >
                        {showAdminCode ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 text-sm rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
                  </button>
                </form>

                {/* Footer Links */}
                <div className="border-t border-gray-100 px-8 py-4 text-center space-y-2">
                  <p className="text-gray-600 text-xs">
                    Already have an admin account?{' '}
                    <Link
                      href="/auth/admin-login"
                      className="text-blue-600 font-semibold hover:text-blue-700 transition"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Features */}
            <div className="flex flex-col justify-center">
              <div className="space-y-6">
                <div className="text-center lg:text-left">
                  <h3 className="text-3xl font-bold text-gray-900 mb-8">Admin Privileges</h3>
                </div>

                <div className="flex gap-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">Full Control</h4>
                    <p className="text-gray-600 text-base">Manage all quizzes and user accounts</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">Advanced Analytics</h4>
                    <p className="text-gray-600 text-base">Access detailed insights and reports</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">System Management</h4>
                    <p className="text-gray-600 text-base">Configure settings and manage content</p>
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
