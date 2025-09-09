import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

const updateProfileSchema = z.object({
  bio: z.string().optional(),
  supplementary: z.string().optional(),
});

// Update student profile (bio and supplementary info)
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyJWT(token);

    if (!payload || payload.userType !== 'student') {
      return NextResponse.json(
        { error: 'Invalid token or insufficient permissions' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    // Update student profile
    const updatedStudent = await prisma.student.update({
      where: { id: payload.id },
      data: {
        bio: data.bio,
        supplementary: data.supplementary,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        grade: true,
        institution: true,
        gpa: true,
        bio: true,
        supplementary: true,
        subjects: true,
        extracurriculars: true,
        isStudentAccount: true,
        targetColleges: {
          include: {
            college: true
          }
        }
      }
    });

    // Parse JSON fields for response
    const responseStudent = {
      ...updatedStudent,
      subjects: updatedStudent.subjects ? JSON.parse(updatedStudent.subjects) : [],
      extracurriculars: updatedStudent.extracurriculars ? JSON.parse(updatedStudent.extracurriculars) : [],
      targetColleges: updatedStudent.targetColleges.map(tc => tc.college)
    };

    return NextResponse.json({
      message: 'Profile updated successfully',
      student: responseStudent
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating student profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}