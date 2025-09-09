import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, signJWT } from '@/lib/auth';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  grade: z.string().min(1, 'Grade is required'),
  institution: z.string().min(1, 'Institution is required'),
  gpa: z.number().min(0).max(5).optional(),
  subjects: z.array(z.string()).min(1, 'At least one subject is required'),
  extracurriculars: z.array(z.string()).optional().default([]),
  targetColleges: z.array(z.object({
    name: z.string().min(1, 'College name is required'),
    type: z.enum(['liberal-arts', 'research', 'technical', 'business', 'other']),
  })).min(1, 'At least one target college is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Check if user already exists
    const existingStudent = await prisma.student.findUnique({
      where: { email: data.email }
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: 'A student with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create student account
    const student = await prisma.$transaction(async (tx) => {
      const newStudent = await tx.student.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          grade: data.grade,
          institution: data.institution,
          gpa: data.gpa,
          subjects: JSON.stringify(data.subjects),
          extracurriculars: JSON.stringify(data.extracurriculars || []),
          isStudentAccount: true,
          bio: null,
          supplementary: null,
        },
      });

      // Create target colleges
      for (const collegeData of data.targetColleges) {
        let college = await tx.college.findFirst({
          where: { name: collegeData.name }
        });

        if (!college) {
          college = await tx.college.create({
            data: {
              name: collegeData.name,
              type: collegeData.type,
              values: JSON.stringify(getCollegeValues(collegeData.type)),
              characteristics: JSON.stringify(getCollegeCharacteristics(collegeData.type)),
            }
          });
        }

        await tx.targetCollege.create({
          data: {
            studentId: newStudent.id,
            collegeId: college.id,
          }
        });
      }

      return newStudent;
    });

    // Generate JWT token
    const token = signJWT({
      id: student.id,
      email: student.email,
      name: student.name,
      institution: student.institution || '',
      userType: 'student'
    });

    return NextResponse.json({
      message: 'Student account created successfully',
      token,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        institution: student.institution,
        isStudentAccount: true,
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Student registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getCollegeValues(type: string): string[] {
  const values = {
    'liberal-arts': ['Critical thinking', 'Intellectual curiosity', 'Well-rounded education'],
    'research': ['Innovation', 'Research excellence', 'Scientific inquiry'],
    'technical': ['Technical excellence', 'Problem-solving', 'Innovation'],
    'business': ['Leadership', 'Entrepreneurship', 'Strategic thinking'],
    'other': ['Excellence', 'Integrity', 'Growth mindset'],
  };
  return values[type as keyof typeof values] || values.other;
}

function getCollegeCharacteristics(type: string): string[] {
  const characteristics = {
    'liberal-arts': ['Intellectual curiosity', 'Critical thinking', 'Cultural awareness'],
    'research': ['Research aptitude', 'Analytical skills', 'Innovation mindset'],
    'technical': ['Technical skills', 'Problem-solving', 'Mathematical thinking'],
    'business': ['Leadership potential', 'Communication skills', 'Strategic mindset'],
    'other': ['Academic excellence', 'Character', 'Potential for growth'],
  };
  return characteristics[type as keyof typeof characteristics] || characteristics.other;
}