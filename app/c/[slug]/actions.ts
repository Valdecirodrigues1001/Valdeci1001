"use server";

import { createClient } from "@/lib/supabase/server";

import type {
  EventData,
  GalleryImageData,
  LandingData,
  LandingPageData,
  LeaderData,
  MaterialData,
  PostData,
  ProposalData,
} from "./types";

export async function getLandingPageData(
  slug: string
): Promise<LandingPageData | null> {
  const supabase = await createClient();

  const { data: landing, error: landingError } =
    await supabase
      .from("campaign_landing_pages")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

  if (landingError) {
    console.error(
      "Erro ao carregar Landing Page pública:",
      landingError
    );

    return null;
  }

  if (!landing) {
    return null;
  }

  const campaignId = landing.campaign_id;

  const [
    proposalsResult,
    eventsResult,
    galleryResult,
    materialsResult,
    postsResult,
    leadersResult,
  ] = await Promise.all([
    supabase
      .from("campaign_proposals")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("is_published", true)
      .order("display_order", {
        ascending: true,
      }),

    supabase
  .from("campaign_events")
  .select("*")
  .eq("campaign_id", campaignId)
  .in("status", ["scheduled", "confirmed"])
  .gte("start_at", new Date().toISOString())
  .order("start_at", {
    ascending: true,
  }),

    supabase
  .from("campaign_gallery")
  .select("*")
  .eq("campaign_id", campaignId)
  .eq("status", "published")
  .order("position", {
    ascending: true,
  }),

    supabase
  .from("campaign_materials")
  .select("*")
  .eq("campaign_id", campaignId)
  .eq("status", "approved")
  .order("created_at", {
    ascending: false,
  }),

   supabase
  .from("campaign_posts")
  .select("*")
  .eq("campaign_id", campaignId)
  .eq("status", "published")
  .order("published_at", {
    ascending: false,
    nullsFirst: false,
  }),

   supabase
  .from("leaders")
  .select(`
    id,
    campaign_id,
    full_name,
    profession,
    image_url,
    city,
    neighborhood,
    instagram,
    facebook,
    area_of_influence,
    estimated_supporters,
    created_at
  `)
  .eq("campaign_id", campaignId)
  .eq("is_active", true)
  .eq("status", "active")
  .order("created_at", {
    ascending: true,
  }),
  ]);

  if (proposalsResult.error) {
    console.error(
      "Erro ao carregar propostas:",
      proposalsResult.error
    );
  }

  if (eventsResult.error) {
    console.error(
      "Erro ao carregar eventos:",
      eventsResult.error
    );
  }

  if (galleryResult.error) {
    console.error(
      "Erro ao carregar galeria:",
      galleryResult.error
    );
  }

  if (materialsResult.error) {
    console.error(
      "Erro ao carregar materiais:",
      materialsResult.error
    );
  }

  if (postsResult.error) {
    console.error(
      "Erro ao carregar notícias:",
      postsResult.error
    );
  }

  if (leadersResult.error) {
    console.error(
      "Erro ao carregar lideranças:",
      leadersResult.error
    );
  }

  return {
    landing: landing as LandingData,

    proposals:
      (proposalsResult.data as ProposalData[] | null) ?? [],

    events:
      (eventsResult.data as EventData[] | null) ?? [],

    gallery:
      (galleryResult.data as GalleryImageData[] | null) ?? [],

    materials:
      (materialsResult.data as MaterialData[] | null) ?? [],

    posts:
      (postsResult.data as PostData[] | null) ?? [],

    leaders:
      (leadersResult.data as LeaderData[] | null) ?? [],
  };
}