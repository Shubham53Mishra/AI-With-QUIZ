import { prisma } from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { userId } = await params;
    const body = await request.json();
    const { role } = body;

    // Validate inputs
    if (!userId) {
      return Response.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!role) {
      return Response.json(
        { error: 'Role is required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['user', 'admin', 'assistant admin'].includes(role)) {
      return Response.json(
        { error: 'Invalid role. Must be "user", "assistant admin", or "admin"' },
        { status: 400 }
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: {
        id: parseInt(userId),
      },
      data: {
        role: role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      },
    });

    return Response.json(
      { message: 'User role updated successfully', user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user role:', error);
    return Response.json(
      { error: 'Failed to update user role', details: error.message },
      { status: 500 }
    );
  }
}
