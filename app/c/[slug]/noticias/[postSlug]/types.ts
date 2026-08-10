export type PublicPostData = {
  id: string;
  campaign_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  author_name: string | null;
  published_at: string | null;
  created_at: string;
};

export type PublicPostPageData = {
  landing: {
    slug: string;
    public_name: string;
    logo_url: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    accent_color: string | null;
    background_color: string | null;
    text_color: string | null;
  };
  post: PublicPostData;
};