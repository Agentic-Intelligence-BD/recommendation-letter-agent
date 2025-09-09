'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Search, Users, FileText, Clock, CheckCircle, LogOut, User, Mail } from 'lucide-react';
import StudentCard from '@/components/dashboard/StudentCard';
import AddStudentModal from '@/components/dashboard/AddStudentModal';
import EditStudentModal from '@/components/student/EditStudentModal';
import TeacherRequestsPanel from '@/components/dashboard/TeacherRequestsPanel';
import { Student, RecommendationRequest } from '@/types';

const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Rashida Ahmed',
    email: 'rashida@email.com',
    grade: '12th',
    gpa: 4.2,
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
    extracurriculars: ['Science Olympiad', 'Math Club', 'Volunteer Teaching'],
    targetColleges: [
      {
        id: '1',
        name: 'MIT',
        type: 'technical',
        values: ['Innovation', 'Problem-solving', 'Collaboration'],
        characteristics: ['Technical excellence', 'Creative thinking', 'Leadership']
      }
    ],
    teacherId: '1',
    isStudentAccount: false,
    createdAt: new Date()
  },
  {
    id: '2',
    name: 'Fahim Hassan',
    email: 'fahim@email.com',
    grade: '12th',
    gpa: 3.9,
    subjects: ['English', 'History', 'Economics'],
    extracurriculars: ['Debate Club', 'Student Council', 'Community Service'],
    targetColleges: [
      {
        id: '2',
        name: 'Harvard University',
        type: 'liberal-arts',
        values: ['Academic excellence', 'Leadership', 'Service'],
        characteristics: ['Critical thinking', 'Social responsibility', 'Innovation']
      }
    ],
    teacherId: '1',
    isStudentAccount: false,
    createdAt: new Date()
  }
];

const mockRequests: RecommendationRequest[] = [
  {
    id: '1',
    studentId: '1',
    teacherId: '1',
    targetCollege: mockStudents[0].targetColleges[0],
    status: 'pending',
    questions: [],
    answers: [],
    generatedLetters: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [requests, setRequests] = useState<RecommendationRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'requests'>('students');

  useEffect(() => {
    loadStudents();
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const { getUserData } = await import('@/lib/api');
      const userData = getUserData();
      if (!userData) {
        router.push('/');
        return;
      }
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
      router.push('/');
    }
  };

  const handleLogout = async () => {
    try {
      const { removeAuthToken } = await import('@/lib/api');
      removeAuthToken();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const { studentsAPI } = await import('@/lib/api');
      const studentsData = await studentsAPI.getAll();
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowEditModal(true);
  };

  const handleStudentUpdate = (updatedStudent: Student) => {
    setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    setShowEditModal(false);
    setEditingStudent(null);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.subjects.some(subject => 
      subject.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const stats = {
    totalStudents: students.length,
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in-progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                {user ? `Welcome back, ${user.name}!` : 'Manage your students and recommendation letters'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <User className="h-4 w-4 text-gray-600" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-gray-500">{user.institution}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Student</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-sm border"
          >
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm border"
          >
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-sm border"
          >
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-sm border"
          >
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border mb-8">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'students', label: 'My Students', icon: Users },
              { id: 'requests', label: 'Student Requests', icon: Mail }
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

        {/* Tab Content */}
        {activeTab === 'students' && (
          <>
            {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search students by name or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Students Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <StudentCard
                  student={student}
                  onRequestRecommendation={(studentId, college) => {
                    console.log('Dashboard: onRequestRecommendation called with:', { studentId, college });
                    // Navigate to the recommendation workflow
                    router.push(`/recommendation/${studentId}?college=${college.id}`);
                  }}
                  onEditStudent={handleEditStudent}
                />
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No students found' : 'No students yet'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Add your first student to get started with recommendation letters'
              }
            </p>
          </div>
        )}
          </>
        )}

        {activeTab === 'requests' && (
          <TeacherRequestsPanel />
        )}
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddStudent={async (studentData) => {
          try {
            const { studentsAPI } = await import('@/lib/api');
            const newStudent = await studentsAPI.create(studentData);
            setStudents([...students, newStudent]);
            setShowAddModal(false);
          } catch (error) {
            console.error('Error creating student:', error);
            alert('Failed to create student. Please try again.');
          }
        }}
      />

      {/* Edit Student Modal */}
      {editingStudent && (
        <EditStudentModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingStudent(null);
          }}
          student={editingStudent}
          onUpdate={handleStudentUpdate}
        />
      )}
    </div>
  );
}