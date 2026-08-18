import type { RichTextValue } from "@/components/editor";

export type LandingData = {
  id: string;
  campaign_id: string;
  slug: string;

  public_name: string;

  political_position: string | null;
  political_party: string | null;
  campaign_number: string | null;

  city: string | null;
  state: string | null;

  slogan: string | null;

  hero_title: string | null;
  hero_subtitle: string | null;

  short_biography: string | null;
  biography: string | null;

  community_group_url: string | null;

  support_cta_title: string | null;
  support_cta_description: string | null;

  logo_url: string | null;
  profile_image_url: string | null;
  hero_image_url: string | null;
  about_image_url: string | null;
about_image_storage_path: string | null;

  favicon_url: string | null;
  seo_image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  custom_domain: string | null;

whatsapp: string | null;
email: string | null;
donation_url: string | null;

  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  x_url: string | null;

  socials: {
    instagram?: string | null;
    facebook?: string | null;
    youtube?: string | null;
    linkedin?: string | null;
  } | null;

  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;

  show_about: boolean;
  show_proposals: boolean;
  show_news: boolean;
  show_agenda: boolean;
  show_gallery: boolean;
  show_support_form: boolean;
  show_social_links: boolean;
};

export type ProposalData = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  summary: string | null;
  content: RichTextValue | string | null;
  icon: string | null;
  display_order: number;
  is_featured: boolean;
};

export type EventData = {
  id: string;
  title: string;
  description: string | null;

  start_at: string;
  ends_at: string | null;

  location: string | null;

  image_url: string | null;
};

export type GalleryImageData = {
  id: string;
  campaign_id: string;
  landing_page_id: string | null;

  title: string | null;
  description: string | null;

  image_url: string;
  storage_path: string;
  alt_text: string | null;

  location: string | null;
  event_date: string | null;

  position: number;
  status:
    | "draft"
    | "published"
    | "archived";

  created_at: string;
  updated_at: string;
};

export type MaterialData = {
  id: string;
  campaign_id: string;

  name: string;
  description: string | null;

  material_group:
    | "social_media"
    | "printed"
    | "identity"
    | "document"
    | "other";

  category:
    | "instagram_post"
    | "instagram_story"
    | "facebook_post"
    | "whatsapp"
    | "santinho"
    | "adesivo"
    | "banner"
    | "faixa"
    | "cartaz"
    | "flyer"
    | "panfleto"
    | "logo"
    | "manual_identidade"
    | "documento"
    | "other";

  status:
    | "pending"
    | "approved"
    | "archived";

  is_official: boolean;

  file_url: string;
  storage_path: string;
  thumbnail_url: string | null;

  mime_type: string | null;
  file_size: number | null;

  created_at: string;
  updated_at: string;
};

export type PostData = {
  id: string;
  campaign_id: string;
  landing_page_id: string | null;

  title: string;
  slug: string;

  excerpt: string | null;
  content: string;

  post_type:
    | "news"
    | "visit"
    | "announcement"
    | "achievement"
    | "positioning"
    | "accountability";

  status:
    | "draft"
    | "published"
    | "archived";

  cover_image_url: string | null;
  cover_image_storage_path: string | null;

  location: string | null;
  event_date: string | null;

  is_featured: boolean;

  seo_title: string | null;
  seo_description: string | null;

  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LeaderData = {
  id: string;
  campaign_id: string;

  full_name: string;
  profession: string | null;

  city: string | null;
  neighborhood: string | null;

  instagram: string | null;
  facebook: string | null;

  area_of_influence: string | null;
  estimated_supporters: number;

  created_at: string;

  image_url: string | null;
};

export type LandingPageData = {
  landing: LandingData;

  proposals: ProposalData[];

  totalProposals: number;
  hasMoreProposals: boolean;

  events: EventData[];

  gallery: GalleryImageData[];

  materials: MaterialData[];

  posts: PostData[];

  leaders: LeaderData[];
};