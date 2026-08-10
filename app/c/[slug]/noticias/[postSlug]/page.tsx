import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichTextViewer } from "@/components/editor";
import {
  ArrowLeft,
  CalendarDays,
  Link2,
  MessageCircle,
} from "lucide-react";
import { FaFacebook, FaLinkedin } from "react-icons/fa6";

import type { CSSProperties } from "react";

import { getPublicPost } from "./actions";

type PublicPostPageProps = {
  params: Promise<{
    slug: string;
    postSlug: string;
  }>;
};

function formatDate(date: string | null) {
  if (!date) {
    return null;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export async function generateMetadata({
  params,
}: PublicPostPageProps): Promise<Metadata> {
  const { slug, postSlug } = await params;

  const data = await getPublicPost(slug, postSlug);

  if (!data) {
    return {
      title: "Notícia não encontrada",
      description: "A notícia informada não está disponível.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { landing, post } = data;

  const siteUrl = getSiteUrl();
  const postPath = `/c/${landing.slug}/noticias/${post.slug}`;
  const postUrl = `${siteUrl}${postPath}`;

  const title = `${post.title} | ${landing.public_name}`;

  const description =
    post.excerpt ||
    `Confira esta notícia da campanha de ${landing.public_name}.`;

  return {
    title,
    description,

    alternates: {
      canonical: postUrl,
    },

    openGraph: {
      title,
      description,
      url: postUrl,
      type: "article",
      locale: "pt_BR",
      siteName: landing.public_name,
      publishedTime: post.published_at || undefined,
      authors: post.author_name ? [post.author_name] : undefined,
      images: post.cover_image_url
        ? [
            {
              url: post.cover_image_url,
              alt: post.title,
            },
          ]
        : undefined,
    },

    twitter: {
      card: post.cover_image_url
        ? "summary_large_image"
        : "summary",
      title,
      description,
      images: post.cover_image_url
        ? [post.cover_image_url]
        : undefined,
    },
  };
}

export default async function PublicPostPage({
  params,
}: PublicPostPageProps) {
  const { slug, postSlug } = await params;

  const data = await getPublicPost(slug, postSlug);

  if (!data) {
    notFound();
  }

  const { landing, post } = data;

  const backgroundColor =
    landing.background_color || "#FFFFFF";

  const textColor = landing.text_color || "#0F172A";

  const primaryColor =
    landing.primary_color || "#0F172A";

  const secondaryColor =
    landing.secondary_color || "#D4AF37";

  const accentColor =
    landing.accent_color || "#FFFFFF";

  const publishedDate = formatDate(
    post.published_at || post.created_at
  );

  const siteUrl = getSiteUrl();

  const postPath =
    `/c/${landing.slug}/noticias/${post.slug}`;

  const postUrl = `${siteUrl}${postPath}`;

  const encodedUrl = encodeURIComponent(postUrl);
  const encodedTitle = encodeURIComponent(post.title);

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      <header
        className="border-b"
        style={{
          backgroundColor: primaryColor,
          borderColor: `${accentColor}20`,
        }}
      >
        <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-4 px-5 sm:gap-6 sm:px-6 lg:px-8">
          <Link
            href={`/c/${landing.slug}`}
            className="flex min-w-0 items-center gap-3"
          >
            {landing.logo_url ? (
              <img
                src={landing.logo_url}
                alt={`Logo de ${landing.public_name}`}
                className="h-10 w-auto max-w-40 object-contain sm:h-11 sm:max-w-44"
              />
            ) : (
              <span
                className="truncate text-base font-bold sm:text-lg"
                style={{
                  color: accentColor,
                }}
              >
                {landing.public_name}
              </span>
            )}
          </Link>

          <Link
            href={`/c/${landing.slug}#noticias`}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition hover:bg-white/10 sm:px-4"
            style={{
              color: accentColor,
              borderColor: `${accentColor}35`,
            }}
          >
            <ArrowLeft className="h-4 w-4" />

            <span className="hidden sm:inline">
              Voltar
            </span>
          </Link>
        </div>
      </header>

      <article>
        {post.cover_image_url && (
          <div className="relative h-[260px] overflow-hidden sm:h-[430px] lg:h-[540px]">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>
        )}

        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-16 lg:px-8">
          <Link
            href={`/c/${landing.slug}#noticias`}
            className="inline-flex items-center gap-2 text-sm font-semibold transition hover:opacity-70"
            style={{
              color: secondaryColor,
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para notícias
          </Link>

          <h1 className="mt-6 break-words text-3xl font-bold leading-tight sm:text-5xl">
            {post.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm opacity-70">
            {publishedDate && (
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {publishedDate}
              </span>
            )}

            {post.author_name && (
              <span>Por {post.author_name}</span>
            )}
          </div>

          {post.excerpt && (
            <p className="mt-8 text-lg leading-8 opacity-80 sm:text-xl">
              {post.excerpt}
            </p>
          )}

          <div
            className="my-10 h-px"
            style={{
              backgroundColor: `${textColor}18`,
            }}
          />

          {post.content ? (
  <div className="prose prose-lg max-w-none break-words">
    <RichTextViewer value={post.content} />
  </div>
) : (
  <p className="text-base opacity-70">
    O conteúdo desta notícia ainda não está disponível.
  </p>
)}

          <div
            className="mt-14 rounded-2xl border p-5 sm:p-6"
            style={{
              borderColor: `${textColor}18`,
            }}
          >
            <p className="text-sm font-bold uppercase tracking-wider opacity-60">
              Compartilhe esta notícia
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition hover:opacity-70"
                style={{
                  borderColor: `${textColor}25`,
                }}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition hover:opacity-70"
                style={{
                  borderColor: `${textColor}25`,
                }}
              >
                <FaFacebook className="h-4 w-4" />
                Facebook
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition hover:opacity-70"
                style={{
                  borderColor: `${textColor}25`,
                }}
              >
                <FaLinkedin className="h-4 w-4" />
                LinkedIn
              </a>

              <a
                href={postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition hover:opacity-70"
                style={{
                  borderColor: `${textColor}25`,
                }}
              >
                <Link2 className="h-4 w-4" />
                Abrir link
              </a>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}