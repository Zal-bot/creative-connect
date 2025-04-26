import { createClient } from '@supabase/supabase-js';
import { Message, JobPost } from '@/types/supabase';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Helper function to subscribe to new messages
export const subscribeToMessages = (
  userId: string,
  otherUserId: string,
  callback: (message: Message) => void
) => {
  const channel = supabase
    .channel(`messages:${userId}:${otherUserId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId}))`,
      },
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Helper function to subscribe to job post updates
export const subscribeToJobPosts = (
  userId: string,
  callback: (jobPost: JobPost) => void
) => {
  const channel = supabase
    .channel(`job_posts:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'job_posts',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as JobPost);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}; 