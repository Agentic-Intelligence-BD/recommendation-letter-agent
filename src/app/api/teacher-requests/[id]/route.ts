import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

const updateRequestSchema = z.object({
  action: z.enum(['accept', 'reject']),
  message: z.string().optional(),
});

// Update teacher request (accept/reject)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    if (!payload || payload.userType !== 'teacher') {
      return NextResponse.json(
        { error: 'Invalid token or insufficient permissions' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = updateRequestSchema.parse(body);
    const requestId = params.id;

    // Find the teacher request
    const teacherRequest = await prisma.teacherRequest.findUnique({
      where: { id: requestId },
      include: {
        student: true,
        teacher: true
      }
    });

    if (!teacherRequest) {
      return NextResponse.json(
        { error: 'Teacher request not found' },
        { status: 404 }
      );
    }

    if (teacherRequest.teacherId !== payload.id) {
      return NextResponse.json(
        { error: 'You can only respond to requests sent to you' },
        { status: 403 }
      );
    }

    if (teacherRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'This request has already been responded to' },
        { status: 400 }
      );
    }

    // Update request status
    const newStatus = data.action === 'accept' ? 'accepted' : 'rejected';
    
    const updatedRequest = await prisma.$transaction(async (tx) => {
      // Update the teacher request
      const updated = await tx.teacherRequest.update({
        where: { id: requestId },
        data: { 
          status: newStatus,
          updatedAt: new Date()
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              grade: true,
              institution: true,
              subjects: true,
              extracurriculars: true,
              bio: true,
              supplementary: true
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

      // If accepted, update the student's teacherId to establish relationship
      if (data.action === 'accept') {
        await tx.student.update({
          where: { id: teacherRequest.studentId },
          data: { teacherId: payload.id }
        });
      }

      return updated;
    });

    return NextResponse.json({
      message: `Request ${data.action}ed successfully`,
      request: updatedRequest
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating teacher request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get specific teacher request details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const requestId = params.id;

    const teacherRequest = await prisma.teacherRequest.findUnique({
      where: { id: requestId },
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

    if (!teacherRequest) {
      return NextResponse.json(
        { error: 'Teacher request not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to view this request
    if (payload.userType === 'teacher' && teacherRequest.teacherId !== payload.id) {
      return NextResponse.json(
        { error: 'You can only view requests sent to you' },
        { status: 403 }
      );
    }

    if (payload.userType === 'student' && teacherRequest.studentId !== payload.id) {
      return NextResponse.json(
        { error: 'You can only view your own requests' },
        { status: 403 }
      );
    }

    return NextResponse.json(teacherRequest);
  } catch (error) {
    console.error('Error fetching teacher request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}