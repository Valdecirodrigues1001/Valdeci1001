import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";

import { Sidebar } from "@/components/dashboard/sidebar";
import { createClient } from "@/lib/supabase/server";
import type { CampaignRole } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Painel",
  robots: {
    index: false,
    follow: false,
  },
};

type CampaignData = {
  id: string;
  name: string;
  candidate_name: string;
  candidate_position: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership, error } = await supabase
    .from("campaign_members")
    .select(`
      campaign_id,
      role,
      campaigns (
        id,
        name,
        candidate_name,
        candidate_position,
        logo_url,
        primary_color,
        secondary_color
      )
    `)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "Erro ao buscar campanha:",
      error.message
    );
  }

  const campaignRelation = membership?.campaigns;

  const campaign = (
    Array.isArray(campaignRelation)
      ? campaignRelation[0]
      : campaignRelation
  ) as CampaignData | null | undefined;

  if (!campaign || !membership) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Campanha não encontrada
          </h1>

          <p className="mt-3 text-slate-500">
            Seu usuário ainda não possui uma campanha ativa vinculada.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <Sidebar
        campaignName={campaign.name}
        candidateName={campaign.candidate_name}
        candidatePosition={campaign.candidate_position}
        logoUrl={campaign.logo_url}
        primaryColor={campaign.primary_color}
        secondaryColor={campaign.secondary_color}
        role={membership.role as CampaignRole}
      />

      <div className="min-h-screen lg:pl-72">
        {children}
      </div>

      <Toaster
        position="top-right"
        richColors
        closeButton
      />
    </div>
  );
}