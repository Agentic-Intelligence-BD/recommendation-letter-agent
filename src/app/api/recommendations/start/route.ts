import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT, extractTokenFromHeaders } from '@/lib/auth';

// Start a new recommendation request
export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromHeaders(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = verifyJWT(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { studentId, collegeId } = await request.json();

    if (!studentId || !collegeId) {
      return NextResponse.json(
        { error: 'Student ID and College ID are required' },
        { status: 400 }
      );
    }

    // Check if student belongs to the teacher
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        teacherId: user.id,
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check if college exists
    const college = await prisma.college.findUnique({
      where: { id: collegeId },
    });

    if (!college) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    // Check if recommendation request already exists
    const existingRecommendation = await prisma.recommendationRequest.findFirst({
      where: {
        studentId,
        teacherId: user.id,
        collegeId,
      },
    });

    if (existingRecommendation) {
      // Return existing recommendation
      return NextResponse.json(existingRecommendation);
    }

    // Create new recommendation request
    const newRecommendation = await prisma.recommendationRequest.create({
      data: {
        studentId,
        teacherId: user.id,
        collegeId,
        status: 'in-progress',
        currentPhase: 'commitment',
      },
      include: {
        student: true,
        college: true,
      },
    });

    return NextResponse.json(newRecommendation);
  } catch (error) {
    console.error('Error starting recommendation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}