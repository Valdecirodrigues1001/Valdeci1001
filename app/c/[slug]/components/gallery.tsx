import Image from "next/image";
import { Camera } from "lucide-react";

import type {
  GalleryImageData,
  LandingData,
} from "../types";

type GalleryProps = {
  landing: LandingData;
  gallery: GalleryImageData[];
};

export default function Gallery({
  landing,
  gallery,
}: GalleryProps) {
  if (
    !landing.show_gallery ||
    gallery.length === 0
  ) {
    return null;
  }

  const [featuredImage, ...otherImages] = gallery;

  return (
    <section
      id="galeria"
      className="relative overflow-hidden py-24 sm:py-28"
      style={{
        backgroundColor: landing.background_color,
        color: landing.text_color,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute -left-40 bottom-0 h-96 w-96 rounded-full blur-3xl"
        style={{
          backgroundColor: `${landing.secondary_color}14`,
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="mb-14 text-center">
          <p
            className="text-sm font-black uppercase tracking-[0.22em]"
            style={{
              color: landing.secondary_color,
            }}
          >
            Galeria
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
            Momentos da campanha
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 opacity-70">
            Acompanhe registros dos encontros,
            visitas, eventos e ações realizadas
            durante a campanha.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Destaque */}
          <article className="group relative overflow-hidden rounded-[2rem]">
            <div className="relative aspect-[4/5]">
              <Image
                src={featuredImage.image_url}
                alt={
                  featuredImage.title ??
                  "Imagem da campanha"
                }
                fill
                sizes="(min-width:1024px)50vw,100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-3">
                  <Camera
                    className="h-5 w-5"
                    style={{
                      color:
                        landing.secondary_color,
                    }}
                  />

                  <span
                    className="text-sm font-black uppercase tracking-[0.18em]"
                    style={{
                      color:
                        landing.secondary_color,
                    }}
                  >
                    Destaque
                  </span>
                </div>

                {featuredImage.title && (
                  <h3 className="mt-4 text-3xl font-black text-white">
                    {featuredImage.title}
                  </h3>
                )}
              </div>
            </div>
          </article>

          {/* Demais imagens */}
          <div className="grid grid-cols-2 gap-5">
            {otherImages.map((image) => (
              <article
                key={image.id}
                className="group overflow-hidden rounded-[1.75rem]"
              >
                <div className="relative aspect-square">
                  <Image
                    src={image.image_url}
                    alt={
                      image.title ??
                      "Imagem da campanha"
                    }
                    fill
                    sizes="300px"
                    className="object-cover transition duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/30" />

                  {image.title && (
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <p className="translate-y-4 text-sm font-bold text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        {image.title}
                      </p>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}