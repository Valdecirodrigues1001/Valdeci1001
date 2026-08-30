import Link from "next/link";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";

import SettingsHeader from "./components/settings-header";
import CampaignSettingsForm from "./components/campaign-settings-form";
import BrandingSettingsForm from "./components/branding-settings-form";
import ContactSettingsForm from "./components/contact-settings-form";
import SeoSettingsForm from "./components/seo-settings-form";
import TrackingSettingsForm from "./components/tracking-settings-form";
import ModulesSettingsForm from "./components/modules-settings-form";

import { getSettingsPageData } from "./actions";

function buildCaptureUrl(
  slug: string | null,
  customDomain: string | null
): string {
  if (customDomain) {
    return `https://${customDomain}/apoiar`;
  }

  const base = (
    process.env.NEXT_PUBLIC_SITE_URL || ""
  ).replace(/\/+$/, "");

  if (slug && base) {
    return `${base}/c/${slug}/apoiar`;
  }

  return slug ? `/c/${slug}/apoiar` : "/apoiar";
}

export default async function SettingsPage() {
  const data = await getSettingsPageData();

  if (!data) {
    redirect("/dashboard");
  }

  return (
    <main className="px-5 pb-12 pt-20 sm:px-8 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-[1500px] space-y-8">
        <SettingsHeader />

        <div className="grid gap-8">
          <CampaignSettingsForm
            campaign={data.campaign}
          />

          <BrandingSettingsForm
            campaign={data.campaign}
          />

          <ContactSettingsForm
            campaign={data.campaign}
          />

          <SeoSettingsForm
            campaign={data.campaign}
          />

          <TrackingSettingsForm
            campaign={data.campaign}
            captureUrl={buildCaptureUrl(
              data.campaign.slug,
              data.campaign.custom_domain
            )}
          />

          <ModulesSettingsForm
            modules={data.modules}
          />

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-base font-semibold text-slate-950">
                Equipe e acessos
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Gerencie integrantes, funções e permissões de acesso à campanha.
              </p>
            </div>

            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  <Users className="h-5 w-5 text-slate-700" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Gestão da equipe
                  </h3>

                  <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                    Convide novos integrantes, altere funções, níveis de acesso
                    e mantenha a equipe da campanha organizada.
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/equipe"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Gerenciar equipe
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}