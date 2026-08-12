import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
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

  const whatsappUrl =
    landing.whatsapp
      ? `https://wa.me/${normalizeWhatsApp(
          landing.whatsapp
        )}`
      : null;

  const heroTitle =
    landing.hero_title ||
    landing.public_name;

  const firstName =
    landing.public_name
      .split(" ")[0]
      ?.toUpperCase() ||
    landing.public_name.toUpperCase();

  return (
    <section
      id="inicio"
      className="relative isolate min-h-screen overflow-hidden"
      style={{
        backgroundColor:
          landing.primary_color,
        color:
          landing.accent_color,
      }}
    >
      {/* FUNDO PRINCIPAL */}
      {landing.hero_image_url ? (
        <div className="absolute inset-0 -z-40">
          <Image
            src={landing.hero_image_url}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      ) : null}

      {/* OVERLAY PRINCIPAL */}
      <div
        className="absolute inset-0 -z-30"
        style={{
          background:
            landing.hero_image_url
              ? `linear-gradient(
                  90deg,
                  ${landing.primary_color}FD 0%,
                  ${landing.primary_color}FA 34%,
                  ${landing.primary_color}EB 52%,
                  ${landing.primary_color}B8 70%,
                  ${landing.primary_color}72 100%
                )`
              : `linear-gradient(
                  120deg,
                  ${landing.primary_color} 0%,
                  ${landing.primary_color} 58%,
                  ${landing.secondary_color}2B 150%
                )`,
        }}
      />

      {/* ESCURECIMENTO INFERIOR */}
      <div className="absolute inset-x-0 bottom-0 -z-20 h-[42%] bg-gradient-to-t from-black/40 to-transparent" />

      {/* BRILHO ESQUERDO */}
      <div
        aria-hidden="true"
        className="absolute -left-44 top-24 -z-20 h-[480px] w-[480px] rounded-full blur-[140px]"
        style={{
          backgroundColor:
            `${landing.secondary_color}1C`,
        }}
      />

      {/* BRILHO DIREITO */}
      <div
        aria-hidden="true"
        className="absolute right-[-10%] top-[15%] -z-20 hidden h-[620px] w-[620px] rounded-full blur-[150px] lg:block"
        style={{
          backgroundColor:
            `${landing.secondary_color}18`,
        }}
      />

      {/* MARCA GIGANTE AO FUNDO */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-4%] top-[11%] -z-20 hidden select-none whitespace-nowrap text-[18rem] font-black uppercase leading-none tracking-[-0.08em] text-white opacity-[0.025] lg:block xl:text-[23rem]"
      >
        {firstName}
      </div>

      {/* LINHA DOURADA SUPERIOR */}
      <div
        aria-hidden="true"
        className="absolute right-[-4%] top-[8%] -z-10 hidden h-[2px] w-[48%] origin-right -rotate-[6deg] opacity-80 lg:block"
        style={{
          backgroundColor:
            landing.secondary_color,
        }}
      />

      {/* CONTEÚDO */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1500px] items-center px-6 pb-24 pt-28 sm:px-8 lg:px-12 lg:pb-8 lg:pt-20">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          {/* ESQUERDA */}
          <div className="relative z-30 max-w-2xl">
            {landing.logo_url ? (
              <div className="mb-8">
                <Image
                  src={landing.logo_url}
                  alt={`Logo de ${landing.public_name}`}
                  width={230}
                  height={90}
                  priority
                  className="h-auto max-h-20 w-auto object-contain"
                />
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              {landing.political_position ? (
                <span
                  className="rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em]"
                  style={{
                    borderColor:
                      `${landing.secondary_color}90`,
                    backgroundColor:
                      `${landing.secondary_color}16`,
                    color:
                      landing.secondary_color,
                  }}
                >
                  {
                    landing.political_position
                  }
                </span>
              ) : null}

              {location ? (
                <span className="flex items-center gap-2 text-sm font-semibold text-white/75">
                  <MapPin className="h-4 w-4" />
                  {location}
                </span>
              ) : null}
            </div>

            {landing.slogan ? (
              <p
                className="mt-8 max-w-xl text-sm font-black uppercase leading-6 tracking-[0.25em]"
                style={{
                  color:
                    landing.secondary_color,
                }}
              >
                {landing.slogan}
              </p>
            ) : null}

            <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.92] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl xl:text-[5.4rem]">
              {heroTitle}
            </h1>

            {landing.hero_subtitle ? (
              <p className="mt-6 max-w-xl text-base leading-7 text-white/72 sm:text-lg">
                {
                  landing.hero_subtitle
                }
              </p>
            ) : null}

            {/* CTA */}
            <div className="mt-8 max-w-xl rounded-[1.75rem] border border-white/10 bg-black/20 p-5 shadow-2xl backdrop-blur-md sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">
                Faça parte
              </p>

              <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
                Ajude a construir esta
                campanha.
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-white/60">
                Cadastre-se para acompanhar
                as ações, propostas e
                novidades da campanha.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                {landing.show_support_form ? (
                  <a
                    href="#apoie"
                    className="inline-flex min-h-13 flex-1 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-black shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                    style={{
                      backgroundColor:
                        landing.secondary_color,
                      color:
                        landing.primary_color,
                    }}
                  >
                    Quero fazer parte

                    <ArrowRight className="h-4 w-4" />
                  </a>
                ) : null}

                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl border border-white/20 px-5 text-sm font-black text-white transition hover:bg-white/10"
                  >
                    <MessageCircle className="h-4 w-4" />

                    Falar com a campanha
                  </a>
                ) : null}
              </div>
            </div>

            {/* NÚMERO + PARTIDO */}
            <div className="mt-7 flex flex-wrap items-end gap-8">
              {landing.campaign_number ? (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
                    Número
                  </p>

                  <p
                    className="mt-1 text-5xl font-black tracking-[-0.05em]"
                    style={{
                      color:
                        landing.secondary_color,
                    }}
                  >
                    {
                      landing.campaign_number
                    }
                  </p>
                </div>
              ) : null}

              {landing.political_party ? (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
                    Partido
                  </p>

                  <p className="mt-2 text-lg font-black text-white">
                    {
                      landing.political_party
                    }
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {/* DIREITA — CANDIDATO */}
          <div className="relative z-20 hidden min-h-[790px] lg:block">
            {landing.profile_image_url ? (
              <>
                {/* CÍRCULO DOURADO */}
                <div
                  aria-hidden="true"
                  className="absolute left-[12%] top-[14%] h-[560px] w-[560px] rounded-full border opacity-40"
                  style={{
                    borderColor:
                      landing.secondary_color,
                    borderWidth: "2px",
                  }}
                />

                {/* FUNDO DOURADO LEVE */}
                <div
                  aria-hidden="true"
                  className="absolute left-[20%] top-[23%] h-[430px] w-[430px] rounded-full opacity-[0.10]"
                  style={{
                    backgroundColor:
                      landing.secondary_color,
                  }}
                />

                {/* SEGUNDO TRAÇO */}
                <div
                  aria-hidden="true"
                  className="absolute left-[4%] top-[18%] h-[520px] w-[520px] rotate-[12deg] rounded-[45%] border opacity-15"
                  style={{
                    borderColor:
                      landing.secondary_color,
                    borderWidth: "2px",
                  }}
                />

                {/* NOME AO FUNDO */}
                <div
                  aria-hidden="true"
                  className="absolute left-[-6%] top-[29%] select-none whitespace-nowrap text-[9rem] font-black uppercase leading-none tracking-[-0.08em] text-white opacity-[0.04] xl:text-[12rem]"
                >
                  {firstName}
                </div>

                {/* FOTO DO CANDIDATO */}
                <div className="absolute -bottom-14 -left-[7%] right-[-12%] top-[-2%]">
                  <Image
                    src={
                      landing.profile_image_url
                    }
                    alt={
                      landing.public_name
                    }
                    fill
                    priority
                    sizes="60vw"
                    className="object-contain object-bottom"
                  />
                </div>

                {/* LINHA DOURADA INFERIOR */}
                <div
                  aria-hidden="true"
                  className="absolute bottom-[7%] left-[2%] h-[2px] w-[92%] origin-left -rotate-[7deg] opacity-75"
                  style={{
                    backgroundColor:
                      landing.secondary_color,
                  }}
                />
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div
                  className="flex h-[420px] w-[420px] items-center justify-center rounded-full border-2 text-center"
                  style={{
                    borderColor:
                      `${landing.secondary_color}55`,
                    backgroundColor:
                      `${landing.secondary_color}0F`,
                  }}
                >
                  <span className="max-w-xs text-3xl font-black text-white/20">
                    Adicione a foto do
                    candidato no painel
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOTO MOBILE */}
      {landing.profile_image_url ? (
        <div className="relative z-20 mx-auto -mt-28 h-[450px] w-full max-w-lg lg:hidden">
          <Image
            src={
              landing.profile_image_url
            }
            alt={
              landing.public_name
            }
            fill
            priority
            sizes="100vw"
            className="object-contain object-bottom"
          />
        </div>
      ) : null}

      {/* FAIXA INFERIOR */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 z-30 h-2"
        style={{
          backgroundColor:
            landing.secondary_color,
        }}
      />

      <a
        href="#sobre"
        aria-label="Ir para a próxima seção"
        className="absolute bottom-7 left-1/2 z-40 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/55 transition hover:text-white lg:flex"
      >
        Conheça

        <ArrowDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  );
}