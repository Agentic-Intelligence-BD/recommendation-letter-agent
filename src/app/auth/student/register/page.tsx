'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { User, Mail, Lock, GraduationCap, Plus, X } from 'lucide-react';

interface CollegeTarget {
  name: string;
  type: 'liberal-arts' | 'research' | 'technical' | 'business' | 'other';
}

export default function StudentRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    grade: '',
    institution: '',
    gpa: '',
    subjects: [''],
    extracurriculars: [''],
    targetColleges: [{ name: '', type: 'other' as const }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSubject = () => {
    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, '']
    }));
  };

  const updateSubject = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map((subject, i) => i === index ? value : subject)
    }));
  };

  const removeSubject = (index: number) => {
    if (formData.subjects.length > 1) {
      setFormData(prev => ({
        ...prev,
        subjects: prev.subjects.filter((_, i) => i !== index)
      }));
    }
  };

  const addExtracurricular = () => {
    setFormData(prev => ({
      ...prev,
      extracurriculars: [...prev.extracurriculars, '']
    }));
  };

  const updateExtracurricular = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      extracurriculars: prev.extracurriculars.map((activity, i) => i === index ? value : activity)
    }));
  };

  const removeExtracurricular = (index: number) => {
    setFormData(prev => ({
      ...prev,
      extracurriculars: prev.extracurriculars.filter((_, i) => i !== index)
    }));
  };

  const addTargetCollege = () => {
    setFormData(prev => ({
      ...prev,
      targetColleges: [...prev.targetColleges, { name: '', type: 'other' }]
    }));
  };

  const updateTargetCollege = (index: number, field: keyof CollegeTarget, value: string) => {
    setFormData(prev => ({
      ...prev,
      targetColleges: prev.targetColleges.map((college, i) => 
        i === index ? { ...college, [field]: value } : college
      )
    }));
  };

  const removeTargetCollege = (index: number) => {
    if (formData.targetColleges.length > 1) {
      setFormData(prev => ({
        ...prev,
        targetColleges: prev.targetColleges.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/student/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          grade: formData.grade,
          institution: formData.institution,
          gpa: formData.gpa ? parseFloat(formData.gpa) : undefined,
          subjects: formData.subjects.filter(s => s.trim()),
          extracurriculars: formData.extracurriculars.filter(e => e.trim()),
          targetColleges: formData.targetColleges.filter(c => c.name.trim())
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store token and redirect to student dashboard
      localStorage.setItem('token', data.token);
      localStorage.setItem('userType', 'student');
      router.push('/student/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Student Account</h1>
          <p className="text-gray-600">
            Create your account to request recommendation letters from teachers
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Create a password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Grade
              </label>
              <select
                required
                value={formData.grade}
                onChange={(e) => handleInputChange('grade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select grade</option>
                <option value="9th">9th Grade</option>
                <option value="10th">10th Grade</option>
                <option value="11th">11th Grade</option>
                <option value="12th">12th Grade</option>
                <option value="A-Level">A-Level</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution
              </label>
              <input
                type="text"
                required
                value={formData.institution}
                onChange={(e) => handleInputChange('institution', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="School/College name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GPA (Optional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="5"
                value={formData.gpa}
                onChange={(e) => handleInputChange('gpa', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 4.5"
              />
            </div>
          </div>

          {/* Subjects */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subjects Studied
            </label>
            {formData.subjects.map((subject, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => updateSubject(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Mathematics, Physics, English"
                />
                {formData.subjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubject(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSubject}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Subject</span>
            </button>
          </div>

          {/* Extracurriculars */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extracurricular Activities (Optional)
            </label>
            {formData.extracurriculars.map((activity, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={activity}
                  onChange={(e) => updateExtracurricular(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Debate Club, Volleyball Team"
                />
                <button
                  type="button"
                  onClick={() => removeExtracurricular(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addExtracurricular}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Activity</span>
            </button>
          </div>

          {/* Target Colleges */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Colleges
            </label>
            {formData.targetColleges.map((college, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <input
                  type="text"
                  required
                  value={college.name}
                  onChange={(e) => updateTargetCollege(index, 'name', e.target.value)}
                  className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="College name"
                />
                <div className="flex items-center space-x-2">
                  <select
                    value={college.type}
                    onChange={(e) => updateTargetCollege(index, 'type', e.target.value as any)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="liberal-arts">Liberal Arts</option>
                    <option value="research">Research</option>
                    <option value="technical">Technical</option>
                    <option value="business">Business</option>
                    <option value="other">Other</option>
                  </select>
                  {formData.targetColleges.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTargetCollege(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addTargetCollege}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add College</span>
            </button>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <GraduationCap className="h-5 w-5" />
                <span>Create Student Account</span>
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/student/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in here
            </Link>
          </p>
          <p className="text-sm text-gray-500">
            Are you a teacher?{' '}
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              Teacher login
            </Link>
          </p>
          <p className="text-xs text-gray-400">
            <Link href="/" className="hover:text-gray-600">
              ← Back to main page
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}