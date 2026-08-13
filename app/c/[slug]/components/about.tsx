import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";

import type { LandingData } from "../types";

type AboutProps = {
  landing: LandingData;
};

function renderFormattedText(
  text: string
) {
  const parts = text.split(
    /(\*\*.*?\*\*)/g
  );

  return parts.map(
    (part, index) => {
      if (
        part.startsWith("**") &&
        part.endsWith("**")
      ) {
        const content =
          part.slice(2, -2);

        return (
          <strong
            key={`${content}-${index}`}
            className="font-black"
          >
            {content}
          </strong>
        );
      }

      return (
        <span
          key={`${part}-${index}`}
        >
          {part}
        </span>
      );
    }
  );
}

export default function About({
  landing,
}: AboutProps) {
  const location = [
    landing.city,
    landing.state,
  ]
    .filter(Boolean)
    .join(" - ");

  const biography =
    landing.biography ||
    landing.short_biography;

  if (
    !landing.show_about ||
    (!biography &&
      !landing.profile_image_url)
  ) {
    return null;
  }

  return (
    <section
      id="sobre"
      className="relative overflow-hidden py-24 sm:py-28"
      style={{
        backgroundColor:
          landing.background_color,
        color: landing.text_color,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute -right-32 top-10 h-80 w-80 rounded-full blur-3xl"
        style={{
          backgroundColor:
            `${landing.secondary_color}14`,
        }}
      />

      <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-6 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:px-12">
        <div className="relative">
          <div
            className="absolute -left-5 -top-5 h-full w-full rounded-[2.5rem]"
            style={{
              border: `1px solid ${landing.secondary_color}40`,
            }}
          />

          <div
            className="relative min-h-[460px] overflow-hidden rounded-[2.5rem]"
            style={{
              backgroundColor:
                `${landing.primary_color}0D`,
            }}
          >
            {landing.profile_image_url ? (
              <Image
                src={
                  landing.profile_image_url
                }
                alt={landing.public_name}
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover object-top"
              />
            ) : (
              <div className="flex min-h-[460px] items-center justify-center px-8 text-center">
                <span
                  className="text-7xl font-black opacity-20"
                  style={{
                    color:
                      landing.primary_color,
                  }}
                >
                  {landing.public_name
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              </div>
            )}

            <div
              className="absolute inset-x-0 bottom-0 h-44"
              style={{
                background: `linear-gradient(
                  180deg,
                  transparent 0%,
                  ${landing.primary_color}E6 100%
                )`,
              }}
            />

            <div className="absolute inset-x-0 bottom-0 p-7 text-white">
              <p className="text-xl font-black">
                {landing.public_name}
              </p>

              {landing.political_position && (
                <p className="mt-1 text-sm font-semibold opacity-80">
                  {
                    landing.political_position
                  }
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <p
            className="text-sm font-black uppercase tracking-[0.22em]"
            style={{
              color:
                landing.secondary_color,
            }}
          >
            Sobre
          </p>

          <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
            Uma trajetória construída com
            trabalho, presença e compromisso
          </h2>

          {landing.short_biography && (
            <p
              className="mt-7 border-l-4 pl-5 text-lg font-bold leading-8"
              style={{
                borderColor:
                  landing.secondary_color,
              }}
            >
              {renderFormattedText(
                landing.short_biography
              )}
            </p>
          )}

          {landing.biography && (
            <div className="mt-7 whitespace-pre-line text-base leading-8 opacity-80">
              {renderFormattedText(
                landing.biography
              )}
            </div>
          )}

          <div className="mt-9 flex flex-wrap gap-4">
            {location && (
              <div
                className="inline-flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm font-bold"
                style={{
                  borderColor:
                    `${landing.primary_color}1F`,
                  backgroundColor:
                    `${landing.primary_color}08`,
                }}
              >
                <MapPin
                  className="h-5 w-5"
                  style={{
                    color:
                      landing.secondary_color,
                  }}
                />

                {location}
              </div>
            )}

            {landing.show_proposals && (
              <a
                href="#propostas"
                className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition hover:-translate-y-0.5"
                style={{
                  backgroundColor:
                    landing.primary_color,
                  color:
                    landing.accent_color,
                }}
              >
                Conheça as propostas
                <ArrowRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}