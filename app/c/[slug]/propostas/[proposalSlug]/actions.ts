"use server";

import { createClient } from "@/lib/supabase/server";

import type {
  LandingData,
  ProposalData,
} from "../../types";

export type ProposalDetailPageData = {
  landing: LandingData;
  proposal: ProposalData;
};

export async function getProposalDetailPageData(
  slug: string,
  proposalSlug: string
): Promise<ProposalDetailPageData | null> {
  const supabase = await createClient();

  const {
    data: landing,
    error: landingError,
  } = await supabase
    .from("campaign_landing_pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (landingError) {
    console.error(
      "Erro ao carregar Landing Page:",
      landingError
    );

    return null;
  }

  if (!landing) {
    return null;
  }

  const {
    data: proposal,
    error: proposalError,
  } = await supabase
    .from("campaign_proposals")
    .select("*")
    .eq(
      "campaign_id",
      landing.campaign_id
    )
    .eq(
      "slug",
      proposalSlug
    )
    .eq(
      "is_published",
      true
    )
    .maybeSingle();

  if (proposalError) {
    console.error(
      "Erro ao carregar proposta:",
      proposalError
    );

    return null;
  }

  if (!proposal) {
    return null;
  }

  return {
    landing:
      landing as LandingData,

    proposal:
      proposal as ProposalData,
  };
}