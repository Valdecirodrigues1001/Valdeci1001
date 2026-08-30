/*
 * Só o que Configurações ainda edita. O resto (nome do
 * candidato, cores, contatos, SEO, imagens) vive em
 * app/dashboard/landing-page — fonte única.
 */
export type CampaignSettings = {
  id: string;
  campaign_id: string;
  slug: string | null;
  custom_domain: string | null;

  // Rastreamento / pixels (tráfego pago)
  meta_pixel_id: string | null;
  ga4_measurement_id: string | null;
  google_ads_tag_id: string | null;
  google_ads_conversion_label: string | null;

  // Controle
  created_at?: string;
  updated_at?: string;
};

export type RegionalGroup = {
  id: string;
  name: string;
  ddd: string | null;
  whatsapp_group_url: string | null;
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