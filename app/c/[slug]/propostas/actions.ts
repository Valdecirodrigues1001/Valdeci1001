"use server";

import { createClient } from "@/lib/supabase/server";

import type {
  LandingData,
  ProposalData,
} from "../types";

export type AllProposalsPageData = {
  landing: LandingData;
  proposals: ProposalData[];
};

export async function getAllProposalsPageData(
  slug: string
): Promise<AllProposalsPageData | null> {
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
    data: proposals,
    error: proposalsError,
  } = await supabase
    .from("campaign_proposals")
    .select("*")
    .eq(
      "campaign_id",
      landing.campaign_id
    )
    .eq(
      "is_published",
      true
    )
    .order(
      "is_featured",
      {
        ascending: false,
      }
    )
    .order(
      "display_order",
      {
        ascending: true,
      }
    )
    .order(
      "created_at",
      {
        ascending: true,
      }
    );

  if (proposalsError) {
    console.error(
      "Erro ao carregar todas as propostas:",
      proposalsError
    );

    return {
      landing:
        landing as LandingData,
      proposals: [],
    };
  }

  return {
    landing:
      landing as LandingData,

    proposals:
      (
        proposals as
          | ProposalData[]
          | null
      ) ?? [],
  };
}