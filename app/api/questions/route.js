import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      orderBy: {
        questionId: 'asc',
      },
    });

    return Response.json({
      success: true,
      questions,
      total: questions.length,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return Response.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { questions, quizSetName } = await request.json();

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return Response.json(
        { error: 'No questions provided' },
        { status: 400 }
      );
    }

    // Create or get quiz set if name is provided
    let quizSet = null;
    if (quizSetName && quizSetName.trim()) {
      quizSet = await prisma.quizSet.create({
        data: {
          name: quizSetName.trim(),
          description: `Created on ${new Date().toLocaleDateString()}`,
        },
      });
    }

    // Find the highest questionId to start from
    const lastQuestion = await prisma.question.findFirst({
      orderBy: { questionId: 'desc' },
    });
    let nextQuestionId = lastQuestion ? lastQuestion.questionId + 1 : 1;

    // Create questions
    const createdQuestions = await Promise.all(
      questions.map((q) =>
        prisma.question.create({
          data: {
            questionId: nextQuestionId++,
            question: String(q.question),
            optionA: String(q.optionA),
            optionB: String(q.optionB),
            optionC: String(q.optionC),
            optionD: String(q.optionD),
            correctAnswer: String(q.correctAnswer),
            quizSetId: quizSet ? quizSet.id : null,
          },
        })
      )
    );

    return Response.json({
      success: true,
      message: `${createdQuestions.length} questions saved successfully`,
      count: createdQuestions.length,
      quizSet,
      questions: createdQuestions,
    });
  } catch (error) {
    console.error('Error saving questions:', error);
    return Response.json(
      { error: 'Failed to save questions: ' + error.message },
      { status: 500 }
    );
  }
}
