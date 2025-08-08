export interface Post {
  id: string;
  title: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  views: number;
  tags: string[];
  status: 'published' | 'draft';
  read_time: number;
  source?: 'user' | 'imported_from_medium';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  created_at: string;
  bio?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}
