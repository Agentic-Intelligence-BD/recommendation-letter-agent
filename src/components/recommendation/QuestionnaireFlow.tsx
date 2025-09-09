'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, BookOpen, Users, Star, Heart, Target, CheckCircle } from 'lucide-react';
import { Student, College, Question, Answer } from '@/types';

interface QuestionnaireFlowProps {
  student: Student;
  college: College;
  onComplete: (answers: Answer[]) => void;
  recommendationId?: string;
  initialAnswers?: Answer[];
  initialQuestionIndex?: number;
}

const generateQuestions = (student: Student, college: College): Question[] => {
  const questions: Question[] = [
    // Academic Performance Questions
    {
      id: 'academic-1',
      text: `How would you describe ${student.name}'s academic performance in your class?`,
      category: 'academic',
      required: true,
      followUp: 'Can you provide a specific example of their academic excellence or improvement?'
    },
    {
      id: 'academic-2',
      text: `What sets ${student.name} apart academically from other students in their grade?`,
      category: 'academic',
      required: true,
    },
    
    // Character and Personal Qualities
    {
      id: 'character-1',
      text: `Describe ${student.name}'s character and personal qualities. What makes them unique as a person?`,
      category: 'character',
      required: true,
      followUp: 'Can you share a specific story or moment that exemplifies these qualities?'
    },
    {
      id: 'character-2',
      text: `Tell us about a time when ${student.name} showed exceptional integrity or moral character.`,
      category: 'character',
      required: true,
    },

    // Leadership and Social Responsibility
    {
      id: 'leadership-1',
      text: `Has ${student.name} demonstrated leadership qualities in your class or school? How?`,
      category: 'leadership',
      required: false,
      followUp: 'What was the impact of their leadership on others?'
    },
    {
      id: 'social-1',
      text: `How does ${student.name} interact with their peers and contribute to the classroom environment?`,
      category: 'social',
      required: true,
    },

    // Personal Anecdotes and Memorable Moments
    {
      id: 'personal-1',
      text: `Can you share a memorable moment or story about ${student.name} that shows their personality or character? (Even small gestures like helping clean the classroom matter!)`,
      category: 'personal',
      required: true,
    },
    {
      id: 'personal-2',
      text: `What would you want admissions officers at ${college.name} to know about ${student.name} that might not be evident from their grades or test scores?`,
      category: 'personal',
      required: true,
    },

    // College-specific questions based on college type
    ...getCollegeSpecificQuestions(student, college),
  ];

  return questions;
};

const getCollegeSpecificQuestions = (student: Student, college: College): Question[] => {
  const baseQuestions: Question[] = [];

  switch (college.type) {
    case 'technical':
      baseQuestions.push({
        id: 'tech-1',
        text: `${college.name} values innovation and problem-solving. How has ${student.name} demonstrated these qualities?`,
        category: 'extracurricular' as const,
        required: false,
      });
      break;
    case 'liberal-arts':
      baseQuestions.push({
        id: 'liberal-1',
        text: `${college.name} seeks students with intellectual curiosity and critical thinking skills. How has ${student.name} shown these traits?`,
        category: 'academic' as const,
        required: false,
      });
      break;
    case 'research':
      baseQuestions.push({
        id: 'research-1',
        text: `${college.name} is a research-focused institution. Has ${student.name} shown curiosity for research or independent inquiry?`,
        category: 'academic' as const,
        required: false,
      });
      break;
    case 'business':
      baseQuestions.push({
        id: 'business-1',
        text: `${college.name} looks for future leaders in business. How has ${student.name} demonstrated entrepreneurial thinking or business acumen?`,
        category: 'leadership' as const,
        required: false,
      });
      break;
  }

  return baseQuestions;
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'academic':
      return <BookOpen className="h-5 w-5" />;
    case 'social':
      return <Users className="h-5 w-5" />;
    case 'leadership':
      return <Star className="h-5 w-5" />;
    case 'character':
      return <Heart className="h-5 w-5" />;
    case 'personal':
      return <Target className="h-5 w-5" />;
    default:
      return <CheckCircle className="h-5 w-5" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'academic':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'social':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'leadership':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'character':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'personal':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export default function QuestionnaireFlow({ 
  student, 
  college, 
  onComplete, 
  recommendationId,
  initialAnswers = [],
  initialQuestionIndex = 0 
}: QuestionnaireFlowProps) {
  const [questions] = useState<Question[]>(generateQuestions(student, college));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialQuestionIndex);
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Initialize current answer from saved data
  useEffect(() => {
    const existingAnswer = answers.find(a => a.questionId === currentQuestion?.id);
    if (existingAnswer) {
      setCurrentAnswer(existingAnswer.response);
      setFollowUpAnswer(existingAnswer.notes || '');
      setShowFollowUp(!!existingAnswer.notes);
    } else {
      setCurrentAnswer('');
      setFollowUpAnswer('');
      setShowFollowUp(false);
    }
  }, [currentQuestionIndex, currentQuestion?.id, answers]);

  // Auto-save current answer as user types
  useEffect(() => {
    const saveCurrentAnswer = async () => {
      if (!recommendationId || !currentAnswer.trim() || isSaving) return;
      
      setIsSaving(true);
      try {
        // Create a current answer object
        const currentAnswerObj: Answer = {
          questionId: currentQuestion.id,
          response: currentAnswer,
          notes: showFollowUp ? followUpAnswer : undefined,
        };

        // Update answers array with current answer
        const updatedAnswers = answers.filter(a => a.questionId !== currentQuestion.id);
        if (currentAnswerObj.response.trim()) {
          updatedAnswers.push(currentAnswerObj);
        }

        const { recommendationsAPI } = await import('@/lib/api');
        await recommendationsAPI.saveProgress(recommendationId, {
          currentQuestionIndex,
          answers: updatedAnswers,
          phase: 'questionnaire',
        });
        console.log('Current answer auto-saved');
      } catch (error) {
        console.error('Failed to auto-save current answer:', error);
      } finally {
        setIsSaving(false);
      }
    };

    const timeoutId = setTimeout(saveCurrentAnswer, 3000); // Auto-save after 3 seconds of inactivity
    return () => clearTimeout(timeoutId);
  }, [recommendationId, currentQuestion?.id, currentAnswer, followUpAnswer, showFollowUp, currentQuestionIndex, answers, isSaving]);

  const handleNext = async () => {
    // Save current answer
    const answer: Answer = {
      questionId: currentQuestion.id,
      response: currentAnswer,
      notes: showFollowUp ? followUpAnswer : undefined,
    };

    // Update answers array - replace existing answer for this question or add new
    const updatedAnswers = answers.filter(a => a.questionId !== currentQuestion.id);
    updatedAnswers.push(answer);
    setAnswers(updatedAnswers);

    // Save progress immediately when moving to next question
    if (recommendationId) {
      try {
        const { recommendationsAPI } = await import('@/lib/api');
        await recommendationsAPI.saveProgress(recommendationId, {
          currentQuestionIndex: currentQuestionIndex + 1,
          answers: updatedAnswers,
          phase: 'questionnaire',
        });
      } catch (error) {
        console.error('Failed to save progress on next:', error);
      }
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Don't reset form fields - they'll be set by the useEffect
    } else {
      onComplete(updatedAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      // Save current answer before going back
      if (currentAnswer.trim()) {
        const answer: Answer = {
          questionId: currentQuestion.id,
          response: currentAnswer,
          notes: showFollowUp ? followUpAnswer : undefined,
        };
        const updatedAnswers = answers.filter(a => a.questionId !== currentQuestion.id);
        updatedAnswers.push(answer);
        setAnswers(updatedAnswers);
      }

      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Form fields will be set by the useEffect
    }
  };

  const canProceed = currentAnswer.trim().length > 10;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}% Complete
            </span>
            {isSaving && (
              <span className="text-xs text-blue-600 flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span>Saving...</span>
              </span>
            )}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-sm border p-8"
        >
          {/* Category Badge */}
          <div className="flex items-center space-x-2 mb-6">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getCategoryColor(currentQuestion.category)}`}>
              {getCategoryIcon(currentQuestion.category)}
              <span className="capitalize">{currentQuestion.category.replace('-', ' ')}</span>
            </div>
            {currentQuestion.required && (
              <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                Required
              </span>
            )}
          </div>

          {/* Question */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6 leading-relaxed">
            {currentQuestion.text}
          </h2>

          {/* Answer Input */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Response
              </label>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Please provide detailed response with specific examples..."
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {currentAnswer.length} characters (minimum 10 required)
                </p>
                {currentAnswer.length >= 10 && (
                  <p className="text-sm text-green-600">✓ Good length</p>
                )}
              </div>
            </div>

            {/* Follow-up Question */}
            {currentQuestion.followUp && (
              <div>
                <button
                  onClick={() => setShowFollowUp(!showFollowUp)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-3"
                >
                  {showFollowUp ? 'Hide' : 'Show'} follow-up question
                </button>
                
                <AnimatePresence>
                  {showFollowUp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h3 className="font-medium text-gray-900 mb-2">
                          Follow-up: {currentQuestion.followUp}
                        </h3>
                        <textarea
                          value={followUpAnswer}
                          onChange={(e) => setFollowUpAnswer(e.target.value)}
                          className="w-full h-32 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Optional: Provide additional details or examples..."
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                {currentQuestionIndex === questions.length - 1 
                  ? 'Last question! Almost done.' 
                  : `${questions.length - currentQuestionIndex - 1} questions remaining`
                }
              </p>
            </div>

            <motion.button
              whileHover={{ scale: canProceed ? 1.02 : 1 }}
              whileTap={{ scale: canProceed ? 0.98 : 1 }}
              onClick={handleNext}
              disabled={!canProceed}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
            >
              <span>
                {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
              </span>
              {currentQuestionIndex === questions.length - 1 ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}