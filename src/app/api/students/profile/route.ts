import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  grade: z.string().min(1, 'Grade is required').optional(),
  gpa: z.number().min(0).max(5).optional().nullable(),
  institution: z.string().min(1, 'Institution is required').optional(),
  subjects: z.array(z.string()).min(1, 'At least one subject is required').optional(),
  extracurriculars: z.array(z.string()).optional(),
  bio: z.string().optional(),
  supplementary: z.string().optional(),
  targetColleges: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'College name is required'),
    type: z.enum(['liberal-arts', 'research', 'technical', 'business', 'other']),
    values: z.array(z.string()).optional(),
    characteristics: z.array(z.string()).optional(),
  })).optional(),
});

// Update comprehensive student profile
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

    // Update student profile with transaction for target colleges
    const updatedStudent = await prisma.$transaction(async (tx) => {
      // Prepare student update data
      const studentUpdateData: any = { updatedAt: new Date() };
      
      if (data.name) studentUpdateData.name = data.name;
      if (data.email) studentUpdateData.email = data.email;
      if (data.grade) studentUpdateData.grade = data.grade;
      if (data.gpa !== undefined) studentUpdateData.gpa = data.gpa;
      if (data.institution) studentUpdateData.institution = data.institution;
      if (data.subjects) studentUpdateData.subjects = JSON.stringify(data.subjects);
      if (data.extracurriculars) studentUpdateData.extracurriculars = JSON.stringify(data.extracurriculars);
      if (data.bio !== undefined) studentUpdateData.bio = data.bio;
      if (data.supplementary !== undefined) studentUpdateData.supplementary = data.supplementary;

      // Update student basic info
      const student = await tx.student.update({
        where: { id: payload.id },
        data: studentUpdateData,
      });

      // Handle target colleges if provided
      if (data.targetColleges) {
        // Remove existing target college relationships
        await tx.targetCollege.deleteMany({
          where: { studentId: payload.id },
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
                values: JSON.stringify(collegeData.values || []),
                characteristics: JSON.stringify(collegeData.characteristics || []),
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
                  values: JSON.stringify(collegeData.values || []),
                  characteristics: JSON.stringify(collegeData.characteristics || []),
                },
              });
              collegeId = newCollege.id;
            }
          }

          // Create target college relationship
          await tx.targetCollege.create({
            data: {
              studentId: payload.id,
              collegeId,
            },
          });
        }
      }

      return student;
    });

    // Fetch the complete updated student data
    const completeStudent = await prisma.student.findUnique({
      where: { id: payload.id },
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
      ...completeStudent,
      subjects: completeStudent?.subjects ? JSON.parse(completeStudent.subjects) : [],
      extracurriculars: completeStudent?.extracurriculars ? JSON.parse(completeStudent.extracurriculars) : [],
      targetColleges: completeStudent?.targetColleges.map(tc => ({
        ...tc.college,
        values: JSON.parse(tc.college.values),
        characteristics: JSON.parse(tc.college.characteristics)
      })) || []
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