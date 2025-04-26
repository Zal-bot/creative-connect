import { JobPost } from '@/types/prisma';
import { formatDate } from '@/lib/utils';
import { Button } from './ui/Button';
import Image from 'next/image';
import Link from 'next/link';

interface JobPostDetailsProps {
  jobPost: JobPost;
  currentUserId?: number;
  onApply?: () => void;
}

export function JobPostDetails({ jobPost, currentUserId, onApply }: JobPostDetailsProps) {
  const isOwner = currentUserId === jobPost.userId;
  const canApply = !isOwner && jobPost.status === 'open';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          {jobPost.user.profilePic ? (
            <Image
              src={jobPost.user.profilePic}
              alt={jobPost.user.name || 'User profile'}
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-lg font-semibold text-gray-600">
                {jobPost.user.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          )}
          <div>
            <Link
              href={`/profile/${jobPost.user.id}`}
              className="text-lg font-semibold hover:text-blue-600"
            >
              {jobPost.user.name}
            </Link>
            <p className="text-sm text-gray-500">
              Posted {formatDate(jobPost.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
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
          {canApply && onApply && (
            <Button onClick={onApply} variant="default">
              Apply Now
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{jobPost.title}</h1>
        <p className="text-gray-700 whitespace-pre-line">{jobPost.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900">Requirements</h3>
          <ul className="list-disc list-inside space-y-1">
            {jobPost.requirements.map((req: string, index: number) => (
              <li key={index} className="text-gray-700">
                {req}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900">Details</h3>
          <div className="space-y-1">
            <p className="text-gray-700">
              <span className="font-medium">File Format:</span> {jobPost.fileFormat}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Deadline:</span>{' '}
              {formatDate(jobPost.deadline)}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Budget:</span> ${jobPost.budget}
            </p>
          </div>
        </div>
      </div>

      {jobPost.videoAttachments.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900">Video Attachments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobPost.videoAttachments.map((url: string, index: number) => (
              <div key={index} className="aspect-video relative">
                <video
                  src={url}
                  controls
                  className="w-full h-full rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 