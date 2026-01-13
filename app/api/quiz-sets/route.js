import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const quizSets = await prisma.quizSet.findMany({
      include: {
        questions: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Response.json({
      success: true,
      data: quizSets.map((qs) => ({
        ...qs,
        questionCount: qs.questions.length,
        questions: undefined,
      })),
    });
  } catch (error) {
    console.error('Error fetching quiz sets:', error);
    return Response.json(
      { error: 'Failed to fetch quiz sets' },
      { status: 500 }
    );
  }
}
