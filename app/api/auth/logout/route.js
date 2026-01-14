import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('adminToken');
    cookieStore.delete('authToken');

    return new Response(JSON.stringify({ message: 'Logout successful' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(JSON.stringify({ error: 'Logout failed' }), {
      status: 500,
    });
  }
}
