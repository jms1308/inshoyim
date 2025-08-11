
export interface Post {
  id: string;
  title: string;
  author_id: string;
  content: any; // Can be string (old) or Editor.js data object
  created_at: string;
  updated_at: string;
  views: number;
  tags: string[];
  status: 'published' | 'draft';
  read_time: number;
  source?: 'user' | 'imported_from_medium';
  comments: Comment[];
  viewed_by?: string[]; // Array of user IDs who have viewed the post
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar_url: string;
  created_at: string;
  bio?: string;
  notifications?: Notification[];
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_id?: string | null;
  replies?: Comment[];
}

export interface Notification {
  id: string;
  user_id: string; // The user who will receive the notification
  type: 'new_comment' | 'new_reply';
  post_id: string;
  post_title: string;
  comment_id: string;
  actor_id: string; // The user who performed the action
  actor_name: string;
  created_at: string;
  read: boolean;
}
