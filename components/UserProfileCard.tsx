import Image from 'next/image';
import { User } from '@/types';
import { formatDate } from '@/lib/utils';

interface UserProfileCardProps {
  user: User;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-4">
        {user.profilePic ? (
          <Image
            src={user.profilePic}
            alt={user.name}
            width={80}
            height={80}
            className="rounded-full"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-2xl font-semibold text-gray-500">
              {user.name.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-500">Member since {formatDate(user.createdAt)}</p>
        </div>
      </div>

      {user.bio && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">About</h3>
          <p className="text-gray-600">{user.bio}</p>
        </div>
      )}

      {user.skills.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {user.portfolioUrl && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Portfolio</h3>
          <a
            href={user.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View Portfolio
          </a>
        </div>
      )}

      {user.contactDisplay && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Contact</h3>
          <p className="text-gray-600">{user.email}</p>
        </div>
      )}
    </div>
  );
} 