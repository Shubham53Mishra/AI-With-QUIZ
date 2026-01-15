import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear all authentication-related cookies
    cookieStore.delete('token');
    cookieStore.delete('authToken');
    cookieStore.delete('refreshToken');
    cookieStore.delete('userId');
    cookieStore.delete('sessionId');

    return new Response(
      JSON.stringify({ 
        message: 'Logout successful',
        cookiesCleared: true,
        clearedCookies: ['token', 'authToken', 'refreshToken', 'userId', 'sessionId']
      }), 
      {
        status: 200,
        headers: {
          'Set-Cookie': [
            'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC; HttpOnly',
            'authToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC; HttpOnly',
            'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC; HttpOnly',
            'userId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC',
            'sessionId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC'
          ].join(',')
        }
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(JSON.stringify({ error: 'Logout failed' }), {
      status: 500,
    });
  }
}
