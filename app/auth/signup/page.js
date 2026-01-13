'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Button from '../../../components/Button';
import { Country, State, City } from 'country-state-city';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    city: '',
    country: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [countries, setCountries] = useState([]);
  const [countriesLoaded, setCountriesLoaded] = useState(false);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [citiesLoading, setCitiesLoading] = useState(false);

  const loadCountries = async () => {
    if (countriesLoaded || countriesLoading) return;
    
    setCountriesLoading(true);
    try {
      const countryList = Country.getAllCountries();
      setCountries(countryList);
      setCountriesLoaded(true);
    } catch (err) {
      console.error('Failed to load countries:', err);
    } finally {
      setCountriesLoading(false);
    }
  };

  const loadCities = (countryCode) => {
    setCitiesLoading(true);
    try {
      // Get all states for the country first
      const states = State.getStatesOfCountry(countryCode);
      console.log(`States for ${countryCode}:`, states);
      
      let allCities = [];
      
      // Get cities from each state
      if (states && states.length > 0) {
        states.forEach((state) => {
          try {
            const stateCities = City.getCitiesOfState(countryCode, state.isoCode);
            console.log(`Cities in state ${state.name}:`, stateCities);
            if (stateCities && stateCities.length > 0) {
              allCities = [...allCities, ...stateCities];
            }
          } catch (stateErr) {
            console.log(`Error loading cities for state ${state.isoCode}:`, stateErr);
          }
        });
      } else {
        console.warn(`No states found for country ${countryCode}`);
      }
      
      // Sort cities by name
      allCities.sort((a, b) => a.name.localeCompare(b.name));
      
      setCities(allCities);
      setSelectedCountryCode(countryCode);
      console.log(`Total loaded ${allCities.length} cities for country ${countryCode}`);
    } catch (err) {
      console.error('Failed to load cities:', err);
      setCities([]);
    } finally {
      setCitiesLoading(false);
    }
  };

  const handleCountryChange = (e) => {
    const countryName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      country: countryName,
      city: '',
    }));
    
    const selectedCountry = countries.find(c => c.name === countryName);
    if (selectedCountry) {
      loadCities(selectedCountry.isoCode);
    } else {
      setCities([]);
      setSelectedCountryCode('');
    }
  };

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
      const response = await fetch('/api/auth/signup', {
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

      setSuccess('Account created successfully!');
      setFormData({
        username: '',
        email: '',
        password: '',
        name: '',
        city: '',
        country: '',
      });

      // Redirect to login after 1.5 seconds
      setTimeout(() => {
        router.push('/auth/login');
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
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-4">
              Create Your Account
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of learners and create amazing quizzes in minutes
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Form */}
            <div className="flex items-center justify-center">
              <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-center">
                  <h2 className="text-xl font-bold text-white">Get Started</h2>
                  <p className="text-blue-100 text-xs mt-1">Sign up for free today</p>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-3">
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-gray-50 hover:bg-white text-sm"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="johndoe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-gray-50 hover:bg-white text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
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

              {/* Country */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Country
                </label>
                <Select value={formData.country} onValueChange={(value) => {
                  const selectedCountry = countries.find(c => c.name === value);
                  setFormData((prev) => ({
                    ...prev,
                    country: value,
                    city: '',
                  }));
                  if (selectedCountry) {
                    loadCities(selectedCountry.isoCode);
                  } else {
                    setCities([]);
                    setSelectedCountryCode('');
                  }
                }} onOpenChange={(open) => {
                  if (open && !countriesLoaded) {
                    loadCountries();
                  }
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={countriesLoading ? 'Loading countries...' : 'Select a country'} />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.isoCode} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City - Only show after country is selected */}
              {formData.country && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  <Select value={formData.city} onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      city: value,
                    }));
                  }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={citiesLoading ? 'Loading cities...' : 'Select a city'} />
                    </SelectTrigger>
                    <SelectContent>
                      {cities && cities.length > 0 ? (
                        cities.map((city, index) => (
                          <SelectItem key={`${city.name}-${index}`} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))
                      ) : null}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
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
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 text-sm rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Footer Links */}
            <div className="border-t border-gray-100 px-8 py-3 text-center">
              <p className="text-gray-600 text-xs">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
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
                  <h3 className="text-3xl font-bold text-gray-900 mb-8">Why Join Us?</h3>
                </div>

                <div className="flex gap-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">Quick Setup</h4>
                    <p className="text-gray-600 text-base">Create and publish quizzes in minutes</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">Easy Customization</h4>
                    <p className="text-gray-600 text-base">Personalize your quizzes with custom themes</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">Instant Results</h4>
                    <p className="text-gray-600 text-base">Get real-time analytics and insights</p>
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
