
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
  viewed_by?: string[]; // Array of user IDs who have viewed the post
  author?: User; // Author data can be attached here
  comments?: Comment[]; // Comments are nested within the post
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar_url: string;
  created_at: string;
  bio?: string;
}

export interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_id?: string | null;
  // replies array is dynamically built, not stored in DB
}
