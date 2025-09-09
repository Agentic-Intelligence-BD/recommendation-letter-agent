import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyJWT, extractTokenFromHeaders } from '@/lib/auth';

const progressSchema = z.object({
  currentQuestionIndex: z.number().min(0),
  answers: z.array(z.object({
    questionId: z.string(),
    response: z.string(),
    notes: z.string().optional(),
  })),
  phase: z.enum(['commitment', 'questionnaire', 'generation', 'review']).optional(),
});

// POST - Save current progress (individual answers and current position)
export async function POST(
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

    const body = await request.json();
    const { currentQuestionIndex, answers, phase } = progressSchema.parse(body);
    const recommendationId = params.id;

    // Verify recommendation belongs to teacher
    const recommendation = await prisma.recommendationRequest.findFirst({
      where: {
        id: recommendationId,
        teacherId: user.id,
      }
    });

    if (!recommendation) {
      return NextResponse.json(
        { error: 'Recommendation request not found or not authorized' },
        { status: 404 }
      );
    }

    // Use transaction to save answers and progress
    await prisma.$transaction(async (tx) => {
      // Delete existing answers for this recommendation
      await tx.answer.deleteMany({
        where: { recommendationRequestId: recommendationId }
      });

      // Save current answers (including partial ones)
      if (answers.length > 0) {
        await Promise.all(
          answers.map(answer =>
            tx.answer.create({
              data: {
                questionId: answer.questionId,
                recommendationRequestId: recommendationId,
                response: answer.response,
                notes: answer.notes || null,
              }
            })
          )
        );
      }

      // Update recommendation with current progress
      const updateData: any = {
        status: 'in-progress',
        updatedAt: new Date(),
      };

      if (phase) {
        updateData.currentPhase = phase;
      }

      await tx.recommendationRequest.update({
        where: { id: recommendationId },
        data: updateData
      });

      // Save additional progress metadata in a simple way
      // We'll store the current question index in the finalDraft field temporarily
      // (this is a simple approach - in production you might want a separate progress table)
      await tx.recommendationRequest.update({
        where: { id: recommendationId },
        data: {
          finalDraft: JSON.stringify({
            currentQuestionIndex,
            savedAt: new Date().toISOString(),
            totalAnswers: answers.length,
          })
        }
      });
    });

    return NextResponse.json({
      message: 'Progress saved successfully',
      currentQuestionIndex,
      answersCount: answers.length,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Save progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get current progress
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

    const recommendationId = params.id;

    const recommendation = await prisma.recommendationRequest.findFirst({
      where: {
        id: recommendationId,
        teacherId: user.id,
      },
      include: {
        answers: true,
        student: true,
        college: true,
        generatedLetters: true,
      },
    });

    if (!recommendation) {
      return NextResponse.json(
        { error: 'Recommendation request not found' },
        { status: 404 }
      );
    }

    // Parse progress metadata
    let progressData = { currentQuestionIndex: 0 };
    if (recommendation.finalDraft) {
      try {
        progressData = JSON.parse(recommendation.finalDraft);
      } catch (e) {
        // If finalDraft contains actual letter content, reset progress
        progressData = { currentQuestionIndex: 0 };
      }
    }

    return NextResponse.json({
      recommendation,
      currentQuestionIndex: progressData.currentQuestionIndex || 0,
      progress: progressData,
    });

  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}