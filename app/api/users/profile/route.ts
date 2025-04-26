import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateVideoUrl } from '@/lib/utils';

const prisma = new PrismaClient();

export async function PATCH(request: Request) {
  try {
    const userId = request.headers.get('userId');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      name,
      bio,
      profilePic,
      portfolioUrl,
      skills,
      contactDisplay,
    } = await request.json();

    // Validate input
    if (bio && bio.length > 500) {
      return NextResponse.json(
        { error: 'Bio must be less than 500 characters' },
        { status: 400 }
      );
    }

    if (skills && skills.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 skills allowed' },
        { status: 400 }
      );
    }

    if (portfolioUrl && !validateVideoUrl(portfolioUrl)) {
      return NextResponse.json(
        { error: 'Invalid portfolio URL' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        name,
        bio,
        profilePic,
        portfolioUrl,
        skills,
        contactDisplay,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        bio: true,
        portfolioUrl: true,
        skills: true,
        contactDisplay: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 