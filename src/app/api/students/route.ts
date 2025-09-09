import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyJWT, extractTokenFromHeaders } from '@/lib/auth'

const createStudentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  grade: z.string().min(1, 'Grade is required'),
  gpa: z.number().min(0).max(5).optional(),
  subjects: z.array(z.string()).min(1, 'At least one subject is required'),
  extracurriculars: z.array(z.string()),
  targetColleges: z.array(z.object({
    name: z.string().min(1, 'College name is required'),
    type: z.enum(['liberal-arts', 'research', 'technical', 'business', 'other']),
    values: z.array(z.string()),
    characteristics: z.array(z.string()),
  })).min(1, 'At least one target college is required'),
})

// GET all students for the authenticated teacher
export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromHeaders(request.headers.get('authorization'))
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = verifyJWT(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const students = await prisma.student.findMany({
      where: { teacherId: user.id },
      include: {
        targetColleges: {
          include: {
            college: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform data to match frontend expectations
    const transformedStudents = students.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      grade: student.grade,
      gpa: student.gpa,
      subjects: JSON.parse(student.subjects),
      extracurriculars: JSON.parse(student.extracurriculars),
      targetColleges: student.targetColleges.map(tc => ({
        id: tc.college.id,
        name: tc.college.name,
        type: tc.college.type,
        values: JSON.parse(tc.college.values),
        characteristics: JSON.parse(tc.college.characteristics),
      })),
      teacherId: student.teacherId,
      createdAt: student.createdAt,
    }))

    return NextResponse.json({ students: transformedStudents })

  } catch (error) {
    console.error('Get students error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new student
export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromHeaders(request.headers.get('authorization'))
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = verifyJWT(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createStudentSchema.parse(body)

    // Create student
    const student = await prisma.student.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        grade: validatedData.grade,
        gpa: validatedData.gpa,
        subjects: JSON.stringify(validatedData.subjects),
        extracurriculars: JSON.stringify(validatedData.extracurriculars),
        teacherId: user.id,
      }
    })

    // Handle target colleges
    for (const collegeData of validatedData.targetColleges) {
      // Create or find college
      let college = await prisma.college.findUnique({
        where: { name: collegeData.name }
      })

      if (!college) {
        college = await prisma.college.create({
          data: {
            name: collegeData.name,
            type: collegeData.type,
            values: JSON.stringify(collegeData.values),
            characteristics: JSON.stringify(collegeData.characteristics),
          }
        })
      }

      // Create target college relationship
      await prisma.targetCollege.create({
        data: {
          studentId: student.id,
          collegeId: college.id,
        }
      })
    }

    // Fetch the complete student data with relations
    const completeStudent = await prisma.student.findUnique({
      where: { id: student.id },
      include: {
        targetColleges: {
          include: {
            college: true
          }
        }
      }
    })

    if (!completeStudent) {
      throw new Error('Failed to fetch created student')
    }

    // Transform response to match frontend expectations
    const transformedStudent = {
      id: completeStudent.id,
      name: completeStudent.name,
      email: completeStudent.email,
      grade: completeStudent.grade,
      gpa: completeStudent.gpa,
      subjects: JSON.parse(completeStudent.subjects),
      extracurriculars: JSON.parse(completeStudent.extracurriculars),
      targetColleges: completeStudent.targetColleges.map(tc => ({
        id: tc.college.id,
        name: tc.college.name,
        type: tc.college.type,
        values: JSON.parse(tc.college.values),
        characteristics: JSON.parse(tc.college.characteristics),
      })),
      teacherId: completeStudent.teacherId,
      createdAt: completeStudent.createdAt,
    }

    return NextResponse.json({
      message: 'Student created successfully',
      student: transformedStudent
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create student error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}