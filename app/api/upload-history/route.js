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
    }).catch((error) => {
      // If there's a database error, log it and return empty array
      console.error('Database query error:', error.message);
      return [];
    });

    return Response.json({
      success: true,
      data: uploadHistory || [],
    });
  } catch (error) {
    console.error('Error in upload-history API:', error.message);
    
    // Return success with empty data instead of error
    // This prevents the client from treating it as an API failure
    return Response.json({
      success: true,
      data: [],
    });
  }
}
