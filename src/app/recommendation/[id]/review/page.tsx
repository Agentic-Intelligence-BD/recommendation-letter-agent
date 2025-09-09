'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Edit3, Download, Save, CheckCircle, RefreshCw } from 'lucide-react';
import LetterCard from '@/components/review/LetterCard';
import LetterEditor from '@/components/review/LetterEditor';
import { Student, College, GeneratedLetter } from '@/types';
import { generateRecommendationLetters } from '@/utils/letterGenerator';

// Mock data
const mockStudent = {
  id: '1',
  name: 'Rashida Ahmed',
  email: 'rashida@email.com',
  grade: '12th',
  gpa: 4.2,
  subjects: ['Mathematics', 'Physics', 'Chemistry'],
  extracurriculars: ['Science Olympiad', 'Math Club', 'Volunteer Teaching'],
  targetColleges: [{
    id: '1',
    name: 'MIT',
    type: 'technical' as const,
    values: ['Innovation', 'Problem-solving', 'Collaboration'],
    characteristics: ['Technical excellence', 'Creative thinking', 'Leadership']
  }],
  teacherId: '1',
  isStudentAccount: false,
  createdAt: new Date()
};

const mockAnswers = [
  {
    questionId: 'academic-1',
    response: 'Rashida has been one of my top students in advanced mathematics. She consistently demonstrates exceptional problem-solving abilities and often helps other students understand complex concepts.',
    notes: 'She scored the highest in our class on the calculus final exam.'
  },
  {
    questionId: 'character-1',
    response: 'Rashida shows remarkable integrity and dedication. She always submits her work on time and takes responsibility for her learning.',
  },
  {
    questionId: 'personal-1',
    response: 'I remember one particular instance where Rashida stayed after class every day for a week to help a struggling classmate understand quadratic equations. She also always cleans the whiteboard after each class without being asked.',
  }
];

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [generatedLetters, setGeneratedLetters] = useState<GeneratedLetter[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<GeneratedLetter | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate letter generation
    const timer = setTimeout(() => {
      const letters = generateRecommendationLetters(
        mockStudent,
        mockStudent.targetColleges[0],
        mockAnswers
      );
      setGeneratedLetters(letters);
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSelectLetter = (letter: GeneratedLetter) => {
    setSelectedLetter(letter);
    setEditedContent(letter.content);
    setIsEditing(false);
  };

  const handleEditLetter = () => {
    setIsEditing(true);
  };

  const handleSaveEdits = () => {
    if (selectedLetter) {
      const updatedLetter = { ...selectedLetter, content: editedContent };
      setSelectedLetter(updatedLetter);
      setIsEditing(false);
    }
  };

  const handleSaveAsFinal = () => {
    // Logic to save as final draft would go here
    console.log('Saving as final draft:', selectedLetter);
    router.push('/dashboard');
  };

  const handleDownload = () => {
    if (selectedLetter) {
      const element = document.createElement('a');
      const file = new Blob([selectedLetter.content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `recommendation-letter-${mockStudent.name.replace(' ', '-').toLowerCase()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleBack = () => {
    router.push(`/recommendation/${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Letters</h2>
          <p className="text-gray-600 max-w-md">
            Our AI is crafting personalized recommendation letters based on your responses. 
            This may take a moment...
          </p>
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
              <button
                onClick={handleBack}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Review Generated Letters</h1>
                <p className="text-gray-600">
                  Choose and customize your recommendation letter for {mockStudent.name}
                </p>
              </div>
            </div>

            {selectedLetter && (
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveAsFinal}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="h-4 w-4" />
                  <span>Save as Final</span>
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Letter Options */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Generated Letters</h2>
              </div>
              <p className="text-gray-600 text-sm mb-6">
                Choose from {generatedLetters.length} AI-generated letters with different tones and focuses.
              </p>
              
              <div className="space-y-3">
                {generatedLetters.map((letter, index) => (
                  <LetterCard
                    key={letter.id}
                    letter={letter}
                    index={index}
                    isSelected={selectedLetter?.id === letter.id}
                    onSelect={() => handleSelectLetter(letter)}
                  />
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Letter Statistics</h3>
              {selectedLetter && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Word Count:</span>
                    <span className="font-medium">{selectedLetter.content.split(' ').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Character Count:</span>
                    <span className="font-medium">{selectedLetter.content.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tone:</span>
                    <span className="font-medium capitalize">{selectedLetter.tone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Focus Areas:</span>
                    <span className="font-medium">{selectedLetter.focus.length}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Letter Preview/Editor */}
          <div className="lg:col-span-2">
            {selectedLetter ? (
              <div className="bg-white rounded-lg shadow-sm border">
                {/* Letter Header */}
                <div className="border-b p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {isEditing ? 'Editing Letter' : 'Letter Preview'}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {selectedLetter.tone} tone • Focus: {selectedLetter.focus.join(', ')}
                      </p>
                    </div>
                    {!isEditing && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleEditLetter}
                        className="flex items-center space-x-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>Edit Letter</span>
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Letter Content */}
                <div className="p-6">
                  {isEditing ? (
                    <LetterEditor
                      content={editedContent}
                      onChange={setEditedContent}
                      onSave={handleSaveEdits}
                      onCancel={() => setIsEditing(false)}
                    />
                  ) : (
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap font-serif text-gray-900 leading-relaxed">
                        {selectedLetter.content}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a Letter to Preview
                </h3>
                <p className="text-gray-600">
                  Choose one of the generated letters from the left sidebar to preview and edit.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}