import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    return new Response(JSON.stringify({
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      }
    }), {
      status: 200,
    });
  } catch (error) {
    console.error('Auth verification error:', error.message);
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401,
    });
  }
}
