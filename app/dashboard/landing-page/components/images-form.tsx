import { Images } from "lucide-react";

import ImageUploadCard from "./image-upload-card";

type ImagesFormProps = {
  landingPage: {
    logo_url: string | null;
    logo_storage_path: string | null;

    profile_image_url: string | null;
    profile_image_storage_path: string | null;

    hero_image_url: string | null;
    hero_image_storage_path: string | null;

    about_image_url: string | null;
    about_image_storage_path: string | null;

    favicon_url: string | null;
    favicon_storage_path: string | null;

    seo_image_url: string | null;
    seo_image_storage_path: string | null;
  };
};

export default function ImagesForm({
  landingPage,
}: ImagesFormProps) {
  return (
    <section>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
          <Images className="h-5 w-5 text-slate-700" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Identidade visual
          </p>

          <h2 className="mt-1 text-xl font-black text-slate-950">
            Imagens da campanha
          </h2>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ImageUploadCard
          imageField="logo"
          title="Logo da campanha"
          description="Utilizada no cabeçalho, rodapé e materiais da página."
          recommendation="Use PNG ou WEBP com fundo transparente. Recomendação: 800 × 400 pixels."
          currentImageUrl={landingPage.logo_url}
          currentStoragePath={landingPage.logo_storage_path}
          aspectRatio="landscape"
        />

        <ImageUploadCard
          imageField="profile_image"
          title="Foto do candidato"
          description="Foto principal utilizada na Hero e apresentação da campanha."
          recommendation="Utilize uma foto profissional, com boa iluminação. Recomendação: 1200 × 1500 pixels."
          currentImageUrl={landingPage.profile_image_url}
          currentStoragePath={
            landingPage.profile_image_storage_path
          }
          aspectRatio="portrait"
        />

        <ImageUploadCard
          imageField="hero_image"
          title="Imagem de destaque"
          description="Imagem principal exibida no topo da Landing Page."
          recommendation="Use uma imagem horizontal de alta qualidade. Recomendação: 1920 × 1080 pixels."
          currentImageUrl={landingPage.hero_image_url}
          currentStoragePath={
            landingPage.hero_image_storage_path
          }
          aspectRatio="wide"
        />

        <ImageUploadCard
          imageField="about_image"
          title="Foto da seção Sobre"
          description="Imagem exibida ao lado da biografia do candidato."
          recommendation="Use uma foto diferente da Hero. Prefira retrato profissional em formato vertical. Recomendação: 1200 × 1500 pixels."
          currentImageUrl={landingPage.about_image_url}
          currentStoragePath={
            landingPage.about_image_storage_path
          }
          aspectRatio="portrait"
        />

        <ImageUploadCard
          imageField="favicon"
          title="Ícone do site"
          description="Pequeno ícone exibido na aba do navegador."
          recommendation="Use uma imagem quadrada, simples e legível. Recomendação: 512 × 512 pixels."
          currentImageUrl={landingPage.favicon_url}
          currentStoragePath={landingPage.favicon_storage_path}
          aspectRatio="square"
        />

        <div className="lg:col-span-2">
          <ImageUploadCard
            imageField="seo_image"
            title="Imagem de compartilhamento"
            description="Imagem exibida ao compartilhar a Landing Page no WhatsApp, Facebook e outras redes."
            recommendation="Recomendação: 1200 × 630 pixels. Evite textos pequenos próximos das bordas."
            currentImageUrl={landingPage.seo_image_url}
            currentStoragePath={
              landingPage.seo_image_storage_path
            }
            aspectRatio="wide"
          />
        </div>
      </div>
    </section>
  );
}