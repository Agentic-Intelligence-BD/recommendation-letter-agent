import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT, extractTokenFromHeaders } from '@/lib/auth'
import { generateRecommendationLetters } from '@/utils/letterGenerator'

// POST - Generate recommendation letters
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

    const recommendationId = params.id

    // Fetch recommendation with all related data
    const recommendation = await prisma.recommendationRequest.findFirst({
      where: {
        id: recommendationId,
        teacherId: user.id,
      },
      include: {
        student: {
          include: {
            targetColleges: {
              include: {
                college: true
              }
            }
          }
        },
        college: true,
        answers: {
          include: {
            question: true
          }
        }
      }
    })

    if (!recommendation) {
      return NextResponse.json(
        { error: 'Recommendation request not found or not authorized' },
        { status: 404 }
      )
    }

    if (recommendation.answers.length === 0) {
      return NextResponse.json(
        { error: 'No answers found. Please complete the questionnaire first.' },
        { status: 400 }
      )
    }

    // Transform data for letter generation
    const student = {
      id: recommendation.student.id,
      name: recommendation.student.name,
      email: recommendation.student.email,
      grade: recommendation.student.grade,
      gpa: recommendation.student.gpa,
      subjects: JSON.parse(recommendation.student.subjects),
      extracurriculars: JSON.parse(recommendation.student.extracurriculars),
      targetColleges: [{
        id: recommendation.college.id,
        name: recommendation.college.name,
        type: recommendation.college.type as any,
        values: JSON.parse(recommendation.college.values),
        characteristics: JSON.parse(recommendation.college.characteristics),
      }],
      teacherId: recommendation.student.teacherId,
      isStudentAccount: recommendation.student.isStudentAccount,
      createdAt: recommendation.student.createdAt,
    }

    const college = {
      id: recommendation.college.id,
      name: recommendation.college.name,
      type: recommendation.college.type as any,
      values: JSON.parse(recommendation.college.values),
      characteristics: JSON.parse(recommendation.college.characteristics),
    }

    const answers = recommendation.answers.map(answer => ({
      questionId: answer.questionId,
      response: answer.response,
      notes: answer.notes,
    }))

    // Generate letters using the utility function
    const generatedLetters = generateRecommendationLetters(student, college, answers)

    // Delete existing generated letters
    await prisma.generatedLetter.deleteMany({
      where: { recommendationRequestId: recommendationId }
    })

    // Save generated letters to database
    const savedLetters = await Promise.all(
      generatedLetters.map(letter =>
        prisma.generatedLetter.create({
          data: {
            recommendationRequestId: recommendationId,
            content: letter.content,
            tone: letter.tone,
            focus: JSON.stringify(letter.focus),
          }
        })
      )
    )

    // Update recommendation status
    await prisma.recommendationRequest.update({
      where: { id: recommendationId },
      data: { status: 'completed' }
    })

    // Transform response
    const transformedLetters = savedLetters.map(letter => ({
      id: letter.id,
      content: letter.content,
      tone: letter.tone as 'formal' | 'warm' | 'enthusiastic',
      focus: JSON.parse(letter.focus),
      createdAt: letter.createdAt,
    }))

    return NextResponse.json({
      message: 'Recommendation letters generated successfully',
      letters: transformedLetters
    })

  } catch (error) {
    console.error('Generate letters error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}