'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  GraduationCap, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Settings,
  LogOut,
  Book,
  Target
} from 'lucide-react';
import { Student, TeacherRequest } from '@/types';
import RequestTeacherModal from '@/components/student/RequestTeacherModal';

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'letters' | 'profile'>('overview');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [profileData, setProfileData] = useState({
    bio: '',
    supplementary: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userType = localStorage.getItem('userType');
      
      if (!token || userType !== 'student') {
        router.push('/auth/student/login');
        return;
      }

      // Decode token to get student ID
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Get student data
      const response = await fetch(`/api/students/${payload.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load student data');
      }

      const studentData = await response.json();
      setStudent(studentData);
      
      // Initialize profile data
      setProfileData({
        bio: studentData.bio || '',
        supplementary: studentData.supplementary || ''
      });
    } catch (error) {
      console.error('Error loading student data:', error);
      router.push('/auth/student/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    router.push('/auth/student/login');
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/students/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setStudent(data.student);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <FileText className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'accepted':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Getting your dashboard ready</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">Failed to load your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, {student.name}
                </h1>
                <p className="text-gray-600">{student.institution}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('profile')}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'requests', label: 'Teacher Requests', icon: Mail },
              { id: 'letters', label: 'Recommendation Letters', icon: FileText },
              { id: 'profile', label: 'Profile', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Academic Profile</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Grade:</span>
                      <span className="text-sm font-medium text-gray-900">{student.grade}</span>
                    </div>
                    {student.gpa && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">GPA:</span>
                        <span className="text-sm font-medium text-gray-900">{student.gpa}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Institution:</span>
                      <span className="text-sm font-medium text-gray-900">{student.institution}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Book className="h-4 w-4 text-gray-600" />
                    <h3 className="font-medium text-gray-900">Subjects</h3>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {student.subjects.map((subject, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>

                  {student.extracurriculars.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Target className="h-4 w-4 text-gray-600" />
                        <h3 className="font-medium text-gray-900">Activities</h3>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {student.extracurriculars.map((activity, index) => (
                          <span
                            key={index}
                            className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                          >
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Target Colleges</span>
                    <span className="font-semibold text-blue-600">
                      {student.targetColleges?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Pending Requests</span>
                    <span className="font-semibold text-amber-600">
                      {student.teacherRequests?.filter(r => r.status === 'pending').length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Completed Letters</span>
                    <span className="font-semibold text-green-600">
                      {student.recommendationRequests?.filter(r => r.status === 'completed').length || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Need a Recommendation?</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Request a letter from your teachers to support your college applications
                </p>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  Request Letter
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'requests' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Teacher Requests</h2>
              <button 
                onClick={() => setShowRequestModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Request Letter</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              {student.teacherRequests && student.teacherRequests.length > 0 ? (
                <div className="divide-y">
                  {student.teacherRequests.map((request) => (
                    <div key={request.id} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {request.teacher?.name || 'Teacher'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {request.teacher?.institution}
                            </p>
                          </div>
                        </div>
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="capitalize">{request.status}</span>
                        </div>
                      </div>
                      
                      {request.message && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-700">{request.message}</p>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Requested on {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't requested any recommendation letters from teachers yet.
                  </p>
                  <button 
                    onClick={() => setShowRequestModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    Send Your First Request
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'letters' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900">Recommendation Letters</h2>

            <div className="bg-white rounded-lg shadow-sm border">
              {student.recommendationRequests && student.recommendationRequests.length > 0 ? (
                <div className="divide-y">
                  {student.recommendationRequests.map((request) => (
                    <div key={request.id} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Letter for {request.college?.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            From {request.teacher?.name}
                          </p>
                        </div>
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="capitalize">{request.status}</span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Created on {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No letters yet</h3>
                  <p className="text-gray-600">
                    Your recommendation letters will appear here once teachers start working on them.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <p className="text-gray-600 mb-4">
                Update your profile information and personal essay (bio) that teachers can use when writing your recommendations.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personal Essay / Bio
                  </label>
                  <textarea
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Write about yourself, your goals, achievements, and what makes you unique. This will help teachers write more personalized letters."
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This information is only visible to teachers who are writing your recommendations.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Information
                  </label>
                  <textarea
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any additional context, achievements, or information you'd like teachers to know when writing your letters."
                    value={profileData.supplementary}
                    onChange={(e) => setProfileData(prev => ({ ...prev, supplementary: e.target.value }))}
                  />
                </div>

                <button 
                  onClick={handleProfileSave}
                  disabled={savingProfile}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {savingProfile ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Request Teacher Modal */}
      <RequestTeacherModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSuccess={() => {
          // Reload student data to show new request
          loadStudentData();
        }}
      />
    </div>
  );
}