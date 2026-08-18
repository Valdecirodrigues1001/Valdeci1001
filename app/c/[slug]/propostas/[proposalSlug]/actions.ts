"use server";

import { createClient } from "@/lib/supabase/server";

import type {
  LandingData,
  ProposalData,
} from "../../types";

type ProposalNavigationItem = {
  title: string;
  slug: string;
  display_order: number;
};

export type ProposalDetailPageData = {
  landing: LandingData;
  proposal: ProposalData;

  previousProposal:
    | ProposalNavigationItem
    | null;

  nextProposal:
    | ProposalNavigationItem
    | null;
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

  /*
   * Proposta anterior:
   * pega a publicada imediatamente
   * anterior pela ordem de exibição.
   */
  const {
    data: previousProposal,
    error: previousError,
  } = await supabase
    .from("campaign_proposals")
    .select(`
      title,
      slug,
      display_order
    `)
    .eq(
      "campaign_id",
      landing.campaign_id
    )
    .eq(
      "is_published",
      true
    )
    .lt(
      "display_order",
      proposal.display_order
    )
    .order(
      "display_order",
      {
        ascending: false,
      }
    )
    .limit(1)
    .maybeSingle();

  if (previousError) {
    console.error(
      "Erro ao carregar proposta anterior:",
      previousError
    );
  }

  /*
   * Próxima proposta:
   * pega a publicada imediatamente
   * seguinte pela ordem de exibição.
   */
  const {
    data: nextProposal,
    error: nextError,
  } = await supabase
    .from("campaign_proposals")
    .select(`
      title,
      slug,
      display_order
    `)
    .eq(
      "campaign_id",
      landing.campaign_id
    )
    .eq(
      "is_published",
      true
    )
    .gt(
      "display_order",
      proposal.display_order
    )
    .order(
      "display_order",
      {
        ascending: true,
      }
    )
    .limit(1)
    .maybeSingle();

  if (nextError) {
    console.error(
      "Erro ao carregar próxima proposta:",
      nextError
    );
  }

  return {
    landing:
      landing as LandingData,

    proposal:
      proposal as ProposalData,

    previousProposal:
      previousProposal as
        | ProposalNavigationItem
        | null,

    nextProposal:
      nextProposal as
        | ProposalNavigationItem
        | null,
  };
}