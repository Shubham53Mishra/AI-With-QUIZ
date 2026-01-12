'use client';

import Button from './Button';

export default function Hero() {
  return (
    <section className="min-h-screen bg-linear-to-br from-white via-blue-50 to-blue-100 flex items-center">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Quiz Maker: Create a quiz to challenge your audience
              </h1>
              <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                Make fun interactive quizzes to test your colleagues&apos; knowledge, run a quiz night with friends, or help students study.
              </p>
            </div>
            <Button variant="primary" size="lg">
              Create a quiz
            </Button>
          </div>

          {/* Right Illustration */}
          <div className="relative h-125 hidden lg:block">
            {/* Mock Browser Window */}
            <div className="absolute inset-0 bg-linear-to-br from-teal-400 to-blue-500 rounded-2xl transform -rotate-3 opacity-20"></div>
            
            <div className="absolute inset-0 bg-white rounded-lg shadow-2xl overflow-hidden transform hover:shadow-3xl transition-shadow">
              {/* Browser Top */}
              <div className="bg-gray-800 px-4 py-3 flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>

              {/* Browser Content */}
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  What is the capital of Sweden?
                </h2>
                
                {/* Answer Options with Chart */}
                <div className="flex items-end justify-around mb-8 h-40">
                  <div className="text-center">
                    <div className="bg-blue-500 rounded-lg w-16 h-32 flex items-end justify-center text-white font-bold text-xl mb-2">
                      3
                    </div>
                    <p className="text-sm font-medium text-gray-700">Stockholm</p>
                    <span className="text-green-500 text-2xl">✓</span>
                  </div>
                  <div className="text-center">
                    <div className="bg-red-300 rounded-lg w-16 h-20 flex items-end justify-center text-white font-bold text-lg mb-2">
                      1
                    </div>
                    <p className="text-sm font-medium text-gray-700">Copenhagen</p>
                    <span className="text-red-500 text-2xl">✕</span>
                  </div>
                  <div className="text-center">
                    <div className="bg-red-300 rounded-lg w-16 h-16 flex items-end justify-center text-white font-bold mb-2">
                      0
                    </div>
                    <p className="text-sm font-medium text-gray-700">Oslo</p>
                    <span className="text-red-500 text-2xl">✕</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="absolute bottom-8 right-8 bg-gray-900 rounded-3xl border-8 border-gray-800 w-40 h-64 shadow-2xl transform rotate-12">
              <div className="bg-linear-to-b from-blue-500 to-purple-600 h-full rounded-2xl flex flex-col items-center justify-center p-4">
                <div className="text-6xl mb-4">😍</div>
                <p className="text-white text-center text-sm font-semibold">Correct answer!</p>
              </div>
            </div>

            {/* Floating Star */}
            <div className="absolute -bottom-4 -right-4 text-6xl animate-bounce">⭐</div>
          </div>
        </div>
      </div>
    </section>
  );
}
