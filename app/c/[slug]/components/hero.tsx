import Image from "next/image";
import {
  ArrowDown,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";

import type { LandingData } from "../types";

type HeroProps = {
  landing: LandingData;
};

function normalizeWhatsApp(
  value: string
): string {
  return value.replace(/\D/g, "");
}

export default function Hero({
  landing,
}: HeroProps) {
  const location = [
    landing.city,
    landing.state,
  ]
    .filter(Boolean)
    .join(" - ");

  const whatsappUrl = landing.whatsapp
    ? `https://wa.me/${normalizeWhatsApp(
        landing.whatsapp
      )}`
    : null;

  const heroTitle =
    landing.hero_title ||
    landing.public_name;

  return (
    <section
      id="inicio"
      className="relative isolate min-h-screen overflow-hidden"
      style={{
        backgroundColor:
          landing.primary_color,
        color: landing.accent_color,
      }}
    >
      {landing.hero_image_url && (
        <div className="absolute inset-0 -z-20">
          <Image
            src={landing.hero_image_url}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      <div
        className="absolute inset-0 -z-10"
        style={{
          background: landing.hero_image_url
            ? `linear-gradient(
                90deg,
                ${landing.primary_color}F7 0%,
                ${landing.primary_color}E8 42%,
                ${landing.primary_color}99 70%,
                ${landing.primary_color}66 100%
              )`
            : `linear-gradient(
                135deg,
                ${landing.primary_color} 0%,
                ${landing.primary_color}E8 55%,
                ${landing.secondary_color}66 160%
              )`,
        }}
      />

      <div
        aria-hidden="true"
        className="absolute -left-32 top-24 -z-10 h-72 w-72 rounded-full blur-3xl"
        style={{
          backgroundColor:
            `${landing.secondary_color}33`,
        }}
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-40 right-0 -z-10 h-96 w-96 rounded-full blur-3xl"
        style={{
          backgroundColor:
            `${landing.secondary_color}26`,
        }}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-28 sm:px-8 lg:px-12">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="max-w-3xl">
            {landing.logo_url && (
              <div className="mb-10">
                <Image
                  src={landing.logo_url}
                  alt={`Logo de ${landing.public_name}`}
                  width={220}
                  height={90}
                  priority
                  className="h-auto max-h-20 w-auto object-contain"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              {landing.political_position && (
                <span
                  className="rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.18em]"
                  style={{
                    borderColor:
                      `${landing.secondary_color}80`,
                    backgroundColor:
                      `${landing.secondary_color}20`,
                    color:
                      landing.secondary_color,
                  }}
                >
                  {landing.political_position}
                </span>
              )}

              {location && (
                <span className="flex items-center gap-2 text-sm font-semibold opacity-80">
                  <MapPin className="h-4 w-4" />
                  {location}
                </span>
              )}
            </div>

            {landing.slogan && (
              <p
                className="mt-8 text-sm font-black uppercase tracking-[0.26em]"
                style={{
                  color:
                    landing.secondary_color,
                }}
              >
                {landing.slogan}
              </p>
            )}

            <h1 className="mt-5 text-5xl font-black leading-[0.96] tracking-[-0.055em] sm:text-6xl lg:text-7xl xl:text-8xl">
              {heroTitle}
            </h1>

            {landing.hero_subtitle && (
              <p className="mt-7 max-w-2xl text-base leading-8 opacity-80 sm:text-lg">
                {landing.hero_subtitle}
              </p>
            )}

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl px-7 text-sm font-black shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                  style={{
                    backgroundColor:
                      landing.secondary_color,
                    color:
                      landing.primary_color,
                  }}
                >
                  <MessageCircle className="h-5 w-5" />
                  Falar com a campanha
                </a>
              )}

              {landing.show_support_form && (
                <a
                  href="#apoie"
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl border px-7 text-sm font-black transition hover:bg-white/10"
                  style={{
                    borderColor:
                      `${landing.accent_color}66`,
                    color:
                      landing.accent_color,
                  }}
                >
                  Quero apoiar
                </a>
              )}

              {landing.email && (
                <a
                  href={`mailto:${landing.email}`}
                  aria-label="Enviar e-mail"
                  title="Enviar e-mail"
                  className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border transition hover:bg-white/10"
                  style={{
                    borderColor:
                      `${landing.accent_color}4D`,
                    color:
                      landing.accent_color,
                  }}
                >
                  <Mail className="h-5 w-5" />
                </a>
              )}
            </div>

            <div className="mt-12 flex flex-wrap items-end gap-8">
              {landing.campaign_number && (
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60">
                    Número
                  </p>

                  <p
                    className="mt-1 text-5xl font-black tracking-[-0.04em]"
                    style={{
                      color:
                        landing.secondary_color,
                    }}
                  >
                    {landing.campaign_number}
                  </p>
                </div>
              )}

              {landing.political_party && (
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60">
                    Partido
                  </p>

                  <p className="mt-2 text-lg font-black">
                    {landing.political_party}
                  </p>
                </div>
              )}
            </div>
          </div>

          
        </div>
      </div>

      <a
        href="#sobre"
        aria-label="Ir para a próxima seção"
        className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] opacity-70 transition hover:opacity-100"
      >
        Conheça
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  );
}