import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyJWT, extractTokenFromHeaders } from '@/lib/auth'

const answersSchema = z.array(z.object({
  questionId: z.string(),
  response: z.string(),
  notes: z.string().optional(),
}))

// POST - Save answers for a recommendation request
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const answers = answersSchema.parse(body.answers)
    const recommendationId = params.id

    // Verify recommendation belongs to teacher
    const recommendation = await prisma.recommendationRequest.findFirst({
      where: {
        id: recommendationId,
        teacherId: user.id,
      }
    })

    if (!recommendation) {
      return NextResponse.json(
        { error: 'Recommendation request not found or not authorized' },
        { status: 404 }
      )
    }

    // Delete existing answers for this recommendation
    await prisma.answer.deleteMany({
      where: { recommendationRequestId: recommendationId }
    })

    // Save new answers
    const savedAnswers = await Promise.all(
      answers.map(answer =>
        prisma.answer.create({
          data: {
            questionId: answer.questionId,
            recommendationRequestId: recommendationId,
            response: answer.response,
            notes: answer.notes,
          }
        })
      )
    )

    // Update recommendation status to in-progress
    await prisma.recommendationRequest.update({
      where: { id: recommendationId },
      data: { status: 'in-progress' }
    })

    return NextResponse.json({
      message: 'Answers saved successfully',
      answers: savedAnswers
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Save answers error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}