import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) return NextResponse.json({ candidates: [], jobs: [] });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { workspaceMembers: true },
  });
  const workspaceId = user?.workspaceMembers[0]?.workspaceId;

  if (!workspaceId) return NextResponse.json({ candidates: [], jobs: [] });

  const candidates = await prisma.candidate.findMany({
    where: {
      job: { workspaceId },
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: 5,
  });

  const jobs = await prisma.job.findMany({
    where: {
      workspaceId,
      title: { contains: q, mode: 'insensitive' },
    },
    take: 5,
  });

  return NextResponse.json({ candidates, jobs });
}
