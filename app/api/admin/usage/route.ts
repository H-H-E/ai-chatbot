import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getUsageStats } from '@/lib/db/queries';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { usageStats } from '@/lib/db/schema';
import { and, eq, gte, lte } from 'drizzle-orm';

const querySchema = z.object({
  startDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  endDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  userId: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const userId = searchParams.get('userId');

  const conditions = [];

  if (startDate) {
    conditions.push(gte(usageStats.timestamp, new Date(startDate)));
  }

  if (endDate) {
    conditions.push(lte(usageStats.timestamp, new Date(endDate)));
  }

  if (userId) {
    conditions.push(eq(usageStats.userId, userId));
  }

  const stats = await db
    .select()
    .from(usageStats)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(usageStats.timestamp);

  return NextResponse.json(stats);
}
