import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WhatsAppFloat from "./components/whatsapp-float";

import { getLandingPageData } from "./actions";

import About from "./components/about";
import Events from "./components/events";
import Footer from "./components/footer";
import Gallery from "./components/gallery";
import Hero from "./components/hero";
import Leaders from "./components/leaders";
import Materials from "./components/materials";
import Posts from "./components/posts";
import Proposals from "./components/proposals";
import SupportCta from "./components/support-cta";

type PublicCampaignPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PublicCampaignPageProps): Promise<Metadata> {
  const { slug } = await params;

  const data = await getLandingPageData(slug);

  if (!data) {
    return {
      title: "Campanha não encontrada",
      description:
        "A página da campanha informada não está disponível.",
    };
  }

  const { landing } = data;

  const title =
    landing.seo_title ||
    landing.hero_title ||
    `${landing.public_name} | Site Oficial`;

  const description =
    landing.seo_description ||
    landing.hero_subtitle ||
    landing.short_biography ||
    landing.slogan ||
    `Conheça a campanha de ${landing.public_name}.`;

  const image =
    landing.seo_image_url ||
    landing.hero_image_url ||
    landing.profile_image_url ||
    landing.logo_url ||
    undefined;

  return {
    title,
    description,

    openGraph: {
      title,
      description,
      type: "website",
      locale: "pt_BR",
      siteName: landing.public_name,

      images: image
        ? [
            {
              url: image,
              alt: landing.public_name,
            },
          ]
        : undefined,
    },

    twitter: {
      card: image
        ? "summary_large_image"
        : "summary",
      title,
      description,
      images: image
        ? [image]
        : undefined,
    },
  };
}

export default async function PublicCampaignPage({
  params,
}: PublicCampaignPageProps) {
  const { slug } = await params;

  const data = await getLandingPageData(slug);

  if (!data) {
    notFound();
  }

  const {
    landing,
    proposals,
    hasMoreProposals,
    events,
    gallery,
    materials,
    posts,
    leaders,
  } = data;

  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{
        backgroundColor:
          landing.background_color,
        color: landing.text_color,
      }}
    >
      <Hero landing={landing} />

      <About landing={landing} />

      <Proposals
        landing={landing}
        proposals={proposals}
        hasMoreProposals={
          hasMoreProposals
        }
      />

      <Events
        landing={landing}
        events={events}
      />

      <Gallery
        landing={landing}
        gallery={gallery}
      />

      <Materials
        landing={landing}
        materials={materials}
      />

      <Posts
        landing={landing}
        posts={posts}
      />

      <Leaders
        landing={landing}
        leaders={leaders}
      />

      <SupportCta landing={landing} />

      <Footer landing={landing} />

      <WhatsAppFloat landing={landing} />
    </main>
  );
}