"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const LANDING_PAGE_BUCKET = "landing-pages";
const MAX_IMAGE_SIZE = 15 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

export type LandingPageActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};

type CampaignContext = {
  userId: string;
  campaignId: string;
};

type LandingImageField =
  | "logo"
  | "profile_image"
  | "hero_image"
  | "about_image"
  | "favicon"
  | "seo_image";

type LandingImageConfig = {
  urlColumn:
    | "logo_url"
    | "profile_image_url"
    | "hero_image_url"
    | "about_image_url"
    | "favicon_url"
    | "seo_image_url";

  pathColumn:
    | "logo_storage_path"
    | "profile_image_storage_path"
    | "hero_image_storage_path"
    | "about_image_storage_path"
    | "favicon_storage_path"
    | "seo_image_storage_path";

  folder:
    | "branding"
    | "profile"
    | "hero"
    | "about"
    | "seo";
};

const IMAGE_CONFIG: Record<
  LandingImageField,
  LandingImageConfig
> = {
  logo: {
    urlColumn: "logo_url",
    pathColumn: "logo_storage_path",
    folder: "branding",
  },

  profile_image: {
    urlColumn: "profile_image_url",
    pathColumn: "profile_image_storage_path",
    folder: "profile",
  },

  hero_image: {
    urlColumn: "hero_image_url",
    pathColumn: "hero_image_storage_path",
    folder: "hero",
  },

  about_image: {
    urlColumn: "about_image_url",
    pathColumn: "about_image_storage_path",
    folder: "about",
  },

  favicon: {
    urlColumn: "favicon_url",
    pathColumn: "favicon_storage_path",
    folder: "branding",
  },

  seo_image: {
    urlColumn: "seo_image_url",
    pathColumn: "seo_image_storage_path",
    folder: "seo",
  },
};

function getString(formData: FormData, field: string): string {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getOptionalString(
  formData: FormData,
  field: string
): string | null {
  const value = getString(formData, field);

  return value || null;
}

function getBoolean(formData: FormData, field: string): boolean {
  const value = formData.get(field);

  return value === "true" || value === "on" || value === "1";
}

function normalizeHexColor(
  value: string | null,
  fallback: string
): string {
  if (!value) {
    return fallback;
  }

  const normalized = value.startsWith("#") ? value : `#${value}`;

  if (!/^#[0-9A-Fa-f]{6}$/.test(normalized)) {
    return fallback;
  }

  return normalized.toUpperCase();
}

function normalizeDomain(
  value: string | null
): string | null {
  if (!value) {
    return null;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "");

  return normalized || null;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function sanitizeFileName(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase() || "webp";

  const baseName = fileName
    .replace(/\.[^/.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${baseName || "imagem"}.${extension}`;
}

function validateImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Formato inválido. Envie uma imagem JPG, PNG, WEBP, GIF ou SVG.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "A imagem deve ter no máximo 15 MB.";
  }

  return null;
}

async function getCampaignContext(): Promise<CampaignContext> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Usuário não autenticado.");
  }

 const { data: membership, error: membershipError } = await supabase
  .from("campaign_members")
  .select("campaign_id")
  .eq("user_id", user.id)
  .eq("is_active", true)
  .order("created_at", { ascending: true })
  .limit(1)
  .maybeSingle();

  if (membershipError) {
    throw new Error("Não foi possível identificar a campanha do usuário.");
  }

  if (!membership?.campaign_id) {
    throw new Error("Este usuário não está vinculado a uma campanha.");
  }

  return {
    userId: user.id,
    campaignId: membership.campaign_id,
  };
}

async function createUniqueSlug(
  publicName: string,
  campaignId: string,
  requestedSlug?: string
): Promise<string> {
  const supabase = await createClient();

  const baseSlug =
    slugify(requestedSlug || publicName) ||
    `campanha-${campaignId.slice(0, 8)}`;

  let candidateSlug = baseSlug;
  let counter = 2;

  while (true) {
    const { data, error } = await supabase
      .from("campaign_landing_pages")
      .select("id, campaign_id")
      .eq("slug", candidateSlug)
      .maybeSingle();

    if (error) {
      throw new Error("Não foi possível verificar o endereço da página.");
    }

    if (!data || data.campaign_id === campaignId) {
      return candidateSlug;
    }

    candidateSlug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

async function getLandingPageByCampaign(campaignId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaign_landing_pages")
    .select("*")
    .eq("campaign_id", campaignId)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar a Landing Page.");
  }

  return data;
}

function revalidateLandingPage(slug?: string | null) {
  revalidatePath("/dashboard/landing-page");

  if (slug) {
    revalidatePath(`/c/${slug}`);
  }
}

export async function createLandingPage(
  _previousState: LandingPageActionState,
  formData: FormData
): Promise<LandingPageActionState> {
  try {
    const supabase = await createClient();
    const { userId, campaignId } = await getCampaignContext();

    const publicName = getString(formData, "public_name");
    const requestedSlug = getOptionalString(formData, "slug");

    if (!publicName) {
      return {
        success: false,
        message: "Informe o nome público do candidato.",
        errors: {
          public_name: "O nome público é obrigatório.",
        },
      };
    }

    const existingLandingPage =
      await getLandingPageByCampaign(campaignId);

    if (existingLandingPage) {
      return {
        success: false,
        message: "Esta campanha já possui uma Landing Page.",
      };
    }

    const slug = await createUniqueSlug(
      publicName,
      campaignId,
      requestedSlug || undefined
    );

    const { error } = await supabase
      .from("campaign_landing_pages")
      .insert({
        campaign_id: campaignId,
        public_name: publicName,
        slug,
        political_position: getOptionalString(
          formData,
          "political_position"
        ),
        campaign_number: getOptionalString(
          formData,
          "campaign_number"
        ),
        political_party: getOptionalString(
          formData,
          "political_party"
        ),
        city: getOptionalString(formData, "city"),
        state: getOptionalString(formData, "state"),
        slogan: getOptionalString(formData, "slogan"),
        hero_title:
          getOptionalString(formData, "hero_title") || publicName,
        hero_subtitle: getOptionalString(formData, "hero_subtitle"),
        primary_color: normalizeHexColor(
          getOptionalString(formData, "primary_color"),
          "#0F172A"
        ),
        secondary_color: normalizeHexColor(
          getOptionalString(formData, "secondary_color"),
          "#D4AF37"
        ),
        accent_color: normalizeHexColor(
          getOptionalString(formData, "accent_color"),
          "#FFFFFF"
        ),
        background_color: normalizeHexColor(
          getOptionalString(formData, "background_color"),
          "#FFFFFF"
        ),
        text_color: normalizeHexColor(
          getOptionalString(formData, "text_color"),
          "#0F172A"
        ),
        created_by: userId,
      });

    if (error) {
      console.error("Erro ao criar Landing Page:", error);

      return {
        success: false,
        message: "Não foi possível criar a Landing Page.",
      };
    }

    revalidateLandingPage(slug);

    return {
      success: true,
      message: "Landing Page criada com sucesso.",
    };
  } catch (error) {
    console.error("Erro em createLandingPage:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado.",
    };
  }
}

export async function updateLandingMainInfo(
  _previousState: LandingPageActionState,
  formData: FormData
): Promise<LandingPageActionState> {
  try {
    const supabase = await createClient();
    const { campaignId } = await getCampaignContext();

    const landingPage = await getLandingPageByCampaign(campaignId);

    if (!landingPage) {
      return {
        success: false,
        message: "Landing Page não encontrada.",
      };
    }

    const publicName = getString(formData, "public_name");

    if (!publicName) {
      return {
        success: false,
        message: "Informe o nome público do candidato.",
        errors: {
          public_name: "O nome público é obrigatório.",
        },
      };
    }

    const requestedSlug = getOptionalString(formData, "slug");

    const slug = await createUniqueSlug(
      publicName,
      campaignId,
      requestedSlug || landingPage.slug
    );

    const { error } = await supabase
      .from("campaign_landing_pages")
      .update({
        public_name: publicName,
        slug,
        political_position: getOptionalString(
          formData,
          "political_position"
        ),
        campaign_number: getOptionalString(
          formData,
          "campaign_number"
        ),
        political_party: getOptionalString(
          formData,
          "political_party"
        ),
        city: getOptionalString(formData, "city"),
        state: getOptionalString(formData, "state"),
        slogan: getOptionalString(formData, "slogan"),
        short_biography: getOptionalString(
          formData,
          "short_biography"
        ),
        biography: getOptionalString(formData, "biography"),
        hero_title: getOptionalString(formData, "hero_title"),
        hero_subtitle: getOptionalString(
          formData,
          "hero_subtitle"
        ),
        support_cta_title: getOptionalString(
          formData,
          "support_cta_title"
        ),
        support_cta_description: getOptionalString(
          formData,
          "support_cta_description"
        ),
      })
      .eq("id", landingPage.id)
      .eq("campaign_id", campaignId);

    if (error) {
      console.error("Erro ao atualizar informações:", error);

      return {
        success: false,
        message: "Não foi possível atualizar as informações.",
      };
    }

    revalidateLandingPage(landingPage.slug);

    if (slug !== landingPage.slug) {
      revalidateLandingPage(slug);
    }

    return {
      success: true,
      message: "Informações atualizadas com sucesso.",
    };
  } catch (error) {
    console.error("Erro em updateLandingMainInfo:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado.",
    };
  }
}

export async function updateLandingAppearance(
  _previousState: LandingPageActionState,
  formData: FormData
): Promise<LandingPageActionState> {
  try {
    const supabase = await createClient();
    const { campaignId } = await getCampaignContext();

    const landingPage = await getLandingPageByCampaign(campaignId);

    if (!landingPage) {
      return {
        success: false,
        message: "Landing Page não encontrada.",
      };
    }

    const { error } = await supabase
      .from("campaign_landing_pages")
      .update({
        primary_color: normalizeHexColor(
          getOptionalString(formData, "primary_color"),
          landingPage.primary_color || "#0F172A"
        ),
        secondary_color: normalizeHexColor(
          getOptionalString(formData, "secondary_color"),
          landingPage.secondary_color || "#D4AF37"
        ),
        accent_color: normalizeHexColor(
          getOptionalString(formData, "accent_color"),
          landingPage.accent_color || "#FFFFFF"
        ),
        background_color: normalizeHexColor(
          getOptionalString(formData, "background_color"),
          landingPage.background_color || "#FFFFFF"
        ),
        text_color: normalizeHexColor(
          getOptionalString(formData, "text_color"),
          landingPage.text_color || "#0F172A"
        ),
        show_about: getBoolean(formData, "show_about"),
        show_proposals: getBoolean(formData, "show_proposals"),
        show_news: getBoolean(formData, "show_news"),
        show_agenda: getBoolean(formData, "show_agenda"),
        show_gallery: getBoolean(formData, "show_gallery"),
        show_support_form: getBoolean(
          formData,
          "show_support_form"
        ),
        show_social_links: getBoolean(
          formData,
          "show_social_links"
        ),
      })
      .eq("id", landingPage.id)
      .eq("campaign_id", campaignId);

    if (error) {
      console.error("Erro ao atualizar aparência:", error);

      return {
        success: false,
        message: "Não foi possível atualizar a aparência.",
      };
    }

    revalidateLandingPage(landingPage.slug);

    return {
      success: true,
      message: "Aparência atualizada com sucesso.",
    };
  } catch (error) {
    console.error("Erro em updateLandingAppearance:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado.",
    };
  }
}

export async function updateLandingContactAndSocial(
  _previousState: LandingPageActionState,
  formData: FormData
): Promise<LandingPageActionState> {
  try {
    const supabase = await createClient();
    const { campaignId } = await getCampaignContext();

    const landingPage = await getLandingPageByCampaign(campaignId);

    if (!landingPage) {
      return {
        success: false,
        message: "Landing Page não encontrada.",
      };
    }

    const { error } = await supabase
      .from("campaign_landing_pages")
      .update({
  whatsapp: getOptionalString(formData, "whatsapp"),

  email: getOptionalString(formData, "email"),

  community_group_url: getOptionalString(
    formData,
    "community_group_url"
  ),

  instagram_url: getOptionalString(
    formData,
    "instagram_url"
  ),
        facebook_url: getOptionalString(
          formData,
          "facebook_url"
        ),
        youtube_url: getOptionalString(
          formData,
          "youtube_url"
        ),
        tiktok_url: getOptionalString(
          formData,
          "tiktok_url"
        ),
        x_url: getOptionalString(formData, "x_url"),
      })
      .eq("id", landingPage.id)
      .eq("campaign_id", campaignId);

    if (error) {
      console.error("Erro ao atualizar contatos:", error);

      return {
        success: false,
        message: "Não foi possível atualizar os contatos.",
      };
    }

    revalidateLandingPage(landingPage.slug);

    return {
      success: true,
      message: "Contatos e redes sociais atualizados.",
    };
  } catch (error) {
    console.error("Erro em updateLandingContactAndSocial:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado.",
    };
  }
}

export async function updateLandingSeo(
  _previousState: LandingPageActionState,
  formData: FormData
): Promise<LandingPageActionState> {
  try {
    const supabase = await createClient();
    const { campaignId } = await getCampaignContext();

    const landingPage =
      await getLandingPageByCampaign(campaignId);

    if (!landingPage) {
      return {
        success: false,
        message: "Landing Page não encontrada.",
      };
    }

    const seoTitle = getOptionalString(
      formData,
      "seo_title"
    );

    const seoDescription = getOptionalString(
      formData,
      "seo_description"
    );

    const seoKeywords = getOptionalString(
      formData,
      "seo_keywords"
    );

    const customDomain = normalizeDomain(
      getOptionalString(formData, "custom_domain")
    );

    if (seoTitle && seoTitle.length > 70) {
      return {
        success: false,
        message: "Revise o título SEO.",
        errors: {
          seo_title:
            "O título SEO deve ter no máximo 70 caracteres.",
        },
      };
    }

    if (seoDescription && seoDescription.length > 180) {
      return {
        success: false,
        message: "Revise a descrição SEO.",
        errors: {
          seo_description:
            "A descrição SEO deve ter no máximo 180 caracteres.",
        },
      };
    }

    const { error } = await supabase
      .from("campaign_landing_pages")
      .update({
        seo_title: seoTitle,
        seo_description: seoDescription,
        seo_keywords: seoKeywords,
        custom_domain: customDomain,
      })
      .eq("id", landingPage.id)
      .eq("campaign_id", campaignId);

    if (error) {
      console.error("Erro ao atualizar SEO:", error);

      if (error.code === "23505") {
        return {
          success: false,
          message:
            "Este domínio já está vinculado a outra campanha.",
          errors: {
            custom_domain:
              "Informe outro domínio personalizado.",
          },
        };
      }

      return {
        success: false,
        message:
          "Não foi possível atualizar as configurações de SEO.",
      };
    }

    revalidateLandingPage(landingPage.slug);

    return {
      success: true,
      message:
        "SEO e domínio atualizados com sucesso.",
    };
  } catch (error) {
    console.error("Erro em updateLandingSeo:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado.",
    };
  }
}

export async function uploadLandingImage(
  imageField: LandingImageField,
  formData: FormData
): Promise<LandingPageActionState> {
  try {
    const supabase = await createClient();
    const { campaignId } = await getCampaignContext();

    const landingPage =
      await getLandingPageByCampaign(campaignId);

    if (!landingPage) {
      return {
        success: false,
        message:
          "Crie a Landing Page antes de enviar imagens.",
      };
    }

    const fileValue = formData.get("file");

    if (
      !(fileValue instanceof File) ||
      fileValue.size === 0
    ) {
      return {
        success: false,
        message: "Selecione uma imagem.",
      };
    }

    const validationError = validateImage(fileValue);

    if (validationError) {
      return {
        success: false,
        message: validationError,
      };
    }

    const config = IMAGE_CONFIG[imageField];

    if (!config) {
      return {
        success: false,
        message: "Tipo de imagem inválido.",
      };
    }

    const safeFileName = sanitizeFileName(fileValue.name);

    const storagePath = [
      campaignId,
      config.folder,
      `${crypto.randomUUID()}-${safeFileName}`,
    ].join("/");

    const fileBuffer = await fileValue.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from(LANDING_PAGE_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: fileValue.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      console.error(
        "Erro no upload da imagem:",
        uploadError
      );

      return {
        success: false,
        message: "Não foi possível enviar a imagem.",
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from(LANDING_PAGE_BUCKET)
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData.publicUrl;

    if (!publicUrl) {
      await supabase.storage
        .from(LANDING_PAGE_BUCKET)
        .remove([storagePath]);

      return {
        success: false,
        message:
          "Não foi possível gerar a URL pública da imagem.",
      };
    }

    const previousStoragePath =
      landingPage[config.pathColumn] as string | null;

    const { error: updateError } = await supabase
      .from("campaign_landing_pages")
      .update({
        [config.pathColumn]: storagePath,
        [config.urlColumn]: publicUrl,
      })
      .eq("id", landingPage.id)
      .eq("campaign_id", campaignId);

    if (updateError) {
      await supabase.storage
        .from(LANDING_PAGE_BUCKET)
        .remove([storagePath]);

      console.error(
        "Erro ao salvar dados da imagem:",
        updateError
      );

      return {
        success: false,
        message:
          "A imagem foi enviada, mas não foi possível salvá-la na Landing Page.",
      };
    }

    if (
      previousStoragePath &&
      previousStoragePath !== storagePath
    ) {
      const { error: removeError } =
        await supabase.storage
          .from(LANDING_PAGE_BUCKET)
          .remove([previousStoragePath]);

      if (removeError) {
        console.error(
          "Não foi possível excluir a imagem anterior:",
          removeError
        );
      }
    }

    revalidateLandingPage(landingPage.slug);

    return {
      success: true,
      message: "Imagem atualizada com sucesso.",
    };
  } catch (error) {
    console.error(
      "Erro em uploadLandingImage:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado.",
    };
  }
}

export async function removeLandingImage(
  imageField: LandingImageField
): Promise<LandingPageActionState> {
  try {
    const supabase = await createClient();
    const { campaignId } = await getCampaignContext();

    const landingPage =
      await getLandingPageByCampaign(campaignId);

    if (!landingPage) {
      return {
        success: false,
        message: "Landing Page não encontrada.",
      };
    }

    const config = IMAGE_CONFIG[imageField];

    if (!config) {
      return {
        success: false,
        message: "Tipo de imagem inválido.",
      };
    }

    const storagePath =
      landingPage[config.pathColumn] as string | null;

    const { error: updateError } = await supabase
      .from("campaign_landing_pages")
      .update({
        [config.pathColumn]: null,
        [config.urlColumn]: null,
      })
      .eq("id", landingPage.id)
      .eq("campaign_id", campaignId);

    if (updateError) {
      console.error(
        "Erro ao limpar dados da imagem:",
        updateError
      );

      return {
        success: false,
        message: "Não foi possível remover a imagem.",
      };
    }

    if (storagePath) {
      const { error: removeError } =
        await supabase.storage
          .from(LANDING_PAGE_BUCKET)
          .remove([storagePath]);

      if (removeError) {
        console.error(
          "Os dados foram removidos, mas o arquivo permaneceu no Storage:",
          removeError
        );
      }
    }

    revalidateLandingPage(landingPage.slug);

    return {
      success: true,
      message: "Imagem removida com sucesso.",
    };
  } catch (error) {
    console.error(
      "Erro em removeLandingImage:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado.",
    };
  }
}

export async function toggleLandingPublication(): Promise<LandingPageActionState> {
  try {
    const supabase = await createClient();
    const { campaignId } = await getCampaignContext();

    const landingPage = await getLandingPageByCampaign(campaignId);

    if (!landingPage) {
      return {
        success: false,
        message: "Landing Page não encontrada.",
      };
    }

    const willPublish = !landingPage.is_published;

    const { error } = await supabase
      .from("campaign_landing_pages")
      .update({
        is_published: willPublish,
        published_at: willPublish ? new Date().toISOString() : null,
      })
      .eq("id", landingPage.id)
      .eq("campaign_id", campaignId);

    if (error) {
      console.error("Erro ao alterar publicação:", error);

      return {
        success: false,
        message: "Não foi possível alterar a publicação.",
      };
    }

    revalidateLandingPage(landingPage.slug);

    return {
      success: true,
      message: willPublish
        ? "Landing Page publicada com sucesso."
        : "Landing Page retirada do ar.",
    };
  } catch (error) {
    console.error("Erro em toggleLandingPublication:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado.",
    };
  }
}