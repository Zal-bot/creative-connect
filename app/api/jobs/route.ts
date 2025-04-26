import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const jobPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  file_format: z.string().min(1, 'File format is required'),
  budget: z.number().min(0, 'Budget must be positive').optional(),
  deadline: z.string().datetime('Invalid deadline'),
  video_attachment: z.array(z.string()).optional(),
  status: z.enum(['open', 'in-progress', 'closed']).default('open'),
});

// GET all job posts with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('job_posts')
      .select(`
        *,
        user:users(id, name, profile_pic)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: jobPosts, error, count } = await query
      .range(offset, offset + limit - 1)
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch job posts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      jobPosts,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count! / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// CREATE new job post
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = jobPostSchema.parse(body);

    const { data, error } = await supabase
      .from('job_posts')
      .insert({
        ...validatedData,
        user_id: session.user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create job post' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 