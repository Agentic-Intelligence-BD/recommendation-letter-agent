'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  GraduationCap, 
  Award, 
  BookOpen, 
  Users, 
  Target,
  FileText,
  Edit,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { studentsAPI } from '@/lib/api';
import EditStudentModal from '@/components/student/EditStudentModal';

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'activities' | 'colleges'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);

  const studentId = params.id as string;

  useEffect(() => {
    loadStudent();
  }, [studentId]);

  const loadStudent = async () => {
    try {
      const students = await studentsAPI.getAll();
      const targetStudent = students.find((s: any) => s.id === studentId);
      
      if (!targetStudent) {
        alert('Student not found');
        router.push('/dashboard');
        return;
      }

      setStudent(targetStudent);
    } catch (error) {
      console.error('Error loading student:', error);
      alert('Error loading student data');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleStudentUpdate = (updatedStudent: any) => {
    setStudent(updatedStudent);
  };

  const handleWriteLetter = (college: any) => {
    router.push(`/recommendation/${studentId}?college=${college.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Loading student profile</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Student Profile
                </h1>
                <p className="text-gray-600">
                  {student.name}'s academic and personal information
                </p>
              </div>
            </div>

            <button
              onClick={handleEditProfile}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              {/* Profile Header */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{student.name}</h2>
                <p className="text-gray-600 flex items-center justify-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{student.email}</span>
                </p>
                <span className="inline-block mt-2 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {student.grade} Grade
                </span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {student.gpa && (
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Award className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-green-800">{student.gpa}</p>
                    <p className="text-xs text-green-600">GPA</p>
                  </div>
                )}
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-blue-800">{student.subjects.length}</p>
                  <p className="text-xs text-blue-600">Subjects</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-purple-800">{student.extracurriculars.length}</p>
                  <p className="text-xs text-purple-600">Activities</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <Target className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-amber-800">{student.targetColleges.length}</p>
                  <p className="text-xs text-amber-600">Colleges</p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleEditProfile}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => handleWriteLetter(student.targetColleges[0])}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>Write Letter</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="border-b">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview', icon: User },
                    { id: 'academic', label: 'Academic', icon: BookOpen },
                    { id: 'activities', label: 'Activities', icon: Users },
                    { id: 'colleges', label: 'Target Colleges', icon: Target },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h3>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                            <dl className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <dt className="text-gray-600">Full Name:</dt>
                                <dd className="font-medium">{student.name}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-gray-600">Email:</dt>
                                <dd className="font-medium">{student.email}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-gray-600">Grade:</dt>
                                <dd className="font-medium">{student.grade}</dd>
                              </div>
                              {student.gpa && (
                                <div className="flex justify-between">
                                  <dt className="text-gray-600">GPA:</dt>
                                  <dd className="font-medium">{student.gpa}</dd>
                                </div>
                              )}
                            </dl>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Quick Stats</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <BookOpen className="h-4 w-4 text-blue-600" />
                                <span>{student.subjects.length} Subjects</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-green-600" />
                                <span>{student.extracurriculars.length} Activities</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Target className="h-4 w-4 text-purple-600" />
                                <span>{student.targetColleges.length} Target Colleges</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-amber-600" />
                                <span>Added {new Date(student.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Academic Tab */}
                {activeTab === 'academic' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
                      
                      {student.gpa && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                          <div className="flex items-center space-x-3">
                            <Award className="h-8 w-8 text-green-600" />
                            <div>
                              <h4 className="font-semibold text-green-900">Academic Performance</h4>
                              <p className="text-green-700">Current GPA: <span className="font-bold text-lg">{student.gpa}</span></p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Subjects ({student.subjects.length})</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {student.subjects.map((subject: string, index: number) => (
                            <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                              <BookOpen className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                              <p className="text-sm font-medium text-blue-900">{subject}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Activities Tab */}
                {activeTab === 'activities' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Extracurricular Activities</h3>
                      
                      {student.extracurriculars.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {student.extracurriculars.map((activity: string, index: number) => (
                            <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <div className="flex items-center space-x-3">
                                <Users className="h-6 w-6 text-green-600" />
                                <div>
                                  <h4 className="font-medium text-green-900">{activity}</h4>
                                  <p className="text-sm text-green-700">Active participant</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-900 mb-2">No Activities Listed</h4>
                          <p className="text-gray-600">No extracurricular activities have been added yet.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Colleges Tab */}
                {activeTab === 'colleges' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Colleges</h3>
                      
                      <div className="space-y-4">
                        {student.targetColleges.map((college: any, index: number) => (
                          <div key={college.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                  <GraduationCap className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">{college.name}</h4>
                                  <p className="text-sm text-gray-600 capitalize mb-2">{college.type.replace('-', ' ')}</p>
                                  
                                  {college.values && (
                                    <div>
                                      <p className="text-sm font-medium text-gray-700 mb-2">College Values:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {college.values.map((value: string, idx: number) => (
                                          <span key={idx} className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                                            {value}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <button
                                onClick={() => handleWriteLetter(college)}
                                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <FileText className="h-4 w-4" />
                                <span>Write Letter</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Student Modal */}
      {student && (
        <EditStudentModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          student={student}
          onUpdate={handleStudentUpdate}
        />
      )}
    </div>
  );
}