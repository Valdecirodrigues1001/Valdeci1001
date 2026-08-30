import Image from "next/image";
import {
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react";

import { formatBrasilia } from "@/lib/datetime";

import type {
  EventData,
  LandingData,
} from "../types";

type EventsProps = {
  landing: LandingData;
  events: EventData[];
};

function formatEventDate(
  dateValue: string
): string {
  return formatBrasilia(dateValue, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatEventTime(
  dateValue: string
): string {
  return formatBrasilia(dateValue, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatEventDay(
  dateValue: string
): string {
  return formatBrasilia(dateValue, {
    day: "2-digit",
  });
}

function formatEventMonth(
  dateValue: string
): string {
  return formatBrasilia(dateValue, {
    month: "short",
  })
    .replace(".", "")
    .toUpperCase();
}

export default function Events({
  landing,
  events,
}: EventsProps) {
  if (
    !landing.show_agenda ||
    events.length === 0
  ) {
    return null;
  }

  return (
    <section
      id="agenda"
      className="relative overflow-hidden py-24 sm:py-28"
      style={{
        backgroundColor:
          landing.background_color,
        color: landing.text_color,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute -right-40 top-10 h-96 w-96 rounded-full blur-3xl"
        style={{
          backgroundColor:
            `${landing.secondary_color}14`,
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p
              className="text-sm font-black uppercase tracking-[0.22em]"
              style={{
                color:
                  landing.secondary_color,
              }}
            >
              Agenda
            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
              Acompanhe os próximos compromissos
            </h2>
          </div>

          <p className="max-w-2xl text-base leading-8 opacity-70 lg:justify-self-end">
            Encontros, reuniões, caminhadas e eventos
            da campanha. Participe e acompanhe de perto
            esta trajetória.
          </p>
        </div>

        <div className="mt-14 space-y-5">
          {events.map((event) => (
            <article
              key={event.id}
              className="group grid overflow-hidden rounded-[2rem] border transition duration-300 hover:-translate-y-1 hover:shadow-xl md:grid-cols-[140px_1fr] lg:grid-cols-[140px_1fr_300px]"
              style={{
                borderColor:
                  `${landing.primary_color}14`,
                backgroundColor:
                  `${landing.primary_color}05`,
              }}
            >
              <div
                className="flex min-h-36 flex-col items-center justify-center px-6 py-7 text-center"
                style={{
                  backgroundColor:
                    landing.primary_color,
                  color:
                    landing.accent_color,
                }}
              >
                <span
                  className="text-5xl font-black leading-none"
                  style={{
                    color:
                      landing.secondary_color,
                  }}
                >
                  {formatEventDay(
                    event.start_at
                  )}
                </span>

                <span className="mt-2 text-xs font-black uppercase tracking-[0.2em]">
                  {formatEventMonth(
                    event.start_at
                  )}
                </span>
              </div>

              <div className="flex flex-col justify-center px-7 py-7 sm:px-8">
                <p
                  className="text-xs font-black uppercase tracking-[0.16em]"
                  style={{
                    color:
                      landing.secondary_color,
                  }}
                >
                  {formatEventDate(
                    event.start_at
                  )}
                </p>

                <h3 className="mt-3 text-2xl font-black leading-tight tracking-[-0.03em]">
                  {event.title}
                </h3>

                {event.description && (
                  <p className="mt-4 line-clamp-3 text-sm leading-7 opacity-70">
                    {event.description}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold opacity-75">
                  <div className="flex items-center gap-2">
                    <Clock3
                      className="h-4 w-4"
                      style={{
                        color:
                          landing.secondary_color,
                      }}
                    />

                    {formatEventTime(
                      event.start_at
                    )}

                    {event.ends_at && (
                      <>
                        {" "}
                        até{" "}
                        {formatEventTime(
                          event.ends_at
                        )}
                      </>
                    )}
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin
                        className="h-4 w-4"
                        style={{
                          color:
                            landing.secondary_color,
                        }}
                      />

                      {event.location}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative hidden min-h-52 overflow-hidden lg:block">
                {event.image_url ? (
                  <Image
                    src={event.image_url}
                    alt={event.title}
                    fill
                    sizes="300px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="flex h-full min-h-52 items-center justify-center"
                    style={{
                      background: `linear-gradient(
                        135deg,
                        ${landing.primary_color}12,
                        ${landing.secondary_color}24
                      )`,
                    }}
                  >
                    <CalendarDays
                      className="h-12 w-12"
                      style={{
                        color:
                          landing.secondary_color,
                      }}
                    />
                  </div>
                )}

                {event.image_url && (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(
                        90deg,
                        ${landing.background_color}22,
                        transparent
                      )`,
                    }}
                  />
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}