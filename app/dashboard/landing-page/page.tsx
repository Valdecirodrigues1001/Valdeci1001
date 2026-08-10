import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import CreateLandingForm from "./components/create-landing-form";
import GeneralForm from "./components/general-form";
import LandingHeader from "./components/landing-header";
import LandingStatusCard from "./components/landing-status-card";
import ImagesForm from "./components/images-form";
import AppearanceForm from "./components/appearance-form";
import LandingUrlCard from "./components/landing-url-card";
import SocialForm from "./components/social-form";
import SeoForm from "./components/seo-form";

type LandingPageData = {
  id: string;
  campaign_id: string;
  public_name: string;
  slug: string;

  political_position: string | null;
  campaign_number: string | null;
  political_party: string | null;
  city: string | null;
  state: string | null;

  slogan: string | null;
  short_biography: string | null;
  biography: string | null;

  hero_title: string | null;
  hero_subtitle: string | null;

  support_cta_title: string | null;
  support_cta_description: string | null;

  logo_url: string | null;
  logo_storage_path: string | null;

  profile_image_url: string | null;
  profile_image_storage_path: string | null;

  hero_image_url: string | null;
  hero_image_storage_path: string | null;

  favicon_url: string | null;
  favicon_storage_path: string | null;

  seo_image_url: string | null;
  seo_image_storage_path: string | null;

  seo_title: string | null;
seo_description: string | null;
seo_keywords: string | null;

  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;

  show_about: boolean;
  show_proposals: boolean;
  show_news: boolean;
  show_agenda: boolean;
  show_gallery: boolean;
  show_support_form: boolean;
  show_social_links: boolean;

  is_published: boolean;
  published_at: string | null;
  custom_domain: string | null;

  created_at: string;
  updated_at: string;

  whatsapp: string | null;
email: string | null;

instagram_url: string | null;
facebook_url: string | null;
youtube_url: string | null;
tiktok_url: string | null;
x_url: string | null;

};

async function getCampaignContext() {
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
    campaigns (
      id,
      name,
      candidate_name,
      status
    )
  `)
  .eq("user_id", user.id)
  .eq("is_active", true)
  .order("created_at", { ascending: true })
  .limit(1)
  .maybeSingle();

  if (error) {
    console.error("Erro ao buscar campanha:", error);
  }

  if (!membership?.campaign_id) {
    return null;
  }

  const campaignData = Array.isArray(membership.campaigns)
    ? membership.campaigns[0]
    : membership.campaigns;

  return {
  user,
  campaignId: membership.campaign_id,
  campaignName:
    campaignData?.candidate_name ||
    campaignData?.name ||
    "Campanha eleitoral",
};
}


async function getLandingPage(
  campaignId: string
): Promise<LandingPageData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaign_landing_pages")
    .select("*")
    .eq("campaign_id", campaignId)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar Landing Page:", error);
    return null;
  }

  return data as LandingPageData | null;
}




export default async function LandingPageDashboard() {
  const context = await getCampaignContext();

  if (!context) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8">
            <h1 className="text-xl font-bold text-amber-950">
              Campanha não encontrada
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-800">
              Seu usuário ainda não está vinculado a uma campanha.
              Vincule o usuário na tabela campaign_members antes de
              configurar a Landing Page.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const landingPage = await getLandingPage(
    context.campaignId
  );


  if (!landingPage) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <LandingHeader
            campaignName={context.campaignName}
            hasLandingPage={false}
          />

          <div className="mt-8">
            <CreateLandingForm
              campaignName={context.campaignName}
            />
          </div>
        </div>
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <LandingHeader
          campaignName={context.campaignName}
          hasLandingPage
        />

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <LandingStatusCard
            isPublished={landingPage.is_published}
            publishedAt={landingPage.published_at}
            updatedAt={landingPage.updated_at}
          />

          <div className="lg:col-span-2">
            <LandingUrlCard
              slug={landingPage.slug}
              customDomain={landingPage.custom_domain}
              isPublished={landingPage.is_published}
            />
          </div>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0 space-y-8">
  <GeneralForm landingPage={landingPage} />

  <AppearanceForm landingPage={landingPage} />

  <ImagesForm landingPage={landingPage} />

  <SocialForm landingPage={landingPage} />

  <SeoForm landingPage={landingPage} />
</section>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Estrutura da página
              </p>

              <h2 className="mt-2 text-lg font-bold text-slate-950">
                Seções disponíveis
              </h2>

              <div className="mt-5 space-y-3">
                {[
                  "Página principal",
                  "Sobre o candidato",
                  "Propostas e bandeiras",
                  "Notícias e visitas",
                  "Agenda pública",
                  "Galeria de fotos",
                  "Formulário de apoio",
                  "Redes sociais",
                ].map((section, index) => (
                  <div
                    key={section}
                    className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                      {index + 1}
                    </span>

                    <span className="text-sm font-medium text-slate-700">
                      {section}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Próximas etapas
              </p>

              <h2 className="mt-2 text-lg font-bold">
                Complete sua página
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Personalize sua Landing Page com identidade visual, informações do candidato, contatos e redes sociais. Em seguida, cadastre propostas, notícias, agenda e galeria de fotos.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}