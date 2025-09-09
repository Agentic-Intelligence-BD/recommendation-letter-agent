import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

// Get all teacher requests for the current teacher
export async function GET(request: NextRequest) {
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

    if (!payload || (payload.userType && payload.userType !== 'teacher')) {
      return NextResponse.json(
        { error: 'Invalid token or insufficient permissions' },
        { status: 401 }
      );
    }

    const requests = await prisma.teacherRequest.findMany({
      where: { teacherId: payload.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            grade: true,
            institution: true,
            gpa: true,
            subjects: true,
            extracurriculars: true,
            bio: true,
            supplementary: true,
            targetColleges: {
              include: {
                college: true
              }
            }
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // pending first
        { createdAt: 'desc' }
      ]
    });

    // Parse JSON fields
    const processedRequests = requests.map(request => ({
      ...request,
      student: request.student ? {
        ...request.student,
        subjects: request.student.subjects ? JSON.parse(request.student.subjects) : [],
        extracurriculars: request.student.extracurriculars ? JSON.parse(request.student.extracurriculars) : [],
        supplementary: request.student.supplementary ? JSON.parse(request.student.supplementary) : null,
        targetColleges: request.student.targetColleges.map(tc => ({
          ...tc.college,
          values: JSON.parse(tc.college.values),
          characteristics: JSON.parse(tc.college.characteristics)
        }))
      } : null
    }));

    return NextResponse.json(processedRequests);
  } catch (error) {
    console.error('Error fetching teacher requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}