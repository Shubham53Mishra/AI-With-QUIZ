import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const uploadHistory = await prisma.uploadHistory.findMany({
      include: {
        quizSet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Response.json({
      success: true,
      data: uploadHistory,
    });
  } catch (error) {
    console.error('Error fetching upload history:', error);
    return Response.json(
      { error: 'Failed to fetch upload history' },
      { status: 500 }
    );
  }
}
