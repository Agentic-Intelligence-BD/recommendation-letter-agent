'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { User, Mail, GraduationCap, Award, ExternalLink, FileText, Edit } from 'lucide-react';
import { Student, College } from '@/types';

interface StudentCardProps {
  student: Student;
  onRequestRecommendation: (studentId: string, college: College) => void;
  onEditStudent?: (student: Student) => void;
}

export default function StudentCard({ student, onRequestRecommendation, onEditStudent }: StudentCardProps) {
  const router = useRouter();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{student.email}</span>
              </div>
            </div>
          </div>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
            {student.grade} Grade
          </span>
        </div>
      </div>

      {/* Academic Info */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {student.gpa && (
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900">GPA: {student.gpa}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">{student.subjects.length} subjects</span>
          </div>
        </div>

        {/* Subjects */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Subjects:</p>
          <div className="flex flex-wrap gap-1">
            {student.subjects.slice(0, 3).map((subject, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
              >
                {subject}
              </span>
            ))}
            {student.subjects.length > 3 && (
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                +{student.subjects.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Extracurriculars */}
        {student.extracurriculars.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Activities:</p>
            <div className="flex flex-wrap gap-1">
              {student.extracurriculars.slice(0, 2).map((activity, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full"
                >
                  {activity}
                </span>
              ))}
              {student.extracurriculars.length > 2 && (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                  +{student.extracurriculars.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Target Colleges */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Target Colleges:</p>
          <div className="space-y-2">
            {student.targetColleges.slice(0, 2).map((college, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{college.name}</span>
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full capitalize">
                  {college.type.replace('-', ' ')}
                </span>
              </div>
            ))}
            {student.targetColleges.length > 2 && (
              <p className="text-xs text-gray-500">
                +{student.targetColleges.length - 2} more colleges
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t">
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/student/${student.id}`);
            }}
            className="flex items-center justify-center space-x-1 px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            <span>View</span>
          </button>
          {onEditStudent && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEditStudent(student);
              }}
              className="flex items-center justify-center space-x-1 px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="h-3 w-3" />
              <span>Edit</span>
            </button>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Write Letter clicked for student:', student.id, student.targetColleges[0]);
              onRequestRecommendation(student.id, student.targetColleges[0]);
            }}
            className="flex items-center justify-center space-x-1 px-2 py-2 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="h-3 w-3" />
            <span>Letter</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}