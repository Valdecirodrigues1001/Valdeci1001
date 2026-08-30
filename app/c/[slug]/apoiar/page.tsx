import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, MapPin, Users } from "lucide-react";

import SupportForm from "../components/support-form";
import { getCapturePageData } from "./actions";

type CapturePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: CapturePageProps): Promise<Metadata> {
  const { slug } = await params;

  const data = await getCapturePageData(slug);

  if (!data) {
    return {
      title: "Campanha não encontrada",
      robots: { index: false, follow: false },
    };
  }

  const title = `Entre no grupo da campanha de ${data.public_name}`;

  const description = `Receba a agenda, as ações e as novidades da campanha de ${data.public_name} na sua região, direto no WhatsApp.`;

  const image =
    data.seo_image_url ||
    data.profile_image_url ||
    data.hero_image_url ||
    undefined;

  return {
    title,
    description,

    /*
     * Página de tráfego pago: fora do índice para não
     * competir com o site oficial nem receber orgânico.
     */
    robots: {
      index: false,
      follow: false,
    },

    openGraph: {
      title,
      description,
      type: "website",
      locale: "pt_BR",
      siteName: data.public_name,
      images: image
        ? [{ url: image, alt: data.public_name }]
        : undefined,
    },

    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

const BENEFITS = [
  "Agenda e eventos da campanha na sua região",
  "Como ajudar a campanha no seu bairro",
  "Materiais e novidades em primeira mão",
];

export default async function CapturePage({
  params,
}: CapturePageProps) {
  const { slug } = await params;

  const data = await getCapturePageData(slug);

  if (!data) {
    notFound();
  }

  const {
    primary_color: primaryColor,
    secondary_color: secondaryColor,
    accent_color: accentColor,
  } = data;

  const firstName =
    data.public_name.split(" ")[0] || data.public_name;

  const location = [data.city, data.state]
    .filter(Boolean)
    .join(" - ");

  const identityTags = [
    data.political_position,
    data.political_party,
    data.campaign_number
      ? `Nº ${data.campaign_number}`
      : null,
  ].filter(Boolean) as string[];

  return (
    <main
      className="relative isolate min-h-screen overflow-hidden"
      style={{
        backgroundColor: primaryColor,
        color: accentColor,
      }}
    >
      {data.hero_image_url ? (
        <div className="absolute inset-0 -z-20">
          <Image
            src={data.hero_image_url}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      ) : null}

      <div
        className="absolute inset-0 -z-10"
        style={{
          background: data.hero_image_url
            ? `linear-gradient(120deg, ${primaryColor}FA 0%, ${primaryColor}F2 45%, ${primaryColor}D9 100%)`
            : `linear-gradient(140deg, ${primaryColor} 0%, ${primaryColor} 60%, ${secondaryColor}22 160%)`,
        }}
      />

      <div
        aria-hidden="true"
        className="absolute -left-40 top-10 -z-10 h-[460px] w-[460px] rounded-full blur-[150px]"
        style={{ backgroundColor: `${secondaryColor}1F` }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-5 py-12 sm:px-8 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Apresentação */}
          <div className="order-2 lg:order-1">
            <div className="flex items-center gap-4">
              {data.profile_image_url ? (
                <div
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2"
                  style={{ borderColor: secondaryColor }}
                >
                  <Image
                    src={data.profile_image_url}
                    alt={data.public_name}
                    fill
                    priority
                    sizes="80px"
                    className="object-cover object-top"
                  />
                </div>
              ) : null}

              {data.logo_url ? (
                <Image
                  src={data.logo_url}
                  alt={`Logo de ${data.public_name}`}
                  width={180}
                  height={70}
                  priority
                  className="h-auto max-h-14 w-auto object-contain"
                />
              ) : (
                <p className="text-lg font-black text-white">
                  {data.public_name}
                </p>
              )}
            </div>

            {identityTags.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {identityTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.18em]"
                    style={{
                      borderColor: `${secondaryColor}88`,
                      backgroundColor: `${secondaryColor}16`,
                      color: secondaryColor,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <h1 className="mt-6 text-4xl font-black leading-[1.02] tracking-[-0.045em] text-white sm:text-5xl">
              Entre no grupo oficial da campanha de{" "}
              <span style={{ color: secondaryColor }}>
                {firstName}
              </span>{" "}
              na sua região
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-white/70">
              {data.hero_subtitle ||
                `Novidades, agenda e ações da campanha perto de você — direto no seu WhatsApp.`}
            </p>

            <ul className="mt-7 space-y-3">
              {BENEFITS.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 text-sm leading-6 text-white/80"
                >
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `${secondaryColor}26`,
                      color: secondaryColor,
                    }}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>

                  {benefit}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              {data.campaign_number ? (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
                    Número
                  </p>

                  <p
                    className="mt-1 text-4xl font-black tracking-[-0.04em]"
                    style={{ color: secondaryColor }}
                  >
                    {data.campaign_number}
                  </p>
                </div>
              ) : null}

              {location ? (
                <span className="flex items-center gap-2 text-sm font-semibold text-white/70">
                  <MapPin className="h-4 w-4" />
                  {location}
                </span>
              ) : null}
            </div>
          </div>

          {/* Formulário */}
          <div className="order-1 lg:order-2">
            <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-white/50">
              <Users className="h-4 w-4" />
              Cadastro rápido
            </div>

            <SupportForm
              slug={data.slug}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              accentColor={accentColor}
              communityGroupUrl={data.community_group_url}
              showCity={false}
            />
          </div>
        </div>

        <footer className="mt-14 border-t border-white/10 pt-6 text-center text-xs leading-5 text-white/40">
          {[data.public_name, data.political_party]
            .filter(Boolean)
            .join(" · ")}
          {data.slogan ? ` — ${data.slogan}` : ""}
        </footer>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: secondaryColor }}
      />
    </main>
  );
}
