import { db } from '@/lib/db';
import { tokenUsage } from '@/lib/db/schema';
import { auth } from '@/app/(auth)/auth';
import { CallbackHandlerMethods } from 'langchain/callbacks';

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

    // Calculate total tokens if not provided
    const total = data.totalTokens ?? data.inputTokens + data.outputTokens;

    await db.insert(tokenUsage).values({
      userId: data.userId,
      date: today,
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

    // Get user's limit
    const limits = await db.query.userLimits.findFirst({
      where: (userLimits, { eq }) => eq(userLimits.userId, userId),
    });

    // Default limit if not set
    const maxTokensPerDay = limits?.maxTokensPerDay || 10000;

    // Get today's usage
    const usageResult = await db
      .select({
        totalTokens: db.fn.sum(tokenUsage.totalTokens).as('totalTokens'),
      })
      .from(tokenUsage)
      .where((table) => {
        return db.and(db.eq(table.userId, userId), db.eq(table.date, today));
      });

    const todayUsage = Number(usageResult[0]?.totalTokens || 0);
    return todayUsage >= maxTokensPerDay;
  } catch (error) {
    console.error('Error checking token limits:', error);
    return false; // Default to not exceeded in case of error
  }
}

/**
 * Creates a LangChain callback handler for token tracking
 */
export function createTokenTrackingHandler(): CallbackHandlerMethods {
  let inputTokens = 0;
  let outputTokens = 0;
  let modelName = '';

  return {
    async handleLLMStart(llm) {
      modelName = llm.name || '';
    },
    async handleLLMEnd(output) {
      if (output.llmOutput?.tokenUsage) {
        const { tokenUsage: usage } = output.llmOutput;
        inputTokens += usage.promptTokens || 0;
        outputTokens += usage.completionTokens || 0;
      }

      try {
        const session = await auth();
        if (!session?.user?.id) return;

        await recordTokenUsage({
          userId: session.user.id,
          modelId: modelName,
          inputTokens,
          outputTokens,
        });
      } catch (error) {
        console.error('Error in token tracking callback:', error);
      }
    },
  };
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
