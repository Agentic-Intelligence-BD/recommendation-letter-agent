import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { comparePassword, signJWT } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    // Find student account
    const student = await prisma.student.findUnique({
      where: { 
        email: data.email,
        isStudentAccount: true // Only student accounts can log in
      },
      include: {
        targetColleges: {
          include: {
            college: true
          }
        },
        recommendationRequests: {
          include: {
            teacher: true,
            college: true
          }
        },
        teacherRequests: {
          include: {
            teacher: true
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!student.password) {
      return NextResponse.json(
        { error: 'This account was created by a teacher. Please create a student account instead.' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(data.password, student.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = signJWT({
      id: student.id,
      email: student.email,
      name: student.name,
      institution: student.institution || '',
      userType: 'student'
    });

    return NextResponse.json({
      message: 'Login successful',
      token,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        institution: student.institution,
        grade: student.grade,
        gpa: student.gpa,
        bio: student.bio,
        isStudentAccount: true,
        targetColleges: student.targetColleges.map(tc => tc.college),
        recommendationRequests: student.recommendationRequests,
        teacherRequests: student.teacherRequests
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Student login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}