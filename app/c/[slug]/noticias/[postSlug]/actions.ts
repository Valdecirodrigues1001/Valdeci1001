"use server";

import { createClient } from "@/lib/supabase/server";

import type {
  PublicPostData,
  PublicPostPageData,
} from "./types";

export async function getPublicPost(
  campaignSlug: string,
  postSlug: string
): Promise<PublicPostPageData | null> {
  const supabase = await createClient();

  const { data: landing, error: landingError } =
    await supabase
      .from("campaign_landing_pages")
      .select(`
        campaign_id,
        slug,
        public_name,
        logo_url,
        primary_color,
        secondary_color,
        accent_color,
        background_color,
        text_color
      `)
      .eq("slug", campaignSlug)
      .eq("is_published", true)
      .maybeSingle();

  if (landingError || !landing) {
    return null;
  }

  const { data: post, error: postError } =
    await supabase
      .from("campaign_posts")
      .select(`
        id,
        campaign_id,
        title,
        slug,
        excerpt,
        content,
        cover_image_url,
        author_name,
        published_at,
        created_at
      `)
      .eq("campaign_id", landing.campaign_id)
      .eq("slug", postSlug)
      .eq("status", "published")
      .maybeSingle();

  if (postError || !post) {
    return null;
  }

  return {
    landing,
    post: post as PublicPostData,
  };
}