import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Returns the next question for the user if 18 hours have passed since last unlock
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.id;

    // Get user and their last unlock timestamp
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Find the next question index for this user
    let lastIndex = user.lastQuestionIndex || 0;
    let lastUnlock = user.lastQuestionTimestamp;
    let now = new Date();
    
    // If lastUnlock is null (first time accessing), allow fetch but don't set timestamp yet
    // Timer will only start when question is actually submitted
    let canUnlock = !lastUnlock || (now - new Date(lastUnlock)) >= 18 * 60 * 60 * 1000;

    if (!canUnlock) {
      // Return time left for next unlock
      let nextUnlock = new Date(new Date(lastUnlock).getTime() + 18 * 60 * 60 * 1000);
      return new Response(JSON.stringify({
        success: false,
        message: 'Next question will unlock soon',
        nextUnlock,
        secondsLeft: Math.floor((nextUnlock - now) / 1000),
      }), { status: 200 });
    }

    // Get the next question (just get the next available question)
    const nextQuestion = await prisma.question.findFirst({
      skip: lastIndex,
      take: 1,
      orderBy: { createdAt: 'asc' },
    });
    
    if (!nextQuestion) {
      return new Response(JSON.stringify({ success: false, message: 'No more questions' }), { status: 200 });
    }

    // Only update lastQuestionIndex for now
    // lastQuestionTimestamp will be set when the question is actually submitted
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastQuestionIndex: lastIndex + 1,
      },
    });

    // Calculate next unlock time based on when this question will be submitted
    const nextUnlock = lastUnlock 
      ? new Date(new Date(lastUnlock).getTime() + 18 * 60 * 60 * 1000)
      : new Date(now.getTime() + 18 * 60 * 60 * 1000);

    return new Response(JSON.stringify({
      success: true,
      question: nextQuestion,
      nextUnlock: nextUnlock,
    }), { status: 200 });
  } catch (error) {
    console.error('Unlock question error:', error);
    return new Response(JSON.stringify({ error: 'Failed to unlock question' }), { status: 500 });
  }
}
