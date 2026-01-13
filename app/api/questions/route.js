import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      orderBy: {
        questionId: 'asc',
      },
    });

    return Response.json({
      success: true,
      questions,
      total: questions.length,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return Response.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
