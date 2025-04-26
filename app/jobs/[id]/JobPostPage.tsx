'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { JobPostDetails } from '@/components/JobPostDetails';
import { ApplyDialog } from '@/components/ApplyDialog';
import { toast } from 'react-hot-toast';

interface JobPostPageProps {
  jobPost: {
    id: number;
    userId: number;
    status: string;
    title: string;
    description: string;
    fileFormat: string;
    deadline: Date;
    budget: number;
    requirements: string[];
    videoAttachments: string[];
    createdAt: Date;
    user: {
      id: number;
      name: string | null;
      profilePic: string | null;
      bio: string | null;
      skills: string[];
      portfolioUrl: string | null;
    };
  };
  currentUserId?: number;
}

export function JobPostPage({ jobPost, currentUserId }: JobPostPageProps) {
  const router = useRouter();
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);

  const handleApply = async (message: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobPost.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit application');
      }

      toast.success('Application submitted successfully!');
      router.refresh();
    } catch (error) {
      console.error('Application error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit application');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <JobPostDetails
        jobPost={jobPost}
        currentUserId={currentUserId}
        onApply={() => setIsApplyDialogOpen(true)}
      />

      <ApplyDialog
        isOpen={isApplyDialogOpen}
        onClose={() => setIsApplyDialogOpen(false)}
        onSubmit={handleApply}
      />
    </div>
  );
} 