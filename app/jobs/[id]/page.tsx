import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { JobPostPage } from './JobPostPage';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  const jobPost = await prisma.jobPost.findUnique({
    where: { id: params.id },
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
    notFound();
  }

  return (
    <JobPostPage
      jobPost={jobPost}
      currentUserId={currentUserId}
    />
  );
} 