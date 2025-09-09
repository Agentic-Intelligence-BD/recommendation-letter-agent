'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, X, RotateCcw, Type, Eye } from 'lucide-react';

interface LetterEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function LetterEditor({ content, onChange, onSave, onCancel }: LetterEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [originalContent] = useState(content);

  const handleReset = () => {
    onChange(originalContent);
  };

  const wordCount = content.split(' ').filter(word => word.length > 0).length;
  const charCount = content.length;

  return (
    <div className="space-y-4">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPreview(false)}
              className={`flex items-center space-x-2 px-3 py-1 text-sm rounded-lg ${
                !isPreview 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Type className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setIsPreview(true)}
              className={`flex items-center space-x-2 px-3 py-1 text-sm rounded-lg ${
                isPreview 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            {wordCount} words • {charCount} characters
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSave}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </motion.button>
        </div>
      </div>

      {/* Editor Content */}
      {isPreview ? (
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap font-serif text-gray-900 leading-relaxed p-6 bg-gray-50 rounded-lg border">
            {content}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-serif text-gray-900 leading-relaxed"
            placeholder="Edit your recommendation letter..."
          />
          
          {/* Editing Tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-amber-800 mb-2">Editing Tips:</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Keep the professional tone while making it personal</li>
              <li>• Include specific examples and anecdotes</li>
              <li>• Ensure the letter flows naturally from one paragraph to the next</li>
              <li>• Check that the student's name and college name are correct</li>
              <li>• Review for grammar and spelling before saving</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}