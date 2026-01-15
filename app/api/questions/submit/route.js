import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Submit answer and set the timer for the next question
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.id;

    const { answer, questionId } = await request.json();
    if (!answer || !questionId) {
      return new Response(JSON.stringify({ error: 'No answer or question ID provided' }), { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Get the question to check correct answer
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      return new Response(JSON.stringify({ error: 'Question not found' }), { status: 404 });
    }

    // Check if answer is correct
    const isCorrect = answer.toUpperCase() === question.correctAnswer.toUpperCase();

    // Set the timestamp NOW when question is submitted
    // This is when the 18-hour timer starts
    const now = new Date();
    await prisma.user.update({
      where: { id: userId },
      data: { lastQuestionTimestamp: now },
    });

    return new Response(JSON.stringify({
      success: true,
      message: isCorrect ? 'Correct answer!' : 'Wrong answer!',
      isCorrect: isCorrect,
      correctAnswer: question.correctAnswer,
      timerStarted: now,
    }), { status: 200 });
  } catch (error) {
    console.error('Submit answer error:', error);
    return new Response(JSON.stringify({ error: 'Failed to submit answer' }), { status: 500 });
  }
}
