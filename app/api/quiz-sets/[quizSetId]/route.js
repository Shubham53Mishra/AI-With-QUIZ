import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { quizSetId } = params;

    const quizSet = await prisma.quizSet.findUnique({
      where: { id: parseInt(quizSetId) },
      include: {
        questions: {
          orderBy: {
            questionId: 'asc',
          },
        },
      },
    });

    if (!quizSet) {
      return Response.json(
        { error: 'Quiz set not found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      quizSet,
    });
  } catch (error) {
    console.error('Error fetching quiz set:', error);
    return Response.json(
      { error: 'Failed to fetch quiz set' },
      { status: 500 }
    );
  }
}
