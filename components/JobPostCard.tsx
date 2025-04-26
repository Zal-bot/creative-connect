import Image from 'next/image';
import { JobPost } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Button } from './ui/Button';

interface JobPostCardProps {
  jobPost: JobPost;
  onApply?: () => void;
}

export function JobPostCard({ jobPost, onApply }: JobPostCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {jobPost.user.profilePic ? (
            <Image
              src={jobPost.user.profilePic}
              alt={jobPost.user.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-500">
                {jobPost.user.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium">{jobPost.user.name}</p>
            <p className="text-sm text-gray-500">
              Posted {formatDate(jobPost.createdAt)}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            jobPost.status === 'open'
              ? 'bg-green-100 text-green-800'
              : jobPost.status === 'in-progress'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {jobPost.status}
        </span>
      </div>

      <h2 className="text-xl font-semibold mb-2">{jobPost.title}</h2>
      <p className="text-gray-600 mb-4">{jobPost.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">File Format</p>
          <p className="font-medium">{jobPost.fileFormat}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Deadline</p>
          <p className="font-medium">{formatDate(jobPost.deadline)}</p>
        </div>
        {jobPost.budget && (
          <div>
            <p className="text-sm text-gray-500">Budget</p>
            <p className="font-medium">{formatCurrency(jobPost.budget)}</p>
          </div>
        )}
      </div>

      {jobPost.videoAttachment.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">Video Attachments</p>
          <div className="grid grid-cols-2 gap-2">
            {jobPost.videoAttachment.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Video {index + 1}
              </a>
            ))}
          </div>
        </div>
      )}

      {onApply && jobPost.status === 'open' && (
        <Button onClick={onApply} className="w-full">
          Apply Now
        </Button>
      )}
    </div>
  );
} 