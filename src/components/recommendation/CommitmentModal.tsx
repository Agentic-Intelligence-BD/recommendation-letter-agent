'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertTriangle, Coffee, PenTool, Lightbulb } from 'lucide-react';
import { Student, College } from '@/types';

interface CommitmentModalProps {
  student: Student;
  college: College;
  onAccept: () => void;
  onDecline: () => void;
}

export default function CommitmentModal({ student, college, onAccept, onDecline }: CommitmentModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border p-8"
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Time Commitment Required
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Writing a meaningful recommendation letter for <strong>{student.name}</strong> applying to{' '}
          <strong>{college.name}</strong> requires your focused attention and thoughtful responses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200"
        >
          <Clock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">30-40 Minutes</h3>
          <p className="text-gray-600 text-sm">
            Dedicated time for thoughtful responses to personalized questions about {student.name}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center p-6 bg-green-50 rounded-lg border border-green-200"
        >
          <Lightbulb className="h-8 w-8 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Deep Reflection</h3>
          <p className="text-gray-600 text-sm">
            Questions designed to capture meaningful stories and unique qualities of your student
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200"
        >
          <PenTool className="h-8 w-8 text-purple-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Output</h3>
          <p className="text-gray-600 text-sm">
            Multiple personalized drafts tailored to {college.name}'s values and expectations
          </p>
        </motion.div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 text-amber-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What to Expect</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Tailored questions based on {college.name}'s values: {college.values.join(', ')}</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Questions about academic performance, character, and extracurricular activities</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Specific examples and anecdotes that showcase {student.name}'s unique qualities</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>3-4 different recommendation letter drafts to choose from</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Coffee className="h-6 w-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Pro Tips for Success</h3>
        </div>
        <ul className="space-y-2 text-gray-700 text-sm">
          <li>• Find a quiet space where you can focus without interruptions</li>
          <li>• Have your gradebook or student records nearby for specific examples</li>
          <li>• Think about memorable moments, improvements, and unique characteristics</li>
          <li>• Remember: small details matter (like wiping the blackboard after class!)</li>
        </ul>
      </div>

      <div className="flex items-center justify-center space-x-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDecline}
          className="px-8 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
        >
          Not Now
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAccept}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
        >
          I'm Ready to Begin
        </motion.button>
      </div>
    </motion.div>
  );
}