import React, { useState, useEffect } from 'react';
import ApiService from '../services/ApiService';

const Home = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ApiService.testConnection();
        setStatus(response);
      } catch (error) {
        setError('فشل في الاتصال بالخادم');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          مرحباً بك في 
          <span className="text-primary-600"> JobMagnet</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          منصة الوظائف الذكية التي تربط بين أصحاب العمل والباحثين عن فرص مهنية مميزة
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-primary text-lg px-8 py-3">
            ابحث عن وظيفة
          </button>
          <button className="btn-secondary text-lg px-8 py-3">
            أضف وظيفة
          </button>
        </div>
      </div>

      {/* Status Card */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center ml-4">
              <span className="text-2xl">🔗</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">حالة الاتصال</h3>
              <p className="text-sm text-gray-600">اتصال الواجهة بالخادم</p>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="mr-3 text-gray-600">جاري التحقق...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-red-500 text-xl ml-2">❌</span>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-green-500 text-xl ml-2">✅</span>
                <span className="text-green-700 font-medium">{status?.message}</span>
              </div>
              {status?.data && (
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>حالة API:</strong> {status.data.ApiStatus}</p>
                  <p><strong>قاعدة البيانات:</strong> {status.data.DatabaseConnection}</p>
                  <p><strong>الإصدار:</strong> {status.data.Version}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Features Cards */}
        <div className="card">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center ml-4">
              <span className="text-2xl">💼</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">الوظائف</h3>
              <p className="text-sm text-gray-600">تصفح آلاف الوظائف</p>
            </div>
          </div>
          <p className="text-gray-600">
            اكتشف فرص عمل مميزة في مختلف المجالات والتخصصات
          </p>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center ml-4">
              <span className="text-2xl">🏢</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">الشركات</h3>
              <p className="text-sm text-gray-600">انضم لأفضل الشركات</p>
            </div>
          </div>
          <p className="text-gray-600">
            تواصل مع أرقى الشركات وأصحاب العمل في السوق
          </p>
        </div>
      </div>

      {/* API Documentation Link */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            📚 وثائق الـ API
          </h3>
          <p className="text-gray-600 mb-4">
            استكشف وثائق الـ API الكاملة مع أمثلة تفاعلية
          </p>
          <a 
            href="https://localhost:7000/swagger" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center"
          >
            <span className="ml-2">🔗</span>
            فتح Swagger UI
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
