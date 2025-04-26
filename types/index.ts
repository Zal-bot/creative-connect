export interface User {
  id: number;
  name: string;
  email: string;
  profilePic?: string;
  bio?: string;
  portfolioUrl?: string;
  skills: string[];
  contactDisplay: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobPost {
  id: number;
  title: string;
  description: string;
  fileFormat: string;
  budget?: number;
  deadline: Date;
  videoAttachment: string[];
  status: "open" | "in-progress" | "completed";
  userId: number;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  sender: User;
  receiver: User;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: number;
  amount: number;
  status: "pending" | "completed" | "refunded";
  jobPostId: number;
  jobPost: JobPost;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface JobPostFilters {
  title?: string;
  skills?: string[];
  minBudget?: number;
  maxBudget?: number;
  status?: "open" | "in-progress" | "completed";
  deadline?: Date;
} 