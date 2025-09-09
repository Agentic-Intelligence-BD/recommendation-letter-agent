'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Edit, Eye, Download, CheckCircle, Star, Sparkles, RefreshCw } from 'lucide-react';
import { Student, College, GeneratedLetter } from '@/types';

interface LetterReviewProps {
  student: Student;
  college: College;
  letters: GeneratedLetter[];
  onSaveLetter: (letterId: string, content: string) => void;
  onSelectFinalLetter: (letterId: string) => void;
}

export default function LetterReview({ student, college, letters, onSaveLetter, onSelectFinalLetter }: LetterReviewProps) {
  const [selectedLetter, setSelectedLetter] = useState<string>(letters[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const currentLetter = letters.find(l => l.id === selectedLetter);

  const startEditing = () => {
    if (currentLetter) {
      setEditedContent(currentLetter.content);
      setIsEditing(true);
    }
  };

  const saveEdits = () => {
    if (currentLetter) {
      onSaveLetter(currentLetter.id, editedContent);
      setIsEditing(false);
    }
  };

  const cancelEdits = () => {
    setIsEditing(false);
    setEditedContent('');
  };

  const getToneIcon = (tone: string) => {
    switch (tone) {
      case 'formal':
        return <FileText className="h-5 w-5" />;
      case 'warm':
        return <Star className="h-5 w-5" />;
      case 'enthusiastic':
        return <Sparkles className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'formal':
        return 'border-blue-200 bg-blue-50 text-blue-700';
      case 'warm':
        return 'border-green-200 bg-green-50 text-green-700';
      case 'enthusiastic':
        return 'border-purple-200 bg-purple-50 text-purple-700';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Review & Edit Letters
        </h1>
        <p className="text-gray-600">
          Review the generated recommendation letters for {student.name}'s application to {college.name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Letter Selection Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Letters</h3>
            
            <div className="space-y-3">
              {letters.map((letter, index) => (
                <motion.button
                  key={letter.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedLetter(letter.id)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedLetter === letter.id 
                      ? getToneColor(letter.tone) + ' border-opacity-100' 
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getToneColor(letter.tone)}`}>
                      {getToneIcon(letter.tone)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold capitalize text-gray-900">
                        {letter.tone} Letter
                      </h4>
                      <p className="text-sm text-gray-600">
                        {letter.wordCount} words
                      </p>
                    </div>
                    {selectedLetter === letter.id && (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {letter.content.substring(0, 100)}...
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Generate New Letter Button */}
            <button className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center space-x-2">
              <RefreshCw className="h-4 w-4" />
              <span>Generate Another Version</span>
            </button>
          </div>
        </div>

        {/* Letter Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            {/* Toolbar */}
            <div className="px-6 py-4 border-b bg-gray-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-full ${getToneColor(currentLetter?.tone || 'formal')}`}>
                      {getToneIcon(currentLetter?.tone || 'formal')}
                    </div>
                    <div>
                      <h3 className="font-semibold capitalize text-gray-900">
                        {currentLetter?.tone || 'Formal'} Letter
                      </h3>
                      <p className="text-sm text-gray-600">
                        {currentLetter?.wordCount || 0} words
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                      previewMode 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Eye className="h-4 w-4" />
                    <span>Preview</span>
                  </button>
                  
                  {!isEditing ? (
                    <button
                      onClick={startEditing}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={cancelEdits}
                        className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveEdits}
                        className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Save</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Letter Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    key="editing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm leading-relaxed resize-none"
                      placeholder="Edit your letter content here..."
                    />
                    <div className="mt-2 text-sm text-gray-500">
                      {editedContent.length} characters, ~{Math.ceil(editedContent.split(/\s+/).length)} words
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="viewing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={previewMode ? 'letter-preview' : ''}
                  >
                    <div className="prose max-w-none">
                      {previewMode ? (
                        <div className="bg-white p-8 border border-gray-300 rounded-lg shadow-sm font-serif">
                          <div className="whitespace-pre-line leading-relaxed">
                            {currentLetter?.content || ''}
                          </div>
                        </div>
                      ) : (
                        <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                          {currentLetter?.content || ''}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <FileText className="h-4 w-4" />
                <span>Export Word</span>
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => currentLetter && onSelectFinalLetter(currentLetter.id)}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Select as Final Letter</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}