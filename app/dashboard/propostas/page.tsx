import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import ProposalForm, {
  type ProposalFormData,
} from "./components/proposal-form";

import ProposalsList, {
  type ProposalListItem,
} from "./components/proposals-list";

type PageProps = {
  searchParams: Promise<{
    edit?: string;
  }>;
};

type CampaignRelation = {
  id: string;
  name: string | null;
  candidate_name: string | null;
};

type CampaignContext = {
  campaignId: string;
  campaignName: string;
};

type CampaignMembershipRow = {
  campaign_id: string;
  campaigns:
    | CampaignRelation
    | CampaignRelation[]
    | null;
};

async function getCampaignContext(): Promise<
  CampaignContext | null
> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("campaign_members")
    .select(`
      campaign_id,
      campaigns (
        id,
        name,
        candidate_name
      )
    `)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", {
      ascending: true,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "Erro ao buscar contexto da campanha:",
      error
    );

    return null;
  }

  if (!data?.campaign_id) {
    return null;
  }

  const membership =
    data as CampaignMembershipRow;

  const campaignData = Array.isArray(
    membership.campaigns
  )
    ? membership.campaigns[0]
    : membership.campaigns;

  return {
    campaignId: membership.campaign_id,
    campaignName:
      campaignData?.candidate_name ||
      campaignData?.name ||
      "Campanha eleitoral",
  };
}

async function getProposals(
  campaignId: string
): Promise<ProposalListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaign_proposals")
    .select(`
      id,
      campaign_id,
      title,
      slug,
      category,
      summary,
      content,
      icon,
      display_order,
      is_featured,
      is_published,
      created_at,
      updated_at
    `)
    .eq("campaign_id", campaignId)
    .order("display_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Erro ao buscar propostas:",
      error
    );

    return [];
  }

  return (data ?? []) as ProposalListItem[];
}

async function getProposalForEditing(
  proposalId: string,
  campaignId: string
): Promise<ProposalFormData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaign_proposals")
    .select(`
      id,
      title,
      slug,
      category,
      summary,
      content,
      icon,
      display_order,
      is_featured,
      is_published
    `)
    .eq("id", proposalId)
    .eq("campaign_id", campaignId)
    .maybeSingle();

  if (error) {
    console.error(
      "Erro ao buscar proposta para edição:",
      error
    );

    return null;
  }

  return data as ProposalFormData | null;
}

export default async function ProposalsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const context = await getCampaignContext();

  if (!context) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8">
            <h1 className="text-xl font-bold text-amber-950">
              Campanha não encontrada
            </h1>

            <p className="mt-2 text-sm leading-6 text-amber-800">
              Seu usuário ainda não está vinculado a uma
              campanha ativa.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const proposals = await getProposals(
    context.campaignId
  );

  let editingProposal: ProposalFormData | null =
    null;

  if (params.edit) {
    editingProposal =
      await getProposalForEditing(
        params.edit,
        context.campaignId
      );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Conteúdo da campanha
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950">
            Propostas e bandeiras
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Cadastre e gerencie as propostas de{" "}
            <strong className="font-bold text-slate-700">
              {context.campaignName}
            </strong>{" "}
            para exibição na página pública da
            campanha.
          </p>
        </header>

        {params.edit && !editingProposal && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm font-bold text-amber-900">
              Proposta não encontrada
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-700">
              A proposta selecionada não existe ou
              não pertence à campanha atual.
            </p>
          </div>
        )}

        <div className="mt-8 grid items-start gap-8 xl:grid-cols-[420px_minmax(0,1fr)]">
         <ProposalForm
  key={
    editingProposal?.id
      ? `edit-${editingProposal.id}`
      : "new-proposal"
  }
  proposal={editingProposal}
/>

          <ProposalsList
            proposals={proposals}
            editingProposalId={
              editingProposal?.id ?? null
            }
          />
        </div>
      </div>
    </main>
  );
}