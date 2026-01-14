import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    // Get total users count
    const totalUsers = await prisma.user.count();

    // Get total admins count (only 'admin' role, not 'assistant admin')
    const totalAdmins = await prisma.user.count({
      where: {
        role: 'admin',
      },
    });

    // Get assistant admins count
    const assistantAdmins = await prisma.user.count({
      where: {
        role: 'assistant admin',
      },
    });

    // Get regular users count (not blocked, not admin, not assistant admin)
    const regularUsers = await prisma.user.count({
      where: {
        role: 'user',
        isBlocked: false,
      },
    });

    // Get blocked users count
    const blockedUsers = await prisma.user.count({
      where: {
        isBlocked: true,
      },
    });

    // Get total quizzes count
    const totalQuizzes = await prisma.quiz.count();

    // Get users by country
    const usersByCountry = await prisma.user.groupBy({
      by: ['country'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Get users by city
    const usersByCity = await prisma.user.groupBy({
      by: ['city'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        country: true,
        city: true,
        isBlocked: true,
        blockReason: true,
        blockedAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get all quizzes
    const quizzes = await prisma.quiz.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        userId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get quizzes by user (top quiz creators)
    const topQuizCreators = await prisma.quiz.groupBy({
      by: ['userId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    return Response.json(
      {
        stats: {
          totalUsers,
          totalAdmins,
          assistantAdmins,
          regularUsers,
          blockedUsers,
          totalQuizzes,
          recentUsers,
          avgQuizzesPerUser: totalUsers > 0 ? (totalQuizzes / totalUsers).toFixed(2) : 0,
        },
        usersByCountry: usersByCountry.map((item) => ({
          country: item.country || 'Not Specified',
          count: item._count.id,
        })),
        usersByCity: usersByCity.map((item) => ({
          city: item.city || 'Not Specified',
          count: item._count.id,
        })),
        topQuizCreators,
        users,
        quizzes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return Response.json(
      { error: 'Failed to fetch admin data' },
      { status: 500 }
    );
  }
}
