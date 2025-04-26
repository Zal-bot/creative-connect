import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './ui/Button';
import { JobPost } from '@/types';

// Define the form schema with Zod
const jobPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
  fileFormat: z.string().min(1, 'File format is required'),
  budget: z.number().min(0, 'Budget cannot be negative').optional(),
  deadline: z.string().min(1, 'Deadline is required'),
  videoAttachment: z.array(z.string().url('Invalid video URL')).max(5, 'Maximum 5 video attachments allowed').optional(),
});

// Infer TypeScript type from Zod schema
type JobPostFormData = z.infer<typeof jobPostSchema>;

// Define component props interface
interface JobPostFormProps {
  onSubmit: (data: JobPostFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<JobPost>;
}

// Define file format options
const FILE_FORMATS = [
  'PDF',
  'DOCX',
  'PPTX',
  'XLSX',
  'JPG',
  'PNG',
  'MP4',
  'AVI',
  'MOV',
  'GIF',
] as const;

export function JobPostForm({ onSubmit, isLoading, initialData }: JobPostFormProps) {
  // State for managing video URLs
  const [videoUrls, setVideoUrls] = useState<string[]>(initialData?.videoAttachment || []);
  const [newVideoUrl, setNewVideoUrl] = useState('');

  // Initialize react-hook-form with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<JobPostFormData>({
    resolver: zodResolver(jobPostSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      fileFormat: initialData?.fileFormat || '',
      budget: initialData?.budget,
      deadline: initialData?.deadline ? new Date(initialData.deadline).toISOString().slice(0, 16) : '',
      videoAttachment: initialData?.videoAttachment || [],
    },
  });

  // Handle adding a new video URL
  const handleAddVideoUrl = () => {
    if (newVideoUrl && videoUrls.length < 5) {
      const updatedUrls = [...videoUrls, newVideoUrl];
      setVideoUrls(updatedUrls);
      setValue('videoAttachment', updatedUrls);
      setNewVideoUrl('');
    }
  };

  // Handle removing a video URL
  const handleRemoveVideoUrl = (index: number) => {
    const updatedUrls = videoUrls.filter((_, i) => i !== index);
    setVideoUrls(updatedUrls);
    setValue('videoAttachment', updatedUrls);
  };

  // Handle form submission
  const handleFormSubmit = async (data: JobPostFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 max-w-2xl mx-auto">
      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          {...register('title')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Enter job title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          {...register('description')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Enter job description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* File Format Field */}
      <div>
        <label htmlFor="fileFormat" className="block text-sm font-medium text-gray-700">
          File Format
        </label>
        <select
          id="fileFormat"
          {...register('fileFormat')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">Select a format</option>
          {FILE_FORMATS.map((format) => (
            <option key={format} value={format}>
              {format}
            </option>
          ))}
        </select>
        {errors.fileFormat && (
          <p className="mt-1 text-sm text-red-600">{errors.fileFormat.message}</p>
        )}
      </div>

      {/* Budget Field */}
      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
          Budget (optional)
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="budget"
            step="0.01"
            min="0"
            {...register('budget', { valueAsNumber: true })}
            className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="0.00"
          />
        </div>
        {errors.budget && (
          <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>
        )}
      </div>

      {/* Deadline Field */}
      <div>
        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
          Deadline
        </label>
        <input
          type="datetime-local"
          id="deadline"
          {...register('deadline')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {errors.deadline && (
          <p className="mt-1 text-sm text-red-600">{errors.deadline.message}</p>
        )}
      </div>

      {/* Video Attachments Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Video Attachments (optional)
        </label>
        <div className="mt-1 flex space-x-2">
          <input
            type="url"
            value={newVideoUrl}
            onChange={(e) => setNewVideoUrl(e.target.value)}
            placeholder="Enter video URL"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <Button
            type="button"
            onClick={handleAddVideoUrl}
            disabled={videoUrls.length >= 5 || !newVideoUrl}
            className="whitespace-nowrap"
          >
            Add
          </Button>
        </div>
        {videoUrls.length > 0 && (
          <div className="mt-2 space-y-2">
            {videoUrls.map((url, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-2 rounded"
              >
                <span className="text-sm text-gray-600 truncate">{url}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveVideoUrl(index)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        {errors.videoAttachment && (
          <p className="mt-1 text-sm text-red-600">{errors.videoAttachment.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Creating...' : 'Create Job Post'}
      </Button>
    </form>
  );
} 