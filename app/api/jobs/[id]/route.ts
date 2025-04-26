import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobPost = await prisma.jobPost.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePic: true,
            bio: true,
            skills: true,
            portfolioUrl: true,
          },
        },
      },
    });

    if (!jobPost) {
      return NextResponse.json(
        { error: 'Job post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(jobPost);
  } catch (error) {
    console.error('Get job post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('userId');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const jobPost = await prisma.jobPost.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!jobPost) {
      return NextResponse.json(
        { error: 'Job post not found' },
        { status: 404 }
      );
    }

    if (jobPost.userId !== parseInt(userId)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.jobPost.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json(
      { message: 'Job post deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete job post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 