import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getUsers } from '@/lib/db/queries';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

const querySchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  email: z.string().email().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url);
    const result = querySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      email: searchParams.get('email'),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 },
      );
    }

    const { page, limit, email } = result.data;

    const users = await getUsers({
      page,
      limit,
      emailSearch: email,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function GET_OLD() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const allUsers = await db.select().from(users);

  return NextResponse.json(allUsers);
}
