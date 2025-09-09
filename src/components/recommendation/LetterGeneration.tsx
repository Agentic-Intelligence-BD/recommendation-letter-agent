'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, RefreshCw, CheckCircle } from 'lucide-react';
import { generateRecommendationLetters } from '@/utils/letterGenerator';

interface LetterGenerationProps {
  student: any;
  college: any;
  answers: any[];
  onComplete: (letters: any[]) => void;
}

export default function LetterGeneration({ student, college, answers, onComplete }: LetterGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [generatedLetters, setGeneratedLetters] = useState<any[]>([]);

  useEffect(() => {
    // Auto-start generation when component loads
    startGeneration();
  }, []);

  const startGeneration = async () => {
    setIsGenerating(true);
    setProgress(0);

    // Step 1: Analyzing responses
    setCurrentStep('Analyzing your responses...');
    setProgress(10);
    await delay(1500);

    // Step 2: Tailoring to college values
    setCurrentStep(`Tailoring content for ${college.name}...`);
    setProgress(30);
    await delay(2000);

    // Step 3: Generating multiple drafts
    setCurrentStep('Generating multiple letter drafts...');
    setProgress(50);
    await delay(2000);

    try {
      // Generate the actual letters
      const letters = generateRecommendationLetters(student, college, answers);
      setGeneratedLetters(letters);

      // Step 4: Finalizing drafts
      setCurrentStep('Finalizing your recommendation letters...');
      setProgress(80);
      await delay(1500);

      // Step 5: Complete
      setCurrentStep('Complete! Generated 3 personalized letters.');
      setProgress(100);
      await delay(1000);

      setIsGenerating(false);
      
      // Brief pause before transitioning
      setTimeout(() => {
        onComplete(letters);
      }, 1500);

    } catch (error) {
      console.error('Error generating letters:', error);
      setCurrentStep('Error generating letters. Please try again.');
      setIsGenerating(false);
    }
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const regenerateLetters = () => {
    startGeneration();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border p-8"
    >
      <div className="text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              {isGenerating ? (
                <div className="animate-spin">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
              ) : (
                <CheckCircle className="h-8 w-8 text-white" />
              )}
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isGenerating ? 'Generating Your Letters' : 'Letters Ready!'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isGenerating 
              ? 'Our AI is crafting personalized recommendation letters based on your detailed responses.'
              : `Successfully generated ${generatedLetters.length} unique recommendation letters.`
            }
          </p>
        </div>

        {/* Progress Section */}
        {isGenerating && (
          <div className="mb-8">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </div>

            {/* Current Step */}
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="h-4 w-4 text-purple-600 animate-spin" />
              <span className="text-gray-700 font-medium">{currentStep}</span>
            </div>

            {/* Progress Percentage */}
            <div className="mt-2 text-2xl font-bold text-purple-600">
              {progress}%
            </div>
          </div>
        )}

        {/* Generation Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200"
          >
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Multiple Drafts</h3>
            <p className="text-gray-600 text-sm">
              3 different versions with formal, warm, and enthusiastic tones
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center p-6 bg-green-50 rounded-lg border border-green-200"
          >
            <Sparkles className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">College-Specific</h3>
            <p className="text-gray-600 text-sm">
              Tailored to {college.name}'s values and characteristics
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200"
          >
            <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized</h3>
            <p className="text-gray-600 text-sm">
              Based on your detailed responses about {student.name}
            </p>
          </motion.div>
        </div>

        {/* What's Being Generated */}
        {isGenerating && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Being Created:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-4 rounded border">
                <h4 className="font-medium text-gray-900 mb-2">📝 Formal Letter</h4>
                <p className="text-gray-600">Professional tone focusing on academic achievements</p>
              </div>
              <div className="bg-white p-4 rounded border">
                <h4 className="font-medium text-gray-900 mb-2">💝 Warm Letter</h4>
                <p className="text-gray-600">Personal tone emphasizing character and growth</p>
              </div>
              <div className="bg-white p-4 rounded border">
                <h4 className="font-medium text-gray-900 mb-2">⭐ Enthusiastic Letter</h4>
                <p className="text-gray-600">Energetic tone highlighting leadership potential</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        {!isGenerating && generatedLetters.length === 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={regenerateLetters}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Generate Letters</span>
          </motion.button>
        )}

        {/* Success Message */}
        {!isGenerating && generatedLetters.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <h3 className="text-xl font-semibold text-green-800">Generation Complete!</h3>
            </div>
            <p className="text-green-700 mb-4">
              Successfully created {generatedLetters.length} personalized recommendation letters.
              Transitioning to review interface...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}