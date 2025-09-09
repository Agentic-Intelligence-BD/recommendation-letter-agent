'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, User, GraduationCap, Target, Clock } from 'lucide-react';
import { studentsAPI, recommendationsAPI } from '@/lib/api';
import CommitmentModal from '@/components/recommendation/CommitmentModal';
import QuestionnaireFlow from '@/components/recommendation/QuestionnaireFlow';
import LetterGeneration from '@/components/recommendation/LetterGeneration';
import LetterReview from '@/components/recommendation/LetterReview';

type WorkflowPhase = 'loading' | 'commitment' | 'questionnaire' | 'generation' | 'review';

export default function RecommendationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [phase, setPhase] = useState<WorkflowPhase>('loading');
  const [student, setStudent] = useState<any>(null);
  const [college, setCollege] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [generatedLetters, setGeneratedLetters] = useState<any[]>([]);
  const [recommendationId, setRecommendationId] = useState<string | null>(null);
  const [savedProgress, setSavedProgress] = useState<any>(null);
  const [commitmentStarted, setCommitmentStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const studentId = params.id as string;
  const collegeId = searchParams.get('college');

  useEffect(() => {
    loadRecommendationData();
  }, [studentId, collegeId]);

  const loadRecommendationData = async () => {
    try {
      // Get all students to find the one we need
      const students = await studentsAPI.getAll();
      const targetStudent = students.find((s: any) => s.id === studentId);
      
      if (!targetStudent) {
        alert('Student not found');
        router.push('/dashboard');
        return;
      }

      const targetCollege = targetStudent.targetColleges.find((c: any) => c.id === collegeId);
      
      if (!targetCollege) {
        alert('College not found');
        router.push('/dashboard');
        return;
      }

      setStudent(targetStudent);
      setCollege(targetCollege);

      // Start or load existing recommendation request
      try {
        const recommendation = await recommendationsAPI.start(studentId, collegeId!);
        setRecommendationId(recommendation.id);
        setSavedProgress(recommendation);
        
        // Try to get detailed progress including question position
        try {
          const detailedProgress = await recommendationsAPI.getDetailedProgress(recommendation.id);
          setCurrentQuestionIndex(detailedProgress.currentQuestionIndex || 0);
          
          if (detailedProgress.recommendation.answers?.length > 0) {
            setAnswers(detailedProgress.recommendation.answers);
          }
          
          if (detailedProgress.recommendation.generatedLetters?.length > 0) {
            setGeneratedLetters(detailedProgress.recommendation.generatedLetters);
          }
        } catch (error) {
          console.log('No detailed progress available, using basic data');
        }
        
        // Set phase based on saved progress
        const savedPhase = recommendation.currentPhase;
        if (savedPhase === 'questionnaire') {
          setPhase('questionnaire');
          setCommitmentStarted(true);
        } else if (savedPhase === 'generation') {
          setPhase('generation');
          setCommitmentStarted(true);
        } else if (savedPhase === 'review') {
          setPhase('review');
          setCommitmentStarted(true);
        } else {
          setPhase('commitment');
          setCommitmentStarted(false);
        }
        
        // Legacy support: If we have answers, load them
        if (recommendation.answers?.length > 0) {
          setAnswers(recommendation.answers);
        }
        
        // If we have generated letters, load them
        if (recommendation.generatedLetters?.length > 0) {
          setGeneratedLetters(recommendation.generatedLetters);
        }
      } catch (error) {
        // If recommendation creation fails, default to commitment phase
        console.log('Using local state for recommendation flow');
        setPhase('commitment');
      }
    } catch (error) {
      console.error('Error loading recommendation data:', error);
      alert('Error loading data. Please try again.');
      router.push('/dashboard');
    }
  };

  const handleCommitmentAccept = async () => {
    setCommitmentStarted(true);
    setPhase('questionnaire');
    
    // Save progress to database
    if (recommendationId) {
      try {
        await recommendationsAPI.updateProgress(recommendationId, 'questionnaire', 'in-progress');
        console.log('Progress saved: moved to questionnaire phase');
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    }
  };

  const handleQuestionnaireComplete = async (questionAnswers: any[]) => {
    setAnswers(questionAnswers);
    setPhase('generation');
    
    // Save answers and progress to database
    if (recommendationId) {
      try {
        // Save answers
        await recommendationsAPI.saveAnswers(recommendationId, questionAnswers);
        
        // Update progress
        await recommendationsAPI.updateProgress(recommendationId, 'generation', 'in-progress');
        console.log('Progress saved: moved to generation phase');
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    }
  };

  const handleLettersGenerated = async (letters: any[]) => {
    setGeneratedLetters(letters);
    setPhase('review');
    
    // Save progress to database
    if (recommendationId) {
      try {
        await recommendationsAPI.updateProgress(recommendationId, 'review', 'in-progress');
        console.log('Progress saved: moved to review phase');
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  const getProgressPercentage = () => {
    switch (phase) {
      case 'loading': return 0;
      case 'commitment': return commitmentStarted ? 25 : 0;  // Show progress only after commitment accepted
      case 'questionnaire': return 50;
      case 'generation': return 75;
      case 'review': return 100;
      default: return 0;
    }
  };

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Preparing your recommendation workflow</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  Recommendation Letter
                </h1>
                <p className="text-gray-600">
                  for {student?.name} → {college?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <span className="text-sm text-gray-600">30-40 minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 py-4">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                phase === 'commitment' 
                  ? (commitmentStarted ? 'bg-green-600 text-white' : 'bg-blue-600 text-white')
                  : ['questionnaire', 'generation', 'review'].includes(phase)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <span className="text-sm font-medium text-gray-900">Commitment</span>
            </div>

            <div className="flex-1 h-1 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ 
                  width: phase === 'commitment' 
                    ? (commitmentStarted ? '100%' : '0%')
                    : ['questionnaire', 'generation', 'review'].includes(phase) ? '100%' : '0%'
                }}
              />
            </div>

            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                phase === 'questionnaire' 
                  ? 'bg-blue-600 text-white' 
                  : ['generation', 'review'].includes(phase)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <span className="text-sm font-medium text-gray-900">Questions</span>
            </div>

            <div className="flex-1 h-1 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: ['generation', 'review'].includes(phase) ? '100%' : '0%' }}
              />
            </div>

            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                phase === 'generation'
                  ? 'bg-blue-600 text-white'
                  : phase === 'review'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
              <span className="text-sm font-medium text-gray-900">Generate</span>
            </div>

            <div className="flex-1 h-1 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: phase === 'review' ? '100%' : '0%' }}
              />
            </div>

            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                phase === 'review'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                4
              </div>
              <span className="text-sm font-medium text-gray-900">Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student & College Info Card */}
        {student && college && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border p-6 mb-8"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommendation Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Student Info */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Student</h3>
                  <p className="text-gray-600">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.grade} Grade</p>
                  {student.gpa && (
                    <p className="text-sm text-gray-500">GPA: {student.gpa}</p>
                  )}
                </div>
              </div>

              {/* College Info */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Target College</h3>
                  <p className="text-gray-600">{college.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{college.type.replace('-', ' ')}</p>
                </div>
              </div>

              {/* Focus Areas */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">College Values</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {college.values?.slice(0, 2).map((value: string, index: number) => (
                      <span key={index} className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Phase Content */}
        {phase === 'commitment' && (
          <CommitmentModal
            student={student}
            college={college}
            onAccept={handleCommitmentAccept}
            onDecline={handleBack}
          />
        )}

        {phase === 'questionnaire' && (
          <QuestionnaireFlow
            student={student}
            college={college}
            onComplete={handleQuestionnaireComplete}
            recommendationId={recommendationId || undefined}
            initialAnswers={answers}
            initialQuestionIndex={currentQuestionIndex}
          />
        )}

        {phase === 'generation' && (
          <LetterGeneration
            student={student}
            college={college}
            answers={answers}
            onComplete={handleLettersGenerated}
          />
        )}

        {phase === 'review' && (
          <LetterReview
            student={student}
            college={college}
            letters={generatedLetters}
            onSaveLetter={(letterId, content) => {
              setGeneratedLetters(letters => 
                letters.map(letter => 
                  letter.id === letterId ? { ...letter, content } : letter
                )
              );
            }}
            onSelectFinalLetter={(letterId) => {
              alert(`Selected letter ${letterId} as final draft!`);
            }}
          />
        )}
      </div>
    </div>
  );
}