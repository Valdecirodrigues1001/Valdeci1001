import {
  HeartHandshake,
  Mail,
  MessageCircle,
} from "lucide-react";

import type { LandingData } from "../types";
import SupportForm from "./support-form";

type SupportCtaProps = {
  landing: LandingData;
};

function normalizeWhatsApp(value: string) {
  return value.replace(/\D/g, "");
}

export default function SupportCta({
  landing,
}: SupportCtaProps) {
  if (!landing.show_support_form) {
    return null;
  }

  const whatsappUrl = landing.whatsapp
    ? `https://wa.me/${normalizeWhatsApp(
        landing.whatsapp
      )}?text=${encodeURIComponent(
        `Olá! Quero apoiar a campanha de ${landing.public_name}.`
      )}`
    : null;

  const supportTitle =
    landing.support_cta_title ||
    "Faça parte desta campanha";

  const supportDescription =
    landing.support_cta_description ||
    "Sua participação fortalece este projeto. Entre em contato, acompanhe as ações e ajude a construir uma campanha mais próxima das pessoas.";

  return (
    <section
      id="apoie"
      className="relative overflow-hidden py-24 sm:py-28"
      style={{
        backgroundColor: landing.primary_color,
        color: landing.accent_color,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute -left-36 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          backgroundColor: `${landing.secondary_color}26`,
        }}
      />

      <div
        aria-hidden="true"
        className="absolute -right-40 bottom-0 h-96 w-96 rounded-full blur-3xl"
        style={{
          backgroundColor: `${landing.secondary_color}1A`,
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
        <div
          className="overflow-hidden rounded-[2.5rem] border"
          style={{
            borderColor: `${landing.secondary_color}40`,
            background: `linear-gradient(
              135deg,
              ${landing.secondary_color}18 0%,
              ${landing.accent_color}08 48%,
              ${landing.secondary_color}0D 100%
            )`,
          }}
        >
          <div className="grid gap-10 px-7 py-10 sm:px-10 sm:py-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-14 lg:py-16">
            <div>
              <div
                className="inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: `${landing.secondary_color}1F`,
                  color: landing.secondary_color,
                }}
              >
                <HeartHandshake className="h-7 w-7" />
              </div>

              <p
                className="mt-7 text-sm font-black uppercase tracking-[0.22em]"
                style={{
                  color: landing.secondary_color,
                }}
              >
                Participe
              </p>

              <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
                {supportTitle}
              </h2>

              <p className="mt-6 max-w-xl text-base leading-8 opacity-75">
                {supportDescription}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
                    Falar no WhatsApp
                  </a>
                )}

                {landing.email && (
                  <a
                    href={`mailto:${landing.email}?subject=${encodeURIComponent(
                      `Quero apoiar a campanha de ${landing.public_name}`
                    )}`}
                    className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border px-7 text-sm font-black transition hover:bg-white/10"
                    style={{
                      borderColor: `${landing.accent_color}4D`,
                      color: landing.accent_color,
                    }}
                  >
                    <Mail className="h-5 w-5" />
                    Enviar e-mail
                  </a>
                )}
              </div>
            </div>

           <SupportForm
  slug={landing.slug}
  primaryColor={landing.primary_color}
  secondaryColor={landing.secondary_color}
  accentColor={landing.accent_color}
  communityGroupUrl={landing.community_group_url}
/>
          </div>
        </div>
      </div>
    </section>
  );
}