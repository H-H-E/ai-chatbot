import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { tokenUsage } from '@/lib/db/schema';
import { and, eq, gte, lte, sql } from 'drizzle-orm';

export async function GET(req: Request) {
  const session = await auth();

  // Check if user is authenticated and is an admin
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
  }

  // Get date range from query parameters
  const { searchParams } = new URL(req.url);
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');
  const userId = searchParams.get('userId');

  // Default to last 30 days if not specified
  const endDate = endDateParam ? new Date(endDateParam) : new Date();
  const startDate = startDateParam
    ? new Date(startDateParam)
    : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

  try {
    // Build query conditions
    let conditions = and(
      gte(tokenUsage.date, startDate),
      lte(tokenUsage.date, endDate),
    );

    // Add user filter if provided
    if (userId) {
      conditions = and(conditions, eq(tokenUsage.userId, userId));
    }

    // Get daily usage stats
    const dailyStats = await db
      .select({
        date: tokenUsage.date,
        totalInputTokens: sql<number>`sum(${tokenUsage.inputTokens})`,
        totalOutputTokens: sql<number>`sum(${tokenUsage.outputTokens})`,
        totalTokens: sql<number>`sum(${tokenUsage.totalTokens})`,
        uniqueUsers: sql<number>`count(distinct ${tokenUsage.userId})`,
      })
      .from(tokenUsage)
      .where(conditions)
      .groupBy(tokenUsage.date)
      .orderBy(tokenUsage.date);

    // Get model usage stats
    const modelStats = await db
      .select({
        modelId: tokenUsage.modelId,
        totalInputTokens: sql<number>`sum(${tokenUsage.inputTokens})`,
        totalOutputTokens: sql<number>`sum(${tokenUsage.outputTokens})`,
        totalTokens: sql<number>`sum(${tokenUsage.totalTokens})`,
      })
      .from(tokenUsage)
      .where(conditions)
      .groupBy(tokenUsage.modelId)
      .orderBy(sql`sum(${tokenUsage.totalTokens}) desc`);

    // Get total counts
    const totals = await db
      .select({
        totalInputTokens: sql<number>`sum(${tokenUsage.inputTokens})`,
        totalOutputTokens: sql<number>`sum(${tokenUsage.outputTokens})`,
        totalTokens: sql<number>`sum(${tokenUsage.totalTokens})`,
        uniqueUsers: sql<number>`count(distinct ${tokenUsage.userId})`,
        conversationCount: sql<number>`count(distinct ${tokenUsage.chatId})`,
      })
      .from(tokenUsage)
      .where(conditions);

    // Get top users if no specific user is requested
    const topUsers = !userId
      ? await db
          .select({
            userId: tokenUsage.userId,
            totalTokens: sql<number>`sum(${tokenUsage.totalTokens})`,
          })
          .from(tokenUsage)
          .where(conditions)
          .groupBy(tokenUsage.userId)
          .orderBy(sql`sum(${tokenUsage.totalTokens}) desc`)
          .limit(10)
      : [];

    return NextResponse.json({
      success: true,
      data: {
        dailyStats,
        modelStats,
        totals: totals[0],
        topUsers,
        dateRange: {
          startDate,
          endDate,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 },
    );
  }
}
