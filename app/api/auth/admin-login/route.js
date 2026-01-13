import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return Response.json(
        { error: 'Only admins can access this login' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return Response.json(
      { message: 'Admin login successful', user: userWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return Response.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
