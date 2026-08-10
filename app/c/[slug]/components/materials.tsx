import Image from "next/image";
import {
  ArrowDownToLine,
  File,
  FileImage,
  FileText,
  FolderOpen,
} from "lucide-react";

import type {
  LandingData,
  MaterialData,
} from "../types";

type MaterialsProps = {
  landing: LandingData;
  materials: MaterialData[];
};

function getFileExtension(fileUrl: string) {
  return fileUrl
    .split("?")[0]
    .split(".")
    .pop()
    ?.toLowerCase();
}

function isImageFile(material: MaterialData) {
  const extension = getFileExtension(material.file_url);

  return [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
    "svg",
  ].includes(extension ?? "");
}

function getMaterialIcon(material: MaterialData) {
  const extension = getFileExtension(material.file_url);

  if (
    extension === "jpg" ||
    extension === "jpeg" ||
    extension === "png" ||
    extension === "webp" ||
    extension === "gif" ||
    extension === "svg"
  ) {
    return FileImage;
  }

  if (
    extension === "pdf" ||
    extension === "doc" ||
    extension === "docx"
  ) {
    return FileText;
  }

  return File;
}

function getMaterialType(material: MaterialData) {
  const extension = getFileExtension(
    material.file_url
  )?.toUpperCase();

  return extension || "ARQUIVO";
}

function getMaterialPreview(
  material: MaterialData
) {
  if (material.thumbnail_url) {
    return material.thumbnail_url;
  }

  if (isImageFile(material)) {
    return material.file_url;
  }

  return null;
}

function formatCategory(category: string) {
  const labels: Record<string, string> = {
    instagram_post: "Post para Instagram",
    instagram_story: "Story para Instagram",
    facebook_post: "Post para Facebook",
    whatsapp: "WhatsApp",
    santinho: "Santinho",
    adesivo: "Adesivo",
    banner: "Banner",
    faixa: "Faixa",
    cartaz: "Cartaz",
    flyer: "Flyer",
    panfleto: "Panfleto",
    logo: "Logo",
    manual_identidade: "Manual de identidade",
    documento: "Documento",
    other: "Outro",
  };

  return labels[category] ?? category;
}

export default function Materials({
  landing,
  materials,
}: MaterialsProps) {
  if (materials.length === 0) {
    return null;
  }

  return (
    <section
      id="materiais"
      className="relative overflow-hidden py-24 sm:py-28"
      style={{
        backgroundColor:
          landing.primary_color,
        color: landing.accent_color,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute -right-40 top-16 h-96 w-96 rounded-full blur-3xl"
        style={{
          backgroundColor: `${landing.secondary_color}1A`,
        }}
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-48 left-0 h-96 w-96 rounded-full blur-3xl"
        style={{
          backgroundColor: `${landing.secondary_color}10`,
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
              Biblioteca
            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
              Materiais da campanha
            </h2>
          </div>

          <p className="max-w-2xl text-base leading-8 opacity-75 lg:justify-self-end">
            Acesse documentos, artes,
            propostas, materiais gráficos e
            outros arquivos disponibilizados
            pela campanha.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => {
            const MaterialIcon =
              getMaterialIcon(material);

            const materialType =
              getMaterialType(material);

            const previewUrl =
              getMaterialPreview(material);

            return (
              <article
                key={material.id}
                className="group flex min-h-[360px] flex-col overflow-hidden rounded-[2rem] border transition duration-300 hover:-translate-y-1"
                style={{
                  borderColor: `${landing.accent_color}1F`,
                  backgroundColor: `${landing.accent_color}0D`,
                }}
              >
                <div
                  className="relative min-h-44 overflow-hidden"
                  style={{
                    background: `linear-gradient(
                      135deg,
                      ${landing.secondary_color}1F,
                      ${landing.accent_color}0A
                    )`,
                  }}
                >
                  {previewUrl ? (
                    <>
                      <Image
                        src={previewUrl}
                        alt={material.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </>
                  ) : (
                    <div className="flex min-h-44 items-center justify-center">
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-2xl"
                        style={{
                          backgroundColor: `${landing.secondary_color}1F`,
                          color:
                            landing.secondary_color,
                        }}
                      >
                        <MaterialIcon className="h-8 w-8" />
                      </div>
                    </div>
                  )}

                  <div
                    className="absolute left-5 top-5 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em]"
                    style={{
                      backgroundColor:
                        landing.secondary_color,
                      color:
                        landing.primary_color,
                    }}
                  >
                    {materialType}
                  </div>

                  {material.is_official && (
                    <div
                      className="absolute right-5 top-5 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em]"
                      style={{
                        backgroundColor:
                          landing.primary_color,
                        color:
                          landing.accent_color,
                      }}
                    >
                      Oficial
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-7">
                  <p
                    className="text-xs font-black uppercase tracking-[0.18em]"
                    style={{
                      color:
                        landing.secondary_color,
                    }}
                  >
                    {formatCategory(
                      material.category
                    )}
                  </p>

                  <h3 className="mt-3 text-2xl font-black leading-tight tracking-[-0.03em]">
                    {material.name}
                  </h3>

                  {material.description && (
                    <p className="mt-4 line-clamp-3 text-sm leading-7 opacity-70">
                      {material.description}
                    </p>
                  )}

                  <div className="mt-auto pt-8">
                    <a
                      href={material.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl px-5 text-sm font-black transition hover:-translate-y-0.5"
                      style={{
                        backgroundColor:
                          landing.secondary_color,
                        color:
                          landing.primary_color,
                      }}
                    >
                      <ArrowDownToLine className="h-5 w-5" />
                      Acessar material
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div
          className="mt-10 flex items-center gap-4 rounded-[2rem] border px-6 py-5"
          style={{
            borderColor: `${landing.accent_color}1A`,
            backgroundColor: `${landing.accent_color}08`,
          }}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: `${landing.secondary_color}1F`,
              color:
                landing.secondary_color,
            }}
          >
            <FolderOpen className="h-6 w-6" />
          </div>

          <p className="text-sm leading-6 opacity-75">
            Os materiais disponibilizados
            nesta seção são de
            responsabilidade da campanha e
            podem ser utilizados conforme as
            orientações apresentadas em cada
            arquivo.
          </p>
        </div>
      </div>
    </section>
  );
}