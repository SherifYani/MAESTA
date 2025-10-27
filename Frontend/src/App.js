import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import Home from './components/Home';
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-3xl font-bold text-white">
                  🧲 JobMagnet
                </h1>
                <span className="mr-3 text-primary-200 text-sm">
                  منصة الوظائف الذكية
                </span>
              </div>
              <nav className="hidden md:flex space-x-8 space-x-reverse">
                <a href="#" className="text-white hover:text-primary-200 transition-colors duration-200">
                  الرئيسية
                </a>
                <a href="#" className="text-white hover:text-primary-200 transition-colors duration-200">
                  الوظائف
                </a>
                <a href="#" className="text-white hover:text-primary-200 transition-colors duration-200">
                  الشركات
                </a>
                <a href="#" className="text-white hover:text-primary-200 transition-colors duration-200">
                  تسجيل الدخول
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-secondary-800 text-white mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-secondary-300">
                © 2024 JobMagnet. جميع الحقوق محفوظة.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
