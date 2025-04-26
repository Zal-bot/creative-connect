'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { Message, JobPost } from '@/types/supabase';

export default function TestPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [otherUserId, setOtherUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Test user profile
  const testUserProfile = async () => {
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${session.user.id}`);
      const data = await response.json();
      console.log('User Profile:', data);
    } catch (error) {
      setError('Failed to fetch user profile');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test job posts
  const testJobPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs');
      const data = await response.json();
      setJobPosts(data.jobPosts);
      console.log('Job Posts:', data);
    } catch (error) {
      setError('Failed to fetch job posts');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test messages
  const testMessages = async () => {
    if (!session?.user?.id || !otherUserId) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/messages?otherUserId=${otherUserId}`);
      const data = await response.json();
      setMessages(data);
      console.log('Messages:', data);
    } catch (error) {
      setError('Failed to fetch messages');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!session?.user?.id || !receiverId || !newMessage) return;
    try {
      setLoading(true);
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          receiver_id: receiverId,
        }),
      });
      const data = await response.json();
      console.log('Message sent:', data);
      setNewMessage('');
      testMessages();
    } catch (error) {
      setError('Failed to send message');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!session?.user?.id) return;

    const messageSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('New message:', payload.new);
          testMessages();
        }
      )
      .subscribe();

    const jobPostSubscription = supabase
      .channel('job_posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_posts',
        },
        (payload) => {
          console.log('Job post update:', payload.new);
          testJobPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
      supabase.removeChannel(jobPostSubscription);
    };
  }, [session?.user?.id]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to test the features.</p>
        <a
          href="/auth/login"
          className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-2xl font-bold">Feature Testing</h1>
      <p className="text-gray-600">Logged in as: {session.user.email}</p>

      {/* User Profile Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">User Profile</h2>
        <button
          onClick={testUserProfile}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Test User Profile'}
        </button>
      </section>

      {/* Job Posts Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Job Posts</h2>
        <button
          onClick={testJobPosts}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Test Job Posts'}
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobPosts.map((post) => (
            <div key={post.id} className="p-4 border rounded">
              <h3 className="font-semibold">{post.title}</h3>
              <p className="text-sm text-gray-600">{post.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Messaging Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Messaging</h2>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Other User ID"
            value={otherUserId}
            onChange={(e) => setOtherUserId(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={testMessages}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Test Messages'}
          </button>
        </div>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Receiver ID"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </div>
        <div className="space-y-2">
          {messages.map((message) => (
            <div key={message.id} className="p-2 border rounded">
              <p className="font-semibold">{message.sender?.name}</p>
              <p>{message.content}</p>
            </div>
          ))}
        </div>
      </section>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
} 