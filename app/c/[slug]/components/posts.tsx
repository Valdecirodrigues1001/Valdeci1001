import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Newspaper,
} from "lucide-react";

import type {
  LandingData,
  PostData,
} from "../types";

type PostsProps = {
  landing: LandingData;
  posts: PostData[];
};

function formatDate(date: string | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default function Posts({
  landing,
  posts,
}: PostsProps) {
  if (
    !landing.show_news ||
    posts.length === 0
  ) {
    return null;
  }

  return (
    <section
      id="noticias"
      className="relative overflow-hidden py-24 sm:py-28"
      style={{
        backgroundColor:
          landing.background_color,
        color: landing.text_color,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute -left-40 top-16 h-96 w-96 rounded-full blur-3xl"
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
              Notícias
            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
              Acompanhe as novidades da campanha
            </h2>
          </div>

          <p className="max-w-2xl text-base leading-8 opacity-70 lg:justify-self-end">
            Veja os acontecimentos mais recentes,
            ações realizadas, eventos e comunicados
            oficiais da campanha.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group overflow-hidden rounded-[2rem] border transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{
                borderColor:
                  `${landing.primary_color}12`,
                backgroundColor:
                  `${landing.primary_color}05`,
              }}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {post.cover_image_url ? (
                  <>
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      sizes="(min-width:1280px)33vw,(min-width:768px)50vw,100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </>
                ) : (
                  <div
                    className="flex h-full items-center justify-center"
                    style={{
                      background: `linear-gradient(
                        135deg,
                        ${landing.primary_color}12,
                        ${landing.secondary_color}22
                      )`,
                    }}
                  >
                    <Newspaper
                      className="h-12 w-12"
                      style={{
                        color:
                          landing.secondary_color,
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex min-h-[260px] flex-col p-7">
                {post.published_at && (
                  <div className="flex items-center gap-2 text-sm font-semibold opacity-70">
                    <CalendarDays
                      className="h-4 w-4"
                      style={{
                        color:
                          landing.secondary_color,
                      }}
                    />

                    {formatDate(
                      post.published_at
                    )}
                  </div>
                )}

                <h3 className="mt-4 text-2xl font-black leading-tight tracking-[-0.03em]">
                  {post.title}
                </h3>

                {post.excerpt && (
                  <p className="mt-4 line-clamp-4 text-sm leading-7 opacity-70">
                    {post.excerpt}
                  </p>
                )}

                <div className="mt-auto pt-8">
                  <Link
                    href={`/c/${landing.slug}/noticias/${post.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-black transition group-hover:gap-3"
                    style={{
                      color:
                        landing.secondary_color,
                    }}
                  >
                    Ler notícia
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}