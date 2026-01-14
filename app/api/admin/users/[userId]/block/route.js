import { prisma } from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { userId } = await params;
    const body = await request.json();
    const { isBlocked, blockReason } = body; 

    // Validate inputs
    if (!userId) {
      return Response.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (typeof isBlocked !== 'boolean') {
      return Response.json(
        { error: 'isBlocked must be true or false' },
        { status: 400 }
      );
    }

    // If blocking, reason is required
    if (isBlocked && !blockReason?.trim()) {
      return Response.json(
        { error: 'Block reason is required' },
        { status: 400 }
      );
    }

    // Update user block status
    const updatedUser = await prisma.user.update({
      where: {
        id: parseInt(userId),
      },
      data: {
        isBlocked: isBlocked,
        blockReason: isBlocked ? blockReason : null,
        blockedAt: isBlocked ? new Date() : null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isBlocked: true,
        blockReason: true,
      },
    });

    return Response.json(
      { 
        message: isBlocked ? 'User blocked successfully' : 'User unblocked successfully', 
        user: updatedUser 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user block status:', error);
    return Response.json(
      { error: 'Failed to update user block status', details: error.message },
      { status: 500 }
    );
  }
}
