import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

const createRequestSchema = z.object({
  teacherEmail: z.string().email('Please enter a valid teacher email'),
  message: z.string().optional(),
});

// Get all teacher requests for a student
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

    if (!payload || payload.userType !== 'student') {
      return NextResponse.json(
        { error: 'Invalid token or insufficient permissions' },
        { status: 401 }
      );
    }

    const requests = await prisma.teacherRequest.findMany({
      where: { studentId: payload.id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            institution: true,
            subject: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching teacher requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new teacher request
export async function POST(request: NextRequest) {
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
    const data = createRequestSchema.parse(body);

    // Find the teacher by email
    const teacher = await prisma.teacher.findUnique({
      where: { email: data.teacherEmail }
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found with this email address' },
        { status: 404 }
      );
    }

    // Check if request already exists
    const existingRequest = await prisma.teacherRequest.findUnique({
      where: {
        studentId_teacherId: {
          studentId: payload.id,
          teacherId: teacher.id
        }
      }
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You have already sent a request to this teacher' },
        { status: 400 }
      );
    }

    // Create the teacher request
    const teacherRequest = await prisma.teacherRequest.create({
      data: {
        studentId: payload.id,
        teacherId: teacher.id,
        message: data.message,
        status: 'pending'
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            grade: true,
            institution: true
          }
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            institution: true,
            subject: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Teacher request sent successfully',
      request: teacherRequest
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating teacher request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}