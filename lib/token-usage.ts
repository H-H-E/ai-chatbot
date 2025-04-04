import { db } from '@/lib/db';
import { tokenUsage } from '@/lib/db/schema';
import { auth } from '@/app/(auth)/auth';
import { sql } from 'drizzle-orm';

// Interface to match Vercel AI SDK or LangChain usage format
export interface TokenUsageData {
  userId: string;
  modelId?: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens?: number;
  chatId?: string;
}

/**
 * Records token usage in the database
 */
export async function recordTokenUsage(data: TokenUsageData) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateString = today.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format

    // Calculate total tokens if not provided
    const total = data.totalTokens ?? data.inputTokens + data.outputTokens;

    await db.insert(tokenUsage).values({
      userId: data.userId,
      date: dateString,
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      totalTokens: total,
      modelId: data.modelId,
      chatId: data.chatId,
    });

    return true;
  } catch (error) {
    console.error('Error recording token usage:', error);
    return false;
  }
}

/**
 * Checks if a user has exceeded their daily token limit
 */
export async function hasExceededDailyLimit(userId: string): Promise<boolean> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateString = today.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format

    // Default limit - in a production app you would get this from a user settings table
    const maxTokensPerDay = 10000;

    // Get today's usage with direct SQL query
    const usageResult = await db
      .select({
        totalTokens: sql<number>`sum(${tokenUsage.totalTokens})`.as(
          'totalTokens',
        ),
      })
      .from(tokenUsage)
      .where(
        sql`${tokenUsage.userId} = ${userId} AND ${tokenUsage.date} = ${dateString}`,
      );

    const todayUsage = Number(usageResult[0]?.totalTokens || 0);
    return todayUsage >= maxTokensPerDay;
  } catch (error) {
    console.error('Error checking token limits:', error);
    return false; // Default to not exceeded in case of error
  }
}

/**
 * Wraps the Vercel AI SDK handlers to track token usage
 */
export function withTokenTracking(handler: any) {
  return async (req: Request) => {
    const session = await auth();
    if (!session?.user?.id) {
      return handler(req);
    }

    try {
      // Check if user has exceeded their daily limit
      const hasExceeded = await hasExceededDailyLimit(session.user.id);
      if (hasExceeded) {
        return new Response(
          JSON.stringify({
            error: 'Daily token limit exceeded. Please try again tomorrow.',
          }),
          { status: 429 },
        );
      }

      // Process normally
      const result = await handler(req);

      // If the result has usage data (some models provide this directly)
      if (result.usage) {
        await recordTokenUsage({
          userId: session.user.id,
          inputTokens: result.usage.prompt_tokens || 0,
          outputTokens: result.usage.completion_tokens || 0,
          totalTokens: result.usage.total_tokens || 0,
        });
      }

      return result;
    } catch (error) {
      console.error('Error in token tracking wrapper:', error);
      return handler(req);
    }
  };
}
