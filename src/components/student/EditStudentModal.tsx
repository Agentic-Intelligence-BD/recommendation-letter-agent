'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2, User, Mail, GraduationCap, BookOpen, Loader } from 'lucide-react';
import { Student } from '@/types';
import { studentsAPI } from '@/lib/api';

const collegeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'College name is required'),
  type: z.enum(['liberal-arts', 'research', 'technical', 'business', 'other']),
});

const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  grade: z.string().min(1, 'Grade is required'),
  gpa: z.number().min(0).max(5).optional().nullable(),
  subjects: z.array(z.string()).min(1, 'At least one subject is required'),
  extracurriculars: z.array(z.string()),
  targetColleges: z.array(collegeSchema).min(1, 'At least one target college is required'),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onUpdate: (updatedStudent: Student) => void;
}

export default function EditStudentModal({ isOpen, onClose, student, onUpdate }: EditStudentModalProps) {
  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [colleges, setColleges] = useState<Array<{ id?: string; name: string; type: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: student.name,
      email: student.email,
      grade: student.grade,
      gpa: student.gpa,
      subjects: student.subjects,
      extracurriculars: student.extracurriculars,
      targetColleges: student.targetColleges.map(college => ({
        id: college.id,
        name: college.name,
        type: college.type as any,
      })),
    },
  });

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && student) {
      setSubjects(student.subjects || []);
      setActivities(student.extracurriculars || []);
      setColleges(student.targetColleges?.map(college => ({
        id: college.id,
        name: college.name,
        type: college.type,
      })) || []);
      
      // Reset form with student data
      reset({
        name: student.name,
        email: student.email,
        grade: student.grade,
        gpa: student.gpa,
        subjects: student.subjects,
        extracurriculars: student.extracurriculars,
        targetColleges: student.targetColleges.map(college => ({
          id: college.id,
          name: college.name,
          type: college.type as any,
        })),
      });
    }
  }, [isOpen, student, reset]);

  const onSubmit = async (data: StudentFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updateData = {
        ...data,
        subjects: subjects.filter(s => s.trim()),
        extracurriculars: activities.filter(a => a.trim()),
        targetColleges: colleges.map(college => ({
          id: college.id,
          name: college.name,
          type: college.type,
          values: getCollegeValues(college.type),
          characteristics: getCollegeCharacteristics(college.type),
        })),
      };

      const updatedStudent = await studentsAPI.update(student.id, updateData);
      onUpdate(updatedStudent);
      handleClose();
    } catch (error: any) {
      console.error('Error updating student:', error);
      setError(error.response?.data?.error || 'Failed to update student');
    } finally {
      setIsLoading(false);
    }
  };

  const getCollegeValues = (type: string): string[] => {
    const values = {
      'liberal-arts': ['Critical thinking', 'Intellectual curiosity', 'Well-rounded education'],
      'research': ['Innovation', 'Research excellence', 'Scientific inquiry'],
      'technical': ['Technical excellence', 'Problem-solving', 'Innovation'],
      'business': ['Leadership', 'Entrepreneurship', 'Strategic thinking'],
      'other': ['Excellence', 'Integrity', 'Growth mindset'],
    };
    return values[type as keyof typeof values] || values.other;
  };

  const getCollegeCharacteristics = (type: string): string[] => {
    const characteristics = {
      'liberal-arts': ['Intellectual curiosity', 'Critical thinking', 'Cultural awareness'],
      'research': ['Research aptitude', 'Analytical skills', 'Innovation mindset'],
      'technical': ['Technical skills', 'Problem-solving', 'Mathematical thinking'],
      'business': ['Leadership potential', 'Communication skills', 'Strategic mindset'],
      'other': ['Academic excellence', 'Character', 'Potential for growth'],
    };
    return characteristics[type as keyof typeof characteristics] || characteristics.other;
  };

  const addSubject = () => setSubjects([...subjects, '']);
  const removeSubject = (index: number) => setSubjects(subjects.filter((_, i) => i !== index));
  const updateSubject = (index: number, value: string) => {
    const newSubjects = [...subjects];
    newSubjects[index] = value;
    setSubjects(newSubjects);
    setValue('subjects', newSubjects);
  };

  const addActivity = () => setActivities([...activities, '']);
  const removeActivity = (index: number) => setActivities(activities.filter((_, i) => i !== index));
  const updateActivity = (index: number, value: string) => {
    const newActivities = [...activities];
    newActivities[index] = value;
    setActivities(newActivities);
    setValue('extracurriculars', newActivities);
  };

  const addCollege = () => setColleges([...colleges, { name: '', type: 'liberal-arts' }]);
  const removeCollege = (index: number) => setColleges(colleges.filter((_, i) => i !== index));
  const updateCollege = (index: number, field: string, value: string) => {
    const newColleges = [...colleges];
    newColleges[index] = { ...newColleges[index], [field]: value };
    setColleges(newColleges);
    setValue('targetColleges', newColleges as any);
  };

  const handleClose = () => {
    setStep(1);
    setError(null);
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div 
          className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          />

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Edit Student Profile</h3>
                <p className="text-gray-600">Step {step} of 3</p>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    Basic Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student Name
                      </label>
                      <input
                        {...register('name')}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter student's full name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="student@email.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grade/Class
                      </label>
                      <select
                        {...register('grade')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select grade</option>
                        <option value="9th">9th Grade</option>
                        <option value="10th">10th Grade</option>
                        <option value="11th">11th Grade</option>
                        <option value="12th">12th Grade</option>
                      </select>
                      {errors.grade && (
                        <p className="mt-1 text-sm text-red-600">{errors.grade.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GPA (Optional)
                      </label>
                      <input
                        {...register('gpa', { 
                          valueAsNumber: true,
                          setValueAs: (value) => value === '' ? null : parseFloat(value)
                        })}
                        type="number"
                        step="0.01"
                        min="0"
                        max="5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="3.85"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                    Academic & Activities
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subjects
                    </label>
                    {subjects.map((subject, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => updateSubject(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Mathematics, Physics"
                        />
                        {subjects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSubject(index)}
                            className="p-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSubject}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Subject</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Extracurricular Activities (Optional)
                    </label>
                    {activities.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={activity}
                          onChange={(e) => updateActivity(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Debate Club, Science Olympiad"
                        />
                        <button
                          type="button"
                          onClick={() => removeActivity(index)}
                          className="p-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addActivity}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Activity</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
                    Target Colleges
                  </h4>

                  {colleges.map((college, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            College Name
                          </label>
                          <input
                            type="text"
                            value={college.name}
                            onChange={(e) => updateCollege(index, 'name', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Harvard University"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            College Type
                          </label>
                          <select
                            value={college.type}
                            onChange={(e) => updateCollege(index, 'type', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="liberal-arts">Liberal Arts</option>
                            <option value="research">Research University</option>
                            <option value="technical">Technical/Engineering</option>
                            <option value="business">Business School</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                      {colleges.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCollege(index)}
                          className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Remove College</span>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCollege}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Another College</span>
                  </button>
                </motion.div>
              )}

              <div className="flex justify-between mt-8 pt-6 border-t">
                <div>
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      disabled={isLoading}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    >
                      Previous
                    </button>
                  )}
                </div>
                <div className="space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      disabled={isLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isLoading && <Loader className="h-4 w-4 animate-spin" />}
                      <span>{isLoading ? 'Updating...' : 'Update Student'}</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}