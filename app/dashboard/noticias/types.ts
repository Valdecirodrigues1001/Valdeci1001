export type PostStatus =
  | "draft"
  | "published";

export type PostFormData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  author_name: string | null;
  status: PostStatus;
  published_at: string | null;
};

export type PostListItem = {
  id: string;
  campaign_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  author_name: string | null;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
};

export type PostActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};