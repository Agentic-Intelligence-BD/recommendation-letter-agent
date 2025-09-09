export interface Teacher {
  id: string;
  name: string;
  email: string;
  institution: string;
  subject?: string;
  experience?: number;
  createdAt: Date;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  password?: string;
  grade: string;
  gpa?: number | null;
  subjects: string[];
  extracurriculars: string[];
  bio?: string;
  supplementary?: any;
  institution?: string;
  targetColleges: College[];
  teacherId?: string | null;
  isStudentAccount: boolean;
  createdAt: Date;
  teacherRequests?: TeacherRequest[];
  recommendationRequests?: RecommendationRequest[];
}

export interface TeacherRequest {
  id: string;
  studentId: string;
  teacherId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  student?: Student;
  teacher?: Teacher;
}

export interface College {
  id: string;
  name: string;
  type: 'liberal-arts' | 'research' | 'technical' | 'business' | 'other';
  values: string[];
  characteristics: string[];
}

export interface RecommendationRequest {
  id: string;
  studentId: string;
  teacherId: string;
  collegeId?: string;
  targetCollege?: College;
  college?: College;
  status: 'pending' | 'in-progress' | 'completed' | 'reviewed';
  questions?: Question[];
  answers?: Answer[];
  generatedLetters?: GeneratedLetter[];
  finalDraft?: string;
  createdAt: Date;
  updatedAt: Date;
  teacher?: Teacher;
}

export interface Question {
  id: string;
  text: string;
  category: 'academic' | 'social' | 'extracurricular' | 'character' | 'leadership' | 'personal';
  required: boolean;
  followUp?: string;
}

export interface Answer {
  questionId: string;
  response: string;
  notes?: string | null;
}

export interface GeneratedLetter {
  id: string;
  content: string;
  tone: 'formal' | 'warm' | 'enthusiastic';
  focus: string[];
  wordCount: number;
  createdAt: Date;
}