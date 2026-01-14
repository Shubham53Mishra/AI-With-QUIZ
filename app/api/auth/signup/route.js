import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password, name, city, country } = await request.json();

    // Validation
    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return Response.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let existingUser;
    try {
      existingUser = await prisma.user.findFirst({
        where: {
          email,
        },
      });
    } catch (dbError) {
      console.error('Database error checking existing user:', dbError.message);
      return Response.json(
        { error: 'Database error. Please try again later.' },
        { status: 500 }
      );
    }

    if (existingUser) {
      return Response.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    let user;
    try {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
          city: city || null,
          country: country || null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          city: true,
          country: true,
          createdAt: true,
        },
      });
    } catch (dbError) {
      console.error('Database error creating user:', dbError.message);
      if (dbError.code === 'P2002') {
        return Response.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
      return Response.json(
        { error: 'Failed to create user. Please try again.' },
        { status: 500 }
      );
    }

    return Response.json(
      { message: 'User created successfully', user },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error.message);
    return Response.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
