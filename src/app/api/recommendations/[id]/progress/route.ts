import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT, extractTokenFromHeaders } from '@/lib/auth';

// Update recommendation progress
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

    const { phase, status } = await request.json();
    const recommendationId = params.id;

    // Validate phase
    const validPhases = ['commitment', 'questionnaire', 'generation', 'review'];
    if (!validPhases.includes(phase)) {
      return NextResponse.json({ error: 'Invalid phase' }, { status: 400 });
    }

    // Find or create recommendation request
    let recommendation = await prisma.recommendationRequest.findFirst({
      where: {
        id: recommendationId,
        teacherId: user.id,
      },
    });

    if (!recommendation) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });
    }

    // Update the recommendation progress
    const updatedRecommendation = await prisma.recommendationRequest.update({
      where: { id: recommendationId },
      data: {
        currentPhase: phase,
        status: status || recommendation.status,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedRecommendation);
  } catch (error) {
    console.error('Error updating recommendation progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get recommendation progress
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
        student: true,
        college: true,
        answers: true,
        generatedLetters: true,
      },
    });

    if (!recommendation) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });
    }

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error('Error fetching recommendation progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}