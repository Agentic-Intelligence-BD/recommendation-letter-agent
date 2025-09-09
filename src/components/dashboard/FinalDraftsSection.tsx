'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, Calendar, User, GraduationCap, MoreHorizontal } from 'lucide-react';
import { Student, RecommendationRequest } from '@/types';

interface FinalDraft {
  id: string;
  studentName: string;
  collegeName: string;
  content: string;
  createdAt: Date;
  lastModified: Date;
  wordCount: number;
  status: 'draft' | 'finalized';
}

const mockFinalDrafts: FinalDraft[] = [
  {
    id: '1',
    studentName: 'Rashida Ahmed',
    collegeName: 'MIT',
    content: 'Dear Admissions Committee at MIT...',
    createdAt: new Date('2024-01-15'),
    lastModified: new Date('2024-01-16'),
    wordCount: 485,
    status: 'finalized'
  },
  {
    id: '2',
    studentName: 'Fahim Hassan',
    collegeName: 'Harvard University',
    content: 'Dear Admissions Officers at Harvard University...',
    createdAt: new Date('2024-01-12'),
    lastModified: new Date('2024-01-14'),
    wordCount: 520,
    status: 'draft'
  }
];

export default function FinalDraftsSection() {
  const [drafts] = useState<FinalDraft[]>(mockFinalDrafts);
  const [selectedDraft, setSelectedDraft] = useState<FinalDraft | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handlePreview = (draft: FinalDraft) => {
    setSelectedDraft(draft);
    setShowPreview(true);
  };

  const handleDownload = (draft: FinalDraft) => {
    const element = document.createElement('a');
    const file = new Blob([draft.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `recommendation-letter-${draft.studentName.replace(' ', '-').toLowerCase()}-${draft.collegeName.replace(' ', '-').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Final Drafts</h2>
          <p className="text-gray-600">Completed recommendation letters ready for submission</p>
        </div>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Final Drafts Yet</h3>
          <p className="text-gray-600">
            Complete the recommendation letter process to see your final drafts here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map((draft, index) => (
            <motion.div
              key={draft.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{draft.studentName}</h3>
                      <p className="text-sm text-gray-600">{draft.collegeName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        draft.status === 'finalized'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {draft.status === 'finalized' ? 'Finalized' : 'Draft'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {draft.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>{draft.wordCount} words</span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                <button
                  onClick={() => handlePreview(draft)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => handleDownload(draft)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedDraft && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowPreview(false)}
            />

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Recommendation Letter Preview
                  </h3>
                  <p className="text-gray-600">
                    {selectedDraft.studentName} → {selectedDraft.collegeName}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleDownload(selectedDraft)}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto bg-gray-50 p-6 rounded-lg border">
                <div className="whitespace-pre-wrap font-serif text-gray-900 leading-relaxed">
                  {selectedDraft.content}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>Created: {selectedDraft.createdAt.toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Modified: {selectedDraft.lastModified.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span>{selectedDraft.wordCount} words</span>
                  <span>•</span>
                  <span className={`font-medium ${
                    selectedDraft.status === 'finalized' ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {selectedDraft.status === 'finalized' ? 'Finalized' : 'Draft'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}