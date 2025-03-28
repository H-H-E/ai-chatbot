import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { updateUser } from '@/lib/db/queries';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const updateSchema = z
  .object({
    role: z.enum(['user', 'admin']).optional(),
    tokenLimit: z.number().int().positive().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

const updateUserSchema = z.object({
  role: z.enum(['user', 'admin']).optional(),
  tokenLimit: z.number().min(0).optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const session = await auth();

    // Check if user is authenticated and has admin role
    if (!session?.user || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const body = await req.json();

    // Validate request body
    const result = updateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      );
    }

    const { role, tokenLimit } = result.data;

    await updateUser({
      userId: params.userId,
      role,
      tokenLimit,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in PUT /api/admin/users/[userId]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const result = updateUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      );
    }

    const updates = result.data;

    const updatedUser = await db
      .update(user)
      .set(updates)
      .where(eq(user.id, params.userId))
      .returning();

    if (!updatedUser.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
