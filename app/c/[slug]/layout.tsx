import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";

type PublicCampaignLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
};

/*
 * Metadata compartilhada por todas as páginas públicas
 * da campanha (/c/[slug], /propostas, /noticias/...).
 *
 * O favicon por campanha vive aqui — no layout — para
 * que as subpáginas também o herdem. Sem isto, apenas
 * a landing definia o ícone e as demais caíam no padrão.
 */
async function getCampaignIcon(
  slug: string
): Promise<string | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("campaign_landing_pages")
    .select("favicon_url, logo_url")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return data.favicon_url || data.logo_url || null;
}

export async function generateMetadata({
  params,
}: PublicCampaignLayoutProps): Promise<Metadata> {
  const { slug } = await params;

  const icon = await getCampaignIcon(slug);

  if (!icon) {
    return {};
  }

  return {
    icons: {
      icon,
      shortcut: icon,
      apple: icon,
    },
  };
}

export default function PublicCampaignLayout({
  children,
}: PublicCampaignLayoutProps) {
  return children;
}
