import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyJWT, extractTokenFromHeaders } from '@/lib/auth'

const createRecommendationSchema = z.object({
  studentId: z.string(),
  collegeId: z.string(),
})

const updateRecommendationSchema = z.object({
  status: z.enum(['pending', 'in-progress', 'completed', 'reviewed']).optional(),
  finalDraft: z.string().optional(),
})

const answerSchema = z.object({
  questionId: z.string(),
  response: z.string(),
  notes: z.string().optional(),
})

// GET recommendation requests for the authenticated teacher
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

    const recommendations = await prisma.recommendationRequest.findMany({
      where: { teacherId: user.id },
      include: {
        student: true,
        college: true,
        answers: {
          include: {
            question: true
          }
        },
        generatedLetters: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform data
    const transformedRecommendations = recommendations.map(rec => ({
      id: rec.id,
      studentId: rec.studentId,
      teacherId: rec.teacherId,
      targetCollege: {
        id: rec.college.id,
        name: rec.college.name,
        type: rec.college.type,
        values: JSON.parse(rec.college.values),
        characteristics: JSON.parse(rec.college.characteristics),
      },
      status: rec.status,
      questions: rec.answers.map(answer => answer.question),
      answers: rec.answers.map(answer => ({
        questionId: answer.questionId,
        response: answer.response,
        notes: answer.notes,
      })),
      generatedLetters: rec.generatedLetters.map(letter => ({
        id: letter.id,
        content: letter.content,
        tone: letter.tone as 'formal' | 'warm' | 'enthusiastic',
        focus: JSON.parse(letter.focus),
        createdAt: letter.createdAt,
      })),
      finalDraft: rec.finalDraft,
      createdAt: rec.createdAt,
      updatedAt: rec.updatedAt,
    }))

    return NextResponse.json({ recommendations: transformedRecommendations })

  } catch (error) {
    console.error('Get recommendations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new recommendation request
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
    const validatedData = createRecommendationSchema.parse(body)

    // Verify student belongs to teacher
    const student = await prisma.student.findFirst({
      where: {
        id: validatedData.studentId,
        teacherId: user.id,
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found or not authorized' },
        { status: 404 }
      )
    }

    // Create recommendation request
    const recommendation = await prisma.recommendationRequest.create({
      data: {
        studentId: validatedData.studentId,
        teacherId: user.id,
        collegeId: validatedData.collegeId,
        status: 'pending',
      },
      include: {
        student: true,
        college: true,
        answers: true,
        generatedLetters: true,
      }
    })

    // Transform response
    const transformedRecommendation = {
      id: recommendation.id,
      studentId: recommendation.studentId,
      teacherId: recommendation.teacherId,
      targetCollege: {
        id: recommendation.college.id,
        name: recommendation.college.name,
        type: recommendation.college.type,
        values: JSON.parse(recommendation.college.values),
        characteristics: JSON.parse(recommendation.college.characteristics),
      },
      status: recommendation.status,
      questions: [],
      answers: [],
      generatedLetters: [],
      finalDraft: recommendation.finalDraft,
      createdAt: recommendation.createdAt,
      updatedAt: recommendation.updatedAt,
    }

    return NextResponse.json({
      message: 'Recommendation request created successfully',
      recommendation: transformedRecommendation
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create recommendation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}