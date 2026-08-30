"use server";

import { createClient } from "@/lib/supabase/server";

export type CapturePageData = {
  slug: string;
  public_name: string;

  political_position: string | null;
  political_party: string | null;
  campaign_number: string | null;

  city: string | null;
  state: string | null;

  slogan: string | null;
  hero_subtitle: string | null;

  logo_url: string | null;
  profile_image_url: string | null;
  hero_image_url: string | null;
  seo_image_url: string | null;

  community_group_url: string | null;

  primary_color: string;
  secondary_color: string;
  accent_color: string;
};

/*
 * Consulta enxuta para a página de captação (/apoiar).
 *
 * Diferente de getLandingPageData, não traz propostas,
 * eventos, galeria etc. — a página de tráfego pago só
 * precisa da identidade visual do candidato e do form.
 */
export async function getCapturePageData(
  slug: string
): Promise<CapturePageData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaign_landing_pages")
    .select(`
      slug,
      public_name,
      political_position,
      political_party,
      campaign_number,
      city,
      state,
      slogan,
      hero_subtitle,
      logo_url,
      profile_image_url,
      hero_image_url,
      seo_image_url,
      community_group_url,
      primary_color,
      secondary_color,
      accent_color
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error(
      "Erro ao carregar página de captação:",
      error
    );

    return null;
  }

  return (data as CapturePageData | null) ?? null;
}
