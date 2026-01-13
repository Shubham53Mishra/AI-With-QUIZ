import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password, name, adminCode } = await request.json();

    // Validation
    if (!email || !password || !adminCode) {
      return Response.json(
        { error: 'Email, password, and admin code are required' },
        { status: 400 }
      );
    }

    // Verify admin code (you can change this to your actual admin code)
    const ADMIN_CODE = process.env.ADMIN_CODE || 'admin@123';
    if (adminCode !== ADMIN_CODE) {
      return Response.json(
        { error: 'Invalid admin code' },
        { status: 401 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (existingUser) {
      return Response.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: 'admin',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return Response.json(
      { message: 'Admin account created successfully', user },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin signup error:', error);
    return Response.json(
      { error: 'Failed to create admin account' },
      { status: 500 }
    );
  }
}
