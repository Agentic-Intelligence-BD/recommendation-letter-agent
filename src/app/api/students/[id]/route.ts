import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyJWT, extractTokenFromHeaders } from '@/lib/auth';

const updateStudentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  grade: z.string().min(1, 'Grade is required').optional(),
  gpa: z.number().min(0).max(5).optional().nullable(),
  subjects: z.array(z.string()).min(1, 'At least one subject is required').optional(),
  extracurriculars: z.array(z.string()).optional(),
  targetColleges: z.array(z.object({
    id: z.string().optional(), // For existing colleges
    name: z.string().min(1, 'College name is required'),
    type: z.enum(['liberal-arts', 'research', 'technical', 'business', 'other']),
    values: z.array(z.string()),
    characteristics: z.array(z.string()),
  })).min(1, 'At least one target college is required').optional(),
});

// GET specific student
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractTokenFromHeaders(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = verifyJWT(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const studentId = params.id;

    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        teacherId: user.id,
      },
      include: {
        targetColleges: {
          include: {
            college: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Transform the data to match our frontend expectations
    const transformedStudent = {
      ...student,
      subjects: JSON.parse(student.subjects),
      extracurriculars: JSON.parse(student.extracurriculars),
      targetColleges: student.targetColleges.map(tc => ({
        id: tc.college.id,
        name: tc.college.name,
        type: tc.college.type,
        values: JSON.parse(tc.college.values),
        characteristics: JSON.parse(tc.college.characteristics),
      })),
    };

    return NextResponse.json({ student: transformedStudent });
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// UPDATE student
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractTokenFromHeaders(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = verifyJWT(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const studentId = params.id;
    const body = await request.json();

    // Validate the request body
    const validationResult = updateStudentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if student exists and belongs to the teacher
    const existingStudent = await prisma.student.findFirst({
      where: {
        id: studentId,
        teacherId: user.id,
      },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Start a transaction to update student and handle college relationships
    const result = await prisma.$transaction(async (tx) => {
      // Prepare student update data
      const studentUpdateData: any = {};
      
      if (data.name) studentUpdateData.name = data.name;
      if (data.email) studentUpdateData.email = data.email;
      if (data.grade) studentUpdateData.grade = data.grade;
      if (data.gpa !== undefined) studentUpdateData.gpa = data.gpa;
      if (data.subjects) studentUpdateData.subjects = JSON.stringify(data.subjects);
      if (data.extracurriculars) studentUpdateData.extracurriculars = JSON.stringify(data.extracurriculars);

      // Update student basic info
      const updatedStudent = await tx.student.update({
        where: { id: studentId },
        data: {
          ...studentUpdateData,
          updatedAt: new Date(),
        },
      });

      // Handle target colleges if provided
      if (data.targetColleges) {
        // Remove existing target college relationships
        await tx.targetCollege.deleteMany({
          where: { studentId },
        });

        // Process each target college
        for (const collegeData of data.targetColleges) {
          let collegeId: string;

          if (collegeData.id) {
            // Update existing college
            await tx.college.update({
              where: { id: collegeData.id },
              data: {
                name: collegeData.name,
                type: collegeData.type,
                values: JSON.stringify(collegeData.values),
                characteristics: JSON.stringify(collegeData.characteristics),
                updatedAt: new Date(),
              },
            });
            collegeId = collegeData.id;
          } else {
            // Create new college or find existing one by name
            const existingCollege = await tx.college.findFirst({
              where: { name: collegeData.name },
            });

            if (existingCollege) {
              collegeId = existingCollege.id;
            } else {
              const newCollege = await tx.college.create({
                data: {
                  name: collegeData.name,
                  type: collegeData.type,
                  values: JSON.stringify(collegeData.values),
                  characteristics: JSON.stringify(collegeData.characteristics),
                },
              });
              collegeId = newCollege.id;
            }
          }

          // Create target college relationship
          await tx.targetCollege.create({
            data: {
              studentId,
              collegeId,
            },
          });
        }
      }

      return updatedStudent;
    });

    // Fetch the complete updated student data
    const completeStudent = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        targetColleges: {
          include: {
            college: true,
          },
        },
      },
    });

    if (!completeStudent) {
      return NextResponse.json({ error: 'Failed to fetch updated student' }, { status: 500 });
    }

    // Transform the response
    const transformedStudent = {
      ...completeStudent,
      subjects: JSON.parse(completeStudent.subjects),
      extracurriculars: JSON.parse(completeStudent.extracurriculars),
      targetColleges: completeStudent.targetColleges.map(tc => ({
        id: tc.college.id,
        name: tc.college.name,
        type: tc.college.type,
        values: JSON.parse(tc.college.values),
        characteristics: JSON.parse(tc.college.characteristics),
      })),
    };

    return NextResponse.json({ 
      message: 'Student updated successfully',
      student: transformedStudent 
    });

  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE student
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractTokenFromHeaders(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = verifyJWT(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const studentId = params.id;

    // Check if student exists and belongs to the teacher
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        teacherId: user.id,
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Delete student (cascade will handle related records)
    await prisma.student.delete({
      where: { id: studentId },
    });

    return NextResponse.json({ message: 'Student deleted successfully' });

  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}