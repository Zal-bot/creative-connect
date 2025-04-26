'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { JobPostCard } from '@/components/JobPostCard';
import { Button } from '@/components/ui/Button';
import { JobPost } from '@/types';

const ITEMS_PER_PAGE = 10;

export default function JobsPage() {
  const router = useRouter();
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobPosts();
  }, [currentPage]);

  const fetchJobPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/jobs?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch job posts');
      }

      const data = await response.json();
      setJobPosts(data.jobPosts);
      setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (jobPostId: number) => {
    router.push(`/jobs/${jobPostId}`);
  };

  const handleCreateJob = () => {
    router.push('/jobs/create');
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Job Posts</h1>
        <Button onClick={handleCreateJob}>Create Job Post</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : jobPosts.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-600">No job posts found</h2>
          <p className="mt-2 text-gray-500">Be the first to create a job post!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobPosts.map((jobPost) => (
              <JobPostCard
                key={jobPost.id}
                jobPost={jobPost}
                onApply={() => handleViewDetails(jobPost.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center space-x-2">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 py-2 text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 