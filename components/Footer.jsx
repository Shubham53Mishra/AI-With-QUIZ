'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 lg:gap-12 mb-8 md:mb-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">Q</span>
              </div>
              <span className="text-lg sm:text-xl font-bold">Quiz Creator</span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">
              Create engaging quizzes and challenge your audience with interactive learning experiences.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-base mb-3">Product</h3>
            <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
              <li><a href="#" className="hover:text-white transition">Features</a></li>
              <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition">Security</a></li>
              <li><a href="#" className="hover:text-white transition">Templates</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-base mb-3">Company</h3>
            <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
              <li><a href="#" className="hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-base mb-3">Legal</h3>
            <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
              <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms</a></li>
              <li><a href="#" className="hover:text-white transition">Cookies</a></li>
              <li><a href="#" className="hover:text-white transition">License</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-6 md:pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
              © {currentYear} Quiz Creator. All rights reserved.
            </p>
            <div className="flex items-center gap-4 sm:gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <span className="sr-only">Twitter</span>
                <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.29 20v-7.21H5.5V9.25h2.79V7.07c0-2.77 1.69-4.28 4.16-4.28 1.18 0 2.2.09 2.5.13v2.9h-1.72c-1.34 0-1.6.64-1.6 1.57v2.05h3.2l-.41 3.54h-2.79V20" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.447 16.447h-2.769v-4.339c0-1.04-.037-2.378-1.449-2.378-1.449 0-1.671 1.132-1.671 2.301v4.416h-2.768V7.5h2.657v1.224h.037c.371-.704 1.278-1.449 2.63-1.449 2.814 0 3.335 1.851 3.335 4.262v4.91zM3.819 6.206a1.607 1.607 0 11.001-3.213 1.607 1.607 0 01-.001 3.213zm1.388 10.241H2.43V7.5h2.777v8.947zM17.812 0H.198C.088 0 0 .087 0 .198v19.604c0 .11.088.198.198.198h17.614c.11 0 .198-.088.198-.198V.198C18.01.087 17.922 0 17.812 0z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
