'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { GraduationCap, Users, FileText, Sparkles, BookOpen, User } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'teacher' | 'student' | null>(null);

  const handleLogin = async (data: any) => {
    try {
      const { authAPI, setAuthToken, setUserData } = await import('@/lib/api');
      const response = await authAPI.login(data);
      setAuthToken(response.token);
      setUserData(response.teacher);
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Login error:', error);
      alert(error.response?.data?.error || 'Login failed');
    }
  };

  const handleRegister = async (data: any) => {
    try {
      const { authAPI, setAuthToken, setUserData } = await import('@/lib/api');
      const response = await authAPI.register(data);
      setAuthToken(response.token);
      setUserData(response.teacher);
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Register error:', error);
      alert(error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 text-white p-12 flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <GraduationCap className="h-16 w-16 mb-4" />
            <h1 className="text-5xl font-bold mb-4">
              Recommendation Letter Assistant
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Empowering Bangladeshi teachers to write compelling recommendation letters for their students' US college applications
            </p>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start space-x-4"
            >
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-lg">
                  <Sparkles className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">AI-Powered Questions</h3>
                <p className="text-blue-100">
                  Get tailored questions based on target colleges and capture meaningful details about your students
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-start space-x-4"
            >
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-lg">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Multiple Drafts</h3>
                <p className="text-blue-100">
                  Generate 3-4 different recommendation letters and choose the one that best represents your student
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-start space-x-4"
            >
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-lg">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Student Management</h3>
                <p className="text-blue-100">
                  Organize student profiles and track recommendation requests all in one place
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Right side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <GraduationCap className="h-12 w-12 mx-auto text-blue-600 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Recommendation Letter Assistant
            </h1>
            <p className="text-gray-600">
              Help your students succeed with AI-powered recommendation letters
            </p>
          </div>

          {!userType ? (
            /* User Type Selection */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to Recommendation Letter Assistant
                </h2>
                <p className="text-gray-600 mb-8">
                  Choose your account type to get started
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Teacher Option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserType('teacher')}
                  className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        I'm a Teacher
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Write AI-powered recommendation letters for your students' college applications
                      </p>
                      <div className="mt-2 text-xs text-blue-600 font-medium">
                        • Manage students • Generate letters • Track progress
                      </div>
                    </div>
                  </div>
                </motion.button>

                {/* Student Option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserType('student')}
                  className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        I'm a Student
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Request recommendation letters from your teachers for college applications
                      </p>
                      <div className="mt-2 text-xs text-green-600 font-medium">
                        • Request letters • Track status • Manage profile
                      </div>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          ) : userType === 'student' ? (
            /* Student Auth - Redirect to dedicated pages */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Portal</h2>
                <p className="text-gray-600 mb-8">
                  Access your recommendation letter requests and profile
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => router.push('/auth/student/login')}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
                >
                  Student Sign In
                </button>
                <button
                  onClick={() => router.push('/auth/student/register')}
                  className="w-full bg-white text-green-600 py-3 px-4 rounded-lg font-semibold border-2 border-green-600 hover:bg-green-50 transition-colors duration-200"
                >
                  Create Student Account
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setUserType(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Back to user type selection
                </button>
              </div>
            </motion.div>
          ) : (
            /* Teacher Auth - Existing forms */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Teacher Portal</h2>
                <div className="text-center mb-4">
                  <button
                    onClick={() => setUserType(null)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Back to user type selection
                  </button>
                </div>
              </div>

              {isLogin ? (
                <LoginForm
                  onLogin={handleLogin}
                  onSwitchToRegister={() => setIsLogin(false)}
                />
              ) : (
                <RegisterForm
                  onRegister={handleRegister}
                  onSwitchToLogin={() => setIsLogin(true)}
                />
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}