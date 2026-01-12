'use client';

import Button from './Button';

export default function Hero() {
  return (
    <section className="min-h-screen bg-linear-to-br from-white via-blue-50 to-blue-100 flex items-center py-16 md:py-20">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 md:space-y-8">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Quiz Maker: Create a quiz to challenge your audience
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mt-4 md:mt-6 leading-relaxed">
                Make fun interactive quizzes to test your colleagues&apos; knowledge, run a quiz night with friends, or help students study.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="lg">
                Create a quiz
              </Button>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative h-96 sm:h-80 md:h-125 hidden sm:block">
            {/* Mock Browser Window */}
            <div className="absolute inset-0 bg-linear-to-br from-teal-400 to-blue-500 rounded-xl md:rounded-2xl transform -rotate-2 md:-rotate-3 opacity-20"></div>
            
            <div className="absolute inset-0 bg-white rounded-lg shadow-xl md:shadow-2xl overflow-hidden transform hover:shadow-2xl md:hover:shadow-3xl transition-shadow">
              {/* Browser Top */}
              <div className="bg-gray-800 px-3 md:px-4 py-2 md:py-3 flex items-center space-x-2">
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-red-500"></div>
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-yellow-500"></div>
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-green-500"></div>
              </div>

              {/* Browser Content */}
              <div className="p-4 md:p-8">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  What is the capital of Sweden?
                </h2>
                
                {/* Answer Options with Chart */}
                <div className="flex items-end justify-around mb-6 md:mb-8 h-32 md:h-40 gap-2">
                  <div className="text-center flex-1">
                    <div className="bg-blue-500 rounded-lg flex items-end justify-center text-white font-bold mb-2 mx-auto w-12 md:w-16 h-24 md:h-32">
                      3
                    </div>
                    <p className="text-xs md:text-sm font-medium text-gray-700">Stockholm</p>
                    <span className="text-xl md:text-2xl">✓</span>
                  </div>
                  <div className="text-center flex-1">
                    <div className="bg-red-300 rounded-lg flex items-end justify-center text-white font-bold mb-2 mx-auto w-12 md:w-16 h-16 md:h-20">
                      1
                    </div>
                    <p className="text-xs md:text-sm font-medium text-gray-700">Copenhagen</p>
                    <span className="text-xl md:text-2xl">✕</span>
                  </div>
                  <div className="text-center flex-1">
                    <div className="bg-red-300 rounded-lg flex items-end justify-center text-white font-bold mb-2 mx-auto w-12 md:w-16 h-14 md:h-16">
                      0
                    </div>
                    <p className="text-xs md:text-sm font-medium text-gray-700">Oslo</p>
                    <span className="text-xl md:text-2xl">✕</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8 bg-gray-900 rounded-2xl md:rounded-3xl border-4 md:border-8 border-gray-800 w-32 md:w-40 h-48 md:h-64 shadow-xl md:shadow-2xl transform rotate-12">
              <div className="bg-linear-to-b from-blue-500 to-purple-600 h-full rounded-2xl flex flex-col items-center justify-center p-3 md:p-4">
                <div className="text-4xl md:text-6xl mb-2 md:mb-4">😍</div>
                <p className="text-white text-center text-xs md:text-sm font-semibold">Correct answer!</p>
              </div>
            </div>

            {/* Floating Star */}
            <div className="absolute -bottom-2 md:-bottom-4 -right-2 md:-right-4 text-4xl md:text-6xl animate-bounce">⭐</div>
          </div>
        </div>
      </div>
    </section>
  );
}
