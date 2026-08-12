export type CampaignSettings = {
  id: string;
  campaign_id: string;

  // Campanha
  public_name: string;
  political_position: string | null;
  campaign_number: string | null;
  political_party: string | null;
  city: string | null;
  state: string | null;
  slogan: string | null;

  // Identidade
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  contrast_color: string | null;
  background_color: string | null;
  text_color: string | null;

  // Contatos
  whatsapp: string | null;
  email: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  x_url: string | null;

  // SEO / domínio
  custom_domain: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;

  // Controle
  created_at?: string;
  updated_at?: string;
};

export type CampaignModuleSettings = {
  supporters: boolean;
  volunteers: boolean;
  leaders: boolean;
  events: boolean;
  news: boolean;
  proposals: boolean;
  gallery: boolean;
  materials: boolean;
  whatsapp_groups: boolean;
};

export type SettingsPageData = {
  campaign: CampaignSettings;
  modules: CampaignModuleSettings;
};