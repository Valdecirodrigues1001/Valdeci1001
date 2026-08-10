import Image from "next/image";
import {
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import type {
  LandingData,
  LeaderData,
} from "../types";

type LeadersProps = {
  landing: LandingData;
  leaders: LeaderData[];
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export default function Leaders({
  landing,
  leaders,
}: LeadersProps) {
  if (leaders.length === 0) {
    return null;
  }

  return (
    <section
      id="liderancas"
      className="relative overflow-hidden py-24 sm:py-28"
      style={{
        backgroundColor: landing.background_color,
        color: landing.text_color,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute -right-40 top-20 h-96 w-96 rounded-full blur-3xl"
        style={{
          backgroundColor: `${landing.secondary_color}14`,
        }}
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-48 left-0 h-96 w-96 rounded-full blur-3xl"
        style={{
          backgroundColor: `${landing.primary_color}0D`,
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p
            className="text-sm font-black uppercase tracking-[0.22em]"
            style={{
              color: landing.secondary_color,
            }}
          >
            Lideranças
          </p>

          <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
            Pessoas que caminham junto com esta campanha
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 opacity-70">
            Conheça algumas das lideranças que ajudam a fortalecer este projeto
            e a aproximar a campanha das comunidades.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {leaders.map((leader) => (
            <article
              key={leader.id}
              className="group overflow-hidden rounded-[2rem] border transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{
                borderColor: `${landing.primary_color}12`,
                backgroundColor: `${landing.primary_color}05`,
              }}
            >
              <div
                className="relative aspect-[4/5] overflow-hidden"
                style={{
                  background: `linear-gradient(
                    135deg,
                    ${landing.primary_color}12,
                    ${landing.secondary_color}22
                  )`,
                }}
              >
                {leader.image_url ? (
                  <>
                    <Image
                      src={leader.image_url}
                      alt={leader.full_name}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover object-top transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div
                      className="flex h-28 w-28 items-center justify-center rounded-full border text-3xl font-black"
                      style={{
                        borderColor: `${landing.secondary_color}4D`,
                        backgroundColor: `${landing.secondary_color}1A`,
                        color: landing.secondary_color,
                      }}
                    >
                      {leader.full_name
                        ? getInitials(leader.full_name)
                        : (
                          <UserRound className="h-12 w-12" />
                        )}
                    </div>
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      className="h-4 w-4"
                      style={{
                        color: landing.secondary_color,
                      }}
                    />

                    <span
                      className="text-[10px] font-black uppercase tracking-[0.18em]"
                      style={{
                        color: landing.secondary_color,
                      }}
                    >
                      Liderança
                    </span>
                  </div>

                  <h3 className="mt-3 text-2xl font-black leading-tight tracking-[-0.03em]">
                    {leader.full_name}
                  </h3>

                  {leader.profession && (
                    <p className="mt-2 text-sm font-semibold opacity-85">
                      {leader.profession }
                    </p>
                  )}

                  {leader.city && (
                    <div className="mt-3 flex items-center gap-2 text-sm font-semibold opacity-75">
                      <MapPin className="h-4 w-4" />
                      {leader.city}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}