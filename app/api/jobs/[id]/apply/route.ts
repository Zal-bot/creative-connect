import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { message } = await request.json();
    const jobPostId = parseInt(params.id, 10);
    const userId = parseInt(session.user.id, 10);

    if (isNaN(jobPostId)) {
      return NextResponse.json(
        { error: 'Invalid job post ID' },
        { status: 400 }
      );
    }

    // Check if job post exists and is open
    const jobPost = await prisma.jobPost.findUnique({
      where: { id: jobPostId },
    });

    if (!jobPost) {
      return NextResponse.json(
        { error: 'Job post not found' },
        { status: 404 }
      );
    }

    if (jobPost.status !== 'open') {
      return NextResponse.json(
        { error: 'This job post is no longer accepting applications' },
        { status: 400 }
      );
    }

    if (jobPost.userId === userId) {
      return NextResponse.json(
        { error: 'You cannot apply to your own job post' },
        { status: 400 }
      );
    }

    // Check if user has already applied
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        jobPostId_userId: {
          jobPostId,
          userId,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this job post' },
        { status: 400 }
      );
    }

    // Create application
    const application = await prisma.jobApplication.create({
      data: {
        jobPostId,
        userId,
        message,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePic: true,
          },
        },
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Application error:', error);
    return NextResponse.json(
      { error: 'An error occurred while submitting your application' },
      { status: 500 }
    );
  }
} 