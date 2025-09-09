import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword, signJWT } from '@/lib/auth'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  institution: z.string().min(2, 'Institution name is required'),
  subject: z.string().optional(),
  experience: z.number().min(0).max(50).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.teacher.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A teacher with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Create teacher
    const teacher = await prisma.teacher.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        institution: validatedData.institution,
        subject: validatedData.subject,
        experience: validatedData.experience,
      }
    })

    // Generate JWT token
    const token = signJWT({
      id: teacher.id,
      email: teacher.email,
      name: teacher.name,
      institution: teacher.institution,
      userType: 'teacher'
    })

    // Return user data without password
    const { password: _, ...teacherData } = teacher

    return NextResponse.json({
      message: 'Teacher registered successfully',
      teacher: teacherData,
      token,
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}