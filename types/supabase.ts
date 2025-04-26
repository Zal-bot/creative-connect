export type Message = {
  id: number;
  content: string;
  sender_id: string;
  receiver_id: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    name: string;
    profile_pic: string | null;
  };
  receiver?: {
    id: string;
    name: string;
    profile_pic: string | null;
  };
};

export type JobPost = {
  id: number;
  title: string;
  description: string;
  file_format: string;
  budget: number | null;
  deadline: string;
  video_attachment: string[] | null;
  status: 'open' | 'in-progress' | 'closed';
  user_id: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    profile_pic: string | null;
  };
}; 