import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { customPrompt } from '@/lib/db/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const querySchema = z.object({
  userId: z.string().uuid().optional(),
});

const createPromptSchema = z.object({
  userId: z.string().uuid(),
  promptText: z.string().min(1),
  name: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Parse and validate query parameters
  const { searchParams } = new URL(req.url);
  const result = querySchema.safeParse({
    userId: searchParams.get('userId'),
  });

  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters' },
      { status: 400 },
    );
  }

  const prompts = await db
    .select()
    .from(customPrompt)
    .where(
      result.data.userId
        ? eq(customPrompt.userId, result.data.userId)
        : undefined,
    );

  return NextResponse.json(prompts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const result = createPromptSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      );
    }

    const { userId, promptText, name } = result.data;

    const newPrompt = await db
      .insert(customPrompt)
      .values({
        userId,
        promptText,
        name,
      })
      .returning();

    return NextResponse.json(newPrompt[0]);
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
